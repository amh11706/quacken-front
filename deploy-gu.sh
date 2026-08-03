#!/usr/bin/env bash
# Deploy the quacken-front production build to the 'gu' FTP host over FTPS.
#
# This is a second deploy target. The main deploy pushes to the SSH host via
# rsync; this script pushes the same dist/ over FTPS instead.
#
# Credentials and TLS settings come from your local lftp config.
#
# Transfers are incremental: lftp skips a file when size and mtime both match.
# Use --size-only after a fresh checkout if local mtimes make everything look
# changed.

set -euo pipefail

readonly HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly BOOKMARK=gu
readonly LOCAL_DIR="$HERE/dist"

# Default remote docroot for the live build.
readonly DEFAULT_REMOTE=public_html

# index.html is uploaded under a temp name and then renamed into place.
readonly TMP_INDEX=".index.html.new"

# Entries that live in the docroot but are not part of the build.
readonly -a KEEP=(
    ".htaccess"
    ".well-known"
    "cgi-bin"
    ".ftpquota"
    "error_log"
    "old"
)

usage () {
    cat <<EOF
Usage: $(basename "$0") <command> [options]

  ls [remote-path]         List a remote directory (default: the account home,
                           which is where this FTP user lands)
  dry-run [remote-path]    Show exactly what would transfer, changing nothing
  push [remote-path]       Upload dist/ to remote-path
  build                    Run the production build only

remote-path defaults to '$DEFAULT_REMOTE' (the verified docroot) for dry-run
and push. 'ls' with no path lists the account home instead.

Options for dry-run and push:
  --delete                 Also remove remote files that no longer exist
                           locally (stale hashed Angular chunks). Protected
                           entries are never deleted: ${KEEP[*]}
  --build                  Run the production build first
  --size-only              Compare size only, ignoring mtime. Use after a fresh
                           clone, where new local mtimes make every file look
                           changed. Won't catch same-size edits.
  --yes                    Skip the confirmation prompt. Intended for
                           deploy-front.sh, which confirms once for both
                           targets before calling this.

Transfers are incremental by default: unchanged files are skipped on size+mtime,
so routine deploys move only rebuilt JS, not the 17MB of assets.

A push runs in three phases so the live site is never broken mid-deploy:
everything except index.html, then index.html (atomic rename), then deletions
last. See the comment on do_mirror for why that order is required.

Examples:
  $(basename "$0") ls
  $(basename "$0") ls $DEFAULT_REMOTE
  $(basename "$0") dry-run
  $(basename "$0") push --build --delete

Note: this FTP account logs in to the cPanel HOME directory, not the web root.
Never push to '.' or '/' -- that is the home, alongside .ssh/, mail/ and
.cpanel/. Always target $DEFAULT_REMOTE (or another explicit subdirectory).
EOF
}

# lftp exclusions for the protected entries, used only when --delete is on.
keep_args () {
    local k
    for k in "${KEEP[@]}"; do
        printf -- '--exclude-glob %s --exclude-glob %s/ ' "$k" "$k"
    done
}

require_lftp () {
    command -v lftp >/dev/null 2>&1 || {
        echo "error: lftp is not installed (sudo apt install lftp)" >&2
        exit 1
    }
    if [ ! -f "$HOME/.netrc" ]; then
        echo "error: ~/.netrc not found; lftp has no credentials for $BOOKMARK" >&2
        exit 1
    fi
}

require_build () {
    if [ ! -d "$LOCAL_DIR" ]; then
        echo "error: $LOCAL_DIR does not exist -- run '$(basename "$0") build' first" >&2
        exit 1
    fi
    if [ ! -f "$LOCAL_DIR/index.html" ]; then
        echo "error: $LOCAL_DIR has no index.html; is that really the build output?" >&2
        exit 1
    fi
}

cmd_build () {
    echo "==> building (ng build --configuration=production)"
    ( cd "$HERE" && npm run build )
    require_build
    echo "==> built $(find "$LOCAL_DIR" -type f | wc -l) files, $(du -sh "$LOCAL_DIR" | cut -f1)"
}

cmd_ls () {
    require_lftp
    local path="${1:-}"
    echo "==> listing ${path:-/} on $BOOKMARK"
    # Tolerate a non-zero status here so empty directories still list cleanly.
    lftp -e "cls -l ${path:+\"$path\"}; bye" "$BOOKMARK" || true
}

