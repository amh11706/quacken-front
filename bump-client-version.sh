#!/usr/bin/env bash
# Bump the websocket client version in lockstep across the front end and the
# backend.
#
# The client and server version constants must always agree. Bumping them is
# what forces connected browsers to pick up a new build.
#
# This script edits the sibling backend checkout. Override the location with
# QUACKGO_DIR if your checkout is elsewhere.

set -euo pipefail

readonly HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly QUACKGO_DIR="${QUACKGO_DIR:-$(cd "$HERE/.." && pwd)/quackgo}"

readonly TS_FILE="$HERE/src/app/ws/ws.service.ts"
readonly GO_FILE="$QUACKGO_DIR/wsserver.go"

# Anchored so they cannot match a comment, a string, or an unrelated constant.
readonly TS_RE='^const ClientVersion = [0-9]+;$'
readonly GO_RE='^const clientVersion = [0-9]+$'

usage () {
    cat <<EOF
Usage: $(basename "$0") [new-version] [--dry-run]

With no version, bumps the current value by 1.

  new-version   Explicit integer to set instead of current+1
  --dry-run     Report what would change without writing

Files kept in sync:
  $TS_FILE
  $GO_FILE

Set QUACKGO_DIR to point at a quackgo checkout elsewhere.
EOF
}

# Print the version found in a file, or fail loudly. Requires exactly one match.
read_version () {
    local file="$1" regex="$2" label="$3"
    if [ ! -f "$file" ]; then
        echo "error: $label not found at $file" >&2
        [ "$label" = "wsserver.go" ] && echo "       set QUACKGO_DIR if your backend checkout is elsewhere" >&2
        exit 1
    fi
    local count
    count=$(grep -cE "$regex" "$file" || true)
    if [ "$count" -ne 1 ]; then
        echo "error: expected exactly 1 version declaration in $label, found $count" >&2
        echo "       pattern: $regex" >&2
        exit 1
    fi
    grep -oE "$regex" "$file" | grep -oE '[0-9]+'
}

main () {
    local new_version="" dry_run=0 a
    for a in "$@"; do
        case "$a" in
            --dry-run) dry_run=1 ;;
            -h|--help|help) usage; exit 0 ;;
            ''|*[!0-9]*) echo "error: unrecognised argument '$a'" >&2; echo; usage; exit 1 ;;
            *) new_version="$a" ;;
        esac
    done

    local ts_cur go_cur
    ts_cur=$(read_version "$TS_FILE" "$TS_RE" "ws.service.ts")
    go_cur=$(read_version "$GO_FILE" "$GO_RE" "wsserver.go")

    if [ "$ts_cur" != "$go_cur" ]; then
        echo "error: versions are already out of sync -- refusing to guess" >&2
        echo "       ws.service.ts: $ts_cur" >&2
        echo "       wsserver.go:   $go_cur" >&2
        echo "       pass an explicit version to force both to the same value" >&2
        [ -z "$new_version" ] && exit 1
        echo "       (continuing: explicit version $new_version given)" >&2
    fi

    if [ -z "$new_version" ]; then
        new_version=$(( ts_cur + 1 ))
    elif [ "$new_version" -le "$ts_cur" ] 2>/dev/null; then
        # Going backwards can lock out clients that already have a newer build.
        echo "warning: $new_version is not greater than the current $ts_cur" >&2
        read -r -p "Set it anyway? [y/N] " reply
        case "$reply" in [yY]*) ;; *) echo "aborted"; exit 0 ;; esac
    fi

    if [ "$ts_cur" = "$go_cur" ]; then
        echo "client version: $ts_cur -> $new_version"
    else
        # Don't imply a single "from" value when the two sides disagree.
        echo "client version: ws.service.ts $ts_cur, wsserver.go $go_cur -> both $new_version"
    fi
    echo "  $TS_FILE"
    echo "  $GO_FILE"

    if [ "$dry_run" = "1" ]; then
        echo
        echo "(dry run -- nothing written)"
        return 0
    fi

    # Write both files separately; the guards above already established each
    # has exactly one matching line.
    sed -i -E "s/^const ClientVersion = [0-9]+;$/const ClientVersion = ${new_version};/" "$TS_FILE"
    sed -i -E "s/^const clientVersion = [0-9]+$/const clientVersion = ${new_version}/"   "$GO_FILE"

    # Verify rather than assume the substitutions landed.
    local ts_new go_new
    ts_new=$(read_version "$TS_FILE" "$TS_RE" "ws.service.ts")
    go_new=$(read_version "$GO_FILE" "$GO_RE" "wsserver.go")
    if [ "$ts_new" != "$new_version" ] || [ "$go_new" != "$new_version" ]; then
        echo "error: verification failed after write (ts=$ts_new go=$go_new)" >&2
        exit 1
    fi

    echo
    echo "updated and verified: both now $new_version"
    echo
    echo "Two deploys are now required, front end first:"
    echo "  1. here:            npm run deploy:front"
    echo "  2. in backend repo:  make deploy-back"
    echo
    echo "Order matters. Shipping the front end first avoids a reload landing on a"
    echo "build the backend still rejects."
    echo
    echo "'npm run release:front' covers step 1 only. Step 2 lives in the backend"
    echo "repo on purpose."
}

main "$@"
