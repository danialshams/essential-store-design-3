#!/usr/bin/env bash
set -euo pipefail
test -s public/models/airpods-max-4k-opaque.glb
mkdir -p public/models
npx --yes @gltf-transform/cli@4.5.1 resize public/models/airpods-max-4k-opaque.glb /tmp/airpods-instant-512.glb --width 512 --height 512
npx --yes @gltf-transform/cli@4.5.1 webp /tmp/airpods-instant-512.glb /tmp/airpods-instant-webp.glb --quality 78
npx --yes @gltf-transform/cli@4.5.1 draco /tmp/airpods-instant-webp.glb public/models/airpods-max-instant.glb
test -s public/models/airpods-max-instant.glb
ls -lh public/models/airpods-max-instant.glb
