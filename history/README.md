# History Tracking & Audit Storage

This folder contains immutable historical records for enterprise traceability.

## Subfolders
- `reports/` report versions and exports metadata
- `ai_analysis/` AI inference history and confidence data
- `commits/` tracked code change snapshots
- `test_reports/` baseline and latest QA report snapshots
- `user_logs/` user activity history
- `audit_logs/` security and compliance events

## Policy
- Append-only writes for history files.
- Deletion must be restricted to authorized administrators.
- No sensitive plaintext secrets in persisted history.
