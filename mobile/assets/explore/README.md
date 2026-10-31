# Explore artwork integrity

The public manifest contains only shipped asset names, dimensions, byte counts,
crop bounds and SHA-256 fingerprints. Account-scoped source identifiers and
private provenance references are deliberately excluded from this repository.
The approved source review package retains the original master audit.

This clarifies the provenance references in design.md section 86 and RULEBOOK:
the public manifest pins shipped bytes; source provenance stays in the owner
review package. The independent bundle budget is 1.5MB.
