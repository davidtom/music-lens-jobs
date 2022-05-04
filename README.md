# Musice Lense Jobs

## Sync Recently Played

```bash
# Execute once
origin=http://localhost:8080 npx ts-node src/sync-recently-played.ts

# Run the sync command every 15 minutes
while true; do origin=http://localhost:8080 npx ts-node ./src/sync-recently-played.ts; sleep 900; done;
```
