# Blender pasta proof (isolated experiment)

This experiment **renders real 3D geometry in Blender Cycles**, instead of moving still photos or DOM image layers. Source lives in \`blender/pasta_scene.py\`; GitHub Actions workflow is \`.github/workflows/blender-pasta-proof.yml\`. It does not replace the website or modify the production branch.

- Real meshes and curves: ceramic bowl, procedural spaghetti strands, tomato/meat sauce, cheese flakes, tomato pieces and basil.
- Independent ingredient parent groups move vertically into an exploded view on timeline frames 6–20.
- Cinematic camera and light animation.
- Output: editable \`pasta-proof.blend\`, 24 PNG frames, \`real-blender-pasta-preview.mp4\`, and machine-readable \`manifest.json\`.
- Rendering: Blender Cycles CPU, 720×432, 12 samples, 24 frames @ 12fps. Intentionally small to validate the pipeline without burning excessive CI minutes.
- IMPORTANT: this is a **procedural pipeline test, not cinematic photoreal food**. A premium result will require high-quality meshes, shaders, realistic steam and cheese simulations, 100+ frames and possibly better render hardware. Rendering true 3D does not by itself guarantee cinematic quality.

## Run
Push to \`experiment/blender-pasta-proof-20261103\` or invoke the workflow manually once it is available on the repository's default branch. Download the resulting \`pasta-real-3d-proof\` GitHub Actions artifact.

## Security
No secrets or external paid providers are needed. Workflow uses standard GitHub-hosted Ubuntu runner. Does not deploy or change storefront/admin services.
