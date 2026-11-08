#!/usr/bin/env bash
set -euo pipefail
test -s airpods-max-4k.glb
mkdir -p public/models
npx --yes @gltf-transform/cli resize airpods-max-4k.glb /tmp/airpods-2k.glb --width 2048 --height 2048
npx --yes @gltf-transform/cli webp /tmp/airpods-2k.glb public/models/airpods-max-web.glb --quality 87
npx --yes @gltf-transform/cli resize airpods-max-4k.glb /tmp/airpods-1k.glb --width 1024 --height 1024
npx --yes @gltf-transform/cli webp /tmp/airpods-1k.glb public/models/airpods-max-mobile.glb --quality 83
test -s public/models/airpods-max-web.glb
test -s public/models/airpods-max-mobile.glb
ls -lh public/models/airpods-max-{web,mobile}.glb

