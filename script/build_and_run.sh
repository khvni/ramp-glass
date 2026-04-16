#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-run}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESKTOP_DIR="$ROOT_DIR/apps/desktop"
TAURI_DIR="$DESKTOP_DIR/src-tauri"
DIST_DIR="$ROOT_DIR/dist"
APP_NAME="Tinker"
BINARY_NAME="tinker-desktop"
BUNDLE_ID="com.khvni.tinker"
SOURCE_BUNDLE="$TAURI_DIR/target/release/bundle/macos/$APP_NAME.app"
STAGED_BUNDLE="$DIST_DIR/$APP_NAME.app"
SOURCE_BINARY="$SOURCE_BUNDLE/Contents/MacOS/$BINARY_NAME"
STAGED_BINARY="$STAGED_BUNDLE/Contents/MacOS/$BINARY_NAME"

require_command() {
  local command_name="$1"

  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "missing required command: $command_name" >&2
    exit 1
  fi
}

kill_app() {
  pkill -x "$BINARY_NAME" >/dev/null 2>&1 || true
}

wait_for_exit() {
  local deadline_seconds="$1"
  local start_seconds
  start_seconds="$(date +%s)"

  while pgrep -x "$BINARY_NAME" >/dev/null 2>&1; do
    if [ $(( "$(date +%s)" - start_seconds )) -ge "$deadline_seconds" ]; then
      echo "timed out waiting for $APP_NAME to exit" >&2
      exit 1
    fi
    sleep 1
  done
}

wait_for_start() {
  local deadline_seconds="$1"
  local start_seconds
  start_seconds="$(date +%s)"

  while ! pgrep -x "$BINARY_NAME" >/dev/null 2>&1; do
    if [ $(( "$(date +%s)" - start_seconds )) -ge "$deadline_seconds" ]; then
      echo "timed out waiting for $APP_NAME to start" >&2
      exit 1
    fi
    sleep 1
  done
}

build_app() {
  require_command pnpm
  (
    cd "$DESKTOP_DIR"
    pnpm tauri build
  )

  if [ ! -x "$SOURCE_BINARY" ]; then
    echo "built app missing: $SOURCE_BINARY" >&2
    exit 1
  fi

  require_command cp
  rm -rf "$STAGED_BUNDLE"
  mkdir -p "$DIST_DIR"
  cp -R "$SOURCE_BUNDLE" "$DIST_DIR/"
  cp "$ROOT_DIR/opencode.json" "$STAGED_BUNDLE/Contents/Resources/opencode.json"

  if [ ! -x "$STAGED_BINARY" ]; then
    echo "staged app missing: $STAGED_BINARY" >&2
    exit 1
  fi
}

open_app() {
  require_command open
  /usr/bin/open -n "$STAGED_BUNDLE"
}

stream_logs() {
  require_command log
  /usr/bin/log stream --info --style compact --predicate "process == \"$BINARY_NAME\""
}

stream_telemetry() {
  require_command log
  /usr/bin/log stream --info --style compact --predicate "subsystem == \"$BUNDLE_ID\""
}

case "$MODE" in
  run)
    kill_app
    wait_for_exit 10
    build_app
    open_app
    ;;
  --debug|debug)
    require_command lldb
    kill_app
    wait_for_exit 10
    build_app
    lldb -- "$STAGED_BINARY"
    ;;
  --logs|logs)
    kill_app
    wait_for_exit 10
    build_app
    open_app
    stream_logs
    ;;
  --telemetry|telemetry)
    kill_app
    wait_for_exit 10
    build_app
    open_app
    stream_telemetry
    ;;
  --verify|verify)
    require_command pgrep
    kill_app
    wait_for_exit 10
    build_app
    open_app
    wait_for_start 30
    ;;
  --help|-h|help)
    cat <<EOF
usage: $0 [run|--debug|--logs|--telemetry|--verify]
EOF
    ;;
  *)
    echo "usage: $0 [run|--debug|--logs|--telemetry|--verify]" >&2
    exit 2
    ;;
esac
