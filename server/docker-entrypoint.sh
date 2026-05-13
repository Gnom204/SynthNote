#!/bin/sh
set -e
D="${UPLOAD_DIR:-/app/uploads}"
mkdir -p "$D"
chown -R appuser:appuser "$D"
exec gosu appuser "$@"
