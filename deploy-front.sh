#!/usr/bin/env bash
# Deploy one build of quacken-front to both front-end targets.
#
# The two targets serve the same app and should always carry the same build,
# so this script makes that the easy path:
#
#   - Builds once and ships the same dist/ to both.
#   - Preflights both targets before writing to either.
#   - Confirms once, then runs both non-interactively.
#   - Reports a mismatch if the second push fails after the first succeeds.
#
# This deliberately does NOT touch the backend deploy.

set -euo pipefail

readonly HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOCAL_DIR="$HERE/dist"
readonly SSH_HOST=quacken
readonly GU_SCRIPT="$HERE/deploy-gu.sh"

usage () {
    cat <<EOF
Usage: $(basename "$0") [options]

Builds once and deploys the same dist/ to both front-end servers.

  --no-build     Deploy the existing dist/ without rebuilding
  --dry-run      Show what each target would receive, change nothing
  --delete       Remove remote files no longer present locally (both targets)
  --size-only    On the FTP target, compare size only, ignoring mtime
  --yes          Skip the confirmation prompt
  -h, --help     This message

Targets:
  $SSH_HOST (rsync over SSH)
  gu       (FTPS, via deploy-gu.sh)

The Go backend is not touched. After a version bump, deploy the front end with
this script first, then run 'make deploy-back' in the quackgo repo.
EOF
}

require_build () {
    if [ ! -d "$LOCAL_DIR" ] || [ ! -f "$LOCAL_DIR/index.html" ]; then
        echo "error: $LOCAL_DIR is missing or has no index.html" >&2
        echo "       drop --no-build, or run 'npm run build' first" >&2
        exit 1
    fi
}

# Fail before writing anything if either target is unreachable.
preflight () {
    echo "==> preflight: checking both targets before writing to either"

    command -v rsync >/dev/null 2>&1 || { echo "error: rsync not installed" >&2; exit 1; }
    command -v lftp  >/dev/null 2>&1 || { echo "error: lftp not installed" >&2; exit 1; }
    [ -x "$GU_SCRIPT" ] || { echo "error: $GU_SCRIPT missing or not executable" >&2; exit 1; }

    if ! ssh -o BatchMode=yes -o ConnectTimeout=10 "$SSH_HOST" true 2>/dev/null; then
        echo "error: cannot reach '$SSH_HOST' over SSH (BatchMode, 10s timeout)" >&2
        echo "       check ~/.ssh/config and that the key is loaded" >&2
        exit 1
    fi
    echo "    $SSH_HOST: reachable"

    if ! lftp -e 'cls public_html/ >/dev/null; bye' gu >/dev/null 2>&1; then
        echo "error: cannot log in to the 'gu' FTP host or read public_html/" >&2
        echo "       check ~/.netrc and ~/.lftprc" >&2
        exit 1
    fi
    echo "    gu: reachable, public_html readable"
}

main () {
    local want_build=1 dry_run=0 want_delete=0 size_only=0 assume_yes=0 a
    for a in "$@"; do
        case "$a" in
            --no-build)  want_build=0 ;;
            --dry-run)   dry_run=1 ;;
            --delete)    want_delete=1 ;;
            --size-only) size_only=1 ;;
            --yes|-y)    assume_yes=1 ;;
            -h|--help|help) usage; exit 0 ;;
            *) echo "error: unknown option '$a'" >&2; echo; usage; exit 1 ;;
        esac
    done

    if [ "$want_build" = "1" ] && [ "$dry_run" = "0" ]; then
        echo "==> building once for both targets"
        ( cd "$HERE" && npm run build )
    fi
    require_build
    echo "==> dist: $(find "$LOCAL_DIR" -type f | wc -l) files, $(du -sh "$LOCAL_DIR" | cut -f1)"

    preflight

    # Mirror the original deploy flags.
    local -a rsync_opts=(-auz --human-readable)
    [ "$want_delete" = "1" ] && rsync_opts+=(--delete)

    local -a gu_opts=(push --yes)
    [ "$want_delete" = "1" ] && gu_opts+=(--delete)
    [ "$size_only" = "1" ]   && gu_opts+=(--size-only)

    if [ "$dry_run" = "1" ]; then
        echo
        echo "==> DRY RUN: $SSH_HOST (rsync)"
        rsync "${rsync_opts[@]}" --dry-run --itemize-changes "$LOCAL_DIR" "$SSH_HOST:" \
            | tail -20 || true
        echo
        echo "==> DRY RUN: gu (FTPS)"
        local -a gu_dry=(dry-run)
        [ "$want_delete" = "1" ] && gu_dry+=(--delete)
        [ "$size_only" = "1" ]   && gu_dry+=(--size-only)
        "$GU_SCRIPT" "${gu_dry[@]}" | tail -20 || true
        echo
        echo "(dry run -- neither target was modified)"
        return 0
    fi

    if [ "$assume_yes" != "1" ]; then
        echo
        echo "About to deploy the SAME build to both front-end servers:"
        echo "  1. $SSH_HOST:~/dist        (rsync over SSH)"
        echo "  2. gu:public_html          (FTPS)"
        [ "$want_delete" = "1" ] && echo "--delete is ON: remote files absent locally will be removed"
        read -r -p "Proceed? [y/N] " reply
        case "$reply" in [yY]*) ;; *) echo "aborted"; exit 2 ;; esac
    fi

    # Track which succeeded so a partial failure can be reported precisely.
    local ssh_ok=0 gu_ok=0

    echo
    echo "==> [1/2] $SSH_HOST via rsync"
    if rsync "${rsync_opts[@]}" "$LOCAL_DIR" "$SSH_HOST:"; then
        ssh_ok=1
        echo "    $SSH_HOST: OK"
    else
        echo "    $SSH_HOST: FAILED" >&2
    fi

    echo
    echo "==> [2/2] gu via FTPS"
    if "$GU_SCRIPT" "${gu_opts[@]}"; then
        gu_ok=1
        echo "    gu: OK"
    else
        echo "    gu: FAILED" >&2
    fi

    echo
    if [ "$ssh_ok" = "1" ] && [ "$gu_ok" = "1" ]; then
        echo "==> both front-end servers now carry the same build"
        echo "    If you bumped the client version, deploy the backend next:"
        echo "    cd ../quackgo && make deploy-back"
        return 0
    fi

    echo "!! MISMATCH: the two front-end servers are NOT in sync" >&2
    echo "   $SSH_HOST: $([ "$ssh_ok" = 1 ] && echo updated || echo 'NOT updated')" >&2
    echo "   gu:       $([ "$gu_ok"  = 1 ] && echo updated || echo 'NOT updated')" >&2
    echo "   Re-run with --no-build once the failure is resolved; the successful" >&2
    echo "   target is a no-op second time (both deploys are incremental)." >&2
    return 1
}

main "$@"
