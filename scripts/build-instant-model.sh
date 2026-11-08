#!/usr/bin/env bash
set -euo pipefail
test -s public/models/airpods-max-4k-opaque.glb
mkdir -p public/models
npx --yes @gltf-transform/cli@4.5.1 resize public/models/airpods-max-4k-opaque.glb /tmp/airpods-instant-1024.glb --width 1024 --height 1024
npx --yes @gltf-transform/cli@4.5.1 webp /tmp/airpods-instant-1024.glb /tmp/airpods-instant-webp.glb --quality 80
npx --yes @gltf-transform/cli@4.5.1 draco /tmp/airpods-instant-webp.glb public/models/airpods-max-instant.glb
test -s public/models/airpods-max-instant.glb
ls -lh public/models/airpods-max-instant.glb
