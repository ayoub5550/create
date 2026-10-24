#!/usr/bin/env bash
# Build this part (see films/film1/common/build_part.sh).  bash build.sh [--shots] [--clips]
exec bash "$(dirname "$0")/../../common/build_part.sh" "$(dirname "$0")" "$@"
