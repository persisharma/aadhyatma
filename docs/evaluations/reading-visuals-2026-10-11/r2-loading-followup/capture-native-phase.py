"""Read-only QA-artifact snapshot, including native download observer and file identity."""
import argparse, hashlib, json
from pathlib import Path
parser = argparse.ArgumentParser()
parser.add_argument("--container", required=True)
parser.add_argument("--phase", required=True)
args = parser.parse_args()
documents = Path(args.container) / "Documents"
audit = json.loads((documents / "r2-qa-audit.json").read_text())
files = []
for path in sorted((documents / "reading-backgrounds").glob("*")):
    stat = path.stat()
    files.append({"name": path.name, "bytes": stat.st_size,
                  "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                  "mtimeNs": stat.st_mtime_ns, "inode": stat.st_ino})
report = {"phase": args.phase, "audit": audit, "files": files}
output = Path(__file__).with_name("native-" + args.phase + ".json")
output.write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps({"output": str(output), "downloads": [x for x in audit["events"] if x["kind"].startswith("native")], "files": len(files)}, indent=2))