# Deploy in three ordered phases so the live site is never serving a broken
# build partway through.
#
# $1 = remote path, $2 = "dry"|"real", $3 = delete flag, $4 = size-only flag
do_mirror () {
    local remote="$1" mode="$2" want_delete="$3" size_only="${4:-0}"
    require_lftp
    require_build

    # --continue resumes a partially transferred file instead of restarting it.
    local -a base=(--reverse --continue --no-perms --parallel=4 --verbose)
    [ "$mode" = "dry" ] && base+=(--dry-run)
    # lftp's flag is --ignore-time; exposed as --size-only to match rsync naming.
    [ "$size_only" = "1" ] && base+=(--ignore-time)

    echo "==> mirror ${mode}: $LOCAL_DIR  ->  $BOOKMARK:$remote"

    echo "--> [1/3] everything except index.html, no deletions"
    lftp -e "mirror ${base[*]} --exclude-glob index.html \"$LOCAL_DIR\" \"$remote\"; bye" "$BOOKMARK"

    echo "--> [2/3] index.html via temp name + atomic rename"
    if [ "$mode" = "dry" ]; then
        echo "    would upload index.html as $TMP_INDEX, then rename to index.html"
    else
        lftp -e "put -c \"$LOCAL_DIR/index.html\" -o \"$remote/$TMP_INDEX\"; \
                 mv \"$remote/$TMP_INDEX\" \"$remote/index.html\"; bye" "$BOOKMARK"
        echo "    index.html switched"
    fi

    if [ "$want_delete" != "1" ]; then
        echo "--> [3/3] skipped: --delete not requested, stale files left in place"
        return 0
    fi

    # Phases 1 and 2 already matched every local file, so this pass transfers
    # nothing and is effectively deletion-only.
    echo "--> [3/3] removing stale files (protecting: ${KEEP[*]})"
    # shellcheck disable=SC2046
    lftp -e "mirror ${base[*]} --delete $(keep_args) \"$LOCAL_DIR\" \"$remote\"; bye" "$BOOKMARK"
}

cmd_push () {
    local remote="$1" want_delete="$2" want_build="$3" size_only="${4:-0}" assume_yes="${5:-0}"
    [ "$want_build" = "1" ] && cmd_build
    require_build

    if [ "$assume_yes" != "1" ]; then
        echo
        echo "About to upload to $BOOKMARK:$remote"
        [ "$want_delete" = "1" ] && echo "Remote files absent locally WILL BE DELETED (except: ${KEEP[*]})"
        read -r -p "Proceed? [y/N] " reply
        case "$reply" in
            [yY]*) ;;
            # Non-zero so a caller chaining this can tell a decline from a success.
            *) echo "aborted"; return 2 ;;
        esac
    fi
    do_mirror "$remote" real "$want_delete" "$size_only"
    echo "==> done"
}

main () {
    local cmd="${1:-}"; shift || true
    local remote="" want_delete=0 want_build=0 size_only=0 assume_yes=0
    local a
    for a in "$@"; do
        case "$a" in
            --delete) want_delete=1 ;;
            --build)  want_build=1 ;;
            --size-only) size_only=1 ;;
            --yes|-y) assume_yes=1 ;;
            -*) echo "error: unknown option '$a'" >&2; exit 1 ;;
            *)  [ -z "$remote" ] && remote="$a" || { echo "error: unexpected argument '$a'" >&2; exit 1; } ;;
        esac
    done

    case "$cmd" in
        build) cmd_build ;;
        ls)    cmd_ls "$remote" ;;
        dry-run)
            do_mirror "${remote:-$DEFAULT_REMOTE}" dry "$want_delete" "$size_only" ;;
        push)
            remote="${remote:-$DEFAULT_REMOTE}"
                # Guard against targeting the account home, where --delete would be
                # ruinous.
            case "$remote" in
                .|/|./|"~"|"$HOME")
                    echo "error: refusing to target '$remote' -- use $DEFAULT_REMOTE instead" >&2
                    exit 1 ;;
            esac
            cmd_push "$remote" "$want_delete" "$want_build" "$size_only" "$assume_yes" ;;
        ""|-h|--help|help) usage ;;
        *) echo "error: unknown command '$cmd'" >&2; echo; usage; exit 1 ;;
    esac
}

main "$@"
