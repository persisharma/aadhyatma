#!/usr/bin/env python3
"""Hash native/bundle inputs, excluding UI-driver-only files for fixture reuse."""
import hashlib, subprocess, sys
ref = sys.argv[1] if len(sys.argv) > 1 else 'HEAD'
rows = subprocess.check_output(['git', 'ls-tree', '-rz', ref, 'mobile'], cwd='..').split(b'\0')
drivers = {
 b'mobile/scripts/native-store-update-ios.sh',
 b'mobile/scripts/native-store-update-matrix.sh',
 b'mobile/scripts/native-store-update-seed.py',
 b'mobile/scripts/native-store-update-fingerprint.py',
}
kept = []
for row in rows:
 if not row: continue
 path = row.split(b'\t', 1)[1]
 if path.startswith(b'mobile/.maestro/') or path in drivers: continue
 kept.append(row + b'\0')
print(hashlib.sha256(b''.join(kept)).hexdigest())
