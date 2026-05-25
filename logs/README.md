# Logging Standards

This folder contains operational and compliance logs for IHMS.

## Log Categories
- `activity/` user and workflow activity logs
- `api/` API request, response, performance, and failures
- `audit/` data and access audit trails
- `security/` authentication and security monitoring logs
- `monitoring/` infrastructure and uptime metrics
- `error/` application and integration error logs

## Operational Rules
- Rotate logs using deployment-level log rotation.
- Avoid writing secrets or personal health data in plain text logs.
- Keep UTC timestamps in structured entries.
- Ship critical logs to centralized monitoring in production.
