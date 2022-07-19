#!/usr/bin/env bash
BASE=$(dirname -- "$0")
rm -f "$BASE/../dist/web/config.json"
cp "$BASE/../"{README.md,LICENSE,CHANGELOG.md} "$BASE/../dist/web/"

