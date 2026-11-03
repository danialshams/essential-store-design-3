"""Fetch verified CC0 3D pasta and physical texture assets for the Blender single-frame QA render."""
from pathlib import Path
import hashlib,json,urllib.request,sys
out=Path(sys.argv[1]) if len(sys.argv)>1 else Path("assets/pasta")
out.mkdir(parents=True,exist_ok=True)
def fetch(url,path,expected=None):
    req=urllib.request.Request(url,headers={"User-Agent":"PastaCyclesR&D/1.0"})
    with urllib.request.urlopen(req,timeout=80) as r: data=r.read()
    if len(data)<1000: raise RuntimeError(f"Unexpectedly small download: {url}")
    digest=hashlib.sha256(data).hexdigest()
    if expected and expected!=digest: raise ValueError(f"Source checksum mismatch for {path.name}: expected {expected} got {digest}")
    path.write_bytes(data)
    print("Downloaded",path,len(data),"SHA256",digest,flush=True)
    return path
model_url="https://www.innerscene.com/api/library/plate-of-pasta-dbabea81/download"
model=fetch(model_url,out/"plate-of-pasta.glb",expected="899cfd3820e745adfcee13e4f9d98de56e193a7e9f338e2bb2fbd8225a5e6b6a")
if model.read_bytes()[:4] != b'glTF':raise RuntimeError("Source is not a GLB")
fetch("https://www.innerscene.com/api/library/plate-of-pasta-dbabea81/preview",out/"source-preview.jpg")
def api(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"PastaCyclesR&D/1.0"}),timeout=30) as r: return json.load(r)
textures=api("https://api.polyhaven.com/files/wood_table")
for key,name in [("Diffuse","wood_diff.jpg"),("nor_gl","wood_nor.jpg"),("Rough","wood_rough.jpg")]:
    formats=textures[key].get("2k") or textures[key].get("1k")
    fileinfo=formats.get("jpg") or formats.get("png")
    if not fileinfo:raise RuntimeError(f"Missing texture {key}")
    fetch(fileinfo["url"],out/name)
hdr=api("https://api.polyhaven.com/files/warm_restaurant")["hdri"]
chosen=hdr.get("2k") or hdr.get("1k") or hdr.get("4k")
fetch(chosen["hdr"]["url"],out/"restaurant.hdr")
(out/"LICENSE-SOURCES.txt").write_text(
    "Source model: Innerscene Original, plate of pasta, CC0 public domain.\n"
    "https://www.innerscene.com/tools/library/3d-parts/plate-of-pasta-dbabea81\n"
    "Wood Table PBR and Warm Restaurant HDRI: Poly Haven, CC0 public domain.\n"
    "https://polyhaven.com/a/wood_table\nhttps://polyhaven.com/a/warm_restaurant\n",
    encoding="utf8")
print("ASSET PREPARATION COMPLETE",flush=True)
