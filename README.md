# Musice Lens Jobs

## Deploy

```
# if not on correct account
npx firebase logout
npx firebase login

npx firebase deploy --only functions
```

## Sync Recently Played

```bash
# Execute once
origin=http://localhost:8080 npx ts-node src/sync-recently-played.ts

# Run the sync command every 15 minutes
while true; do origin=http://localhost:8080 npx ts-node ./src/sync-recently-played.ts; sleep 900; done;
```

## TODOs

- [] Set up alerts in some way - GCP or some free solution
  - review these docs for GCP: https://cloud.google.com/monitoring/alerts/concepts-indepth#alignment-period
- [] Create GH workflow to deploy (low prio for now)
