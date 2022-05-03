# Musice Lense Jobs

## Sync Recently Played

```bash
# Run the sync command every 15 minutes
while true; do ORIGIN=http://localhost:8080 npx ts-node ./src/sync-recently-played.ts; sleep 900; done;
```
