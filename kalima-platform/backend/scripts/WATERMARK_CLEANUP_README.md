# Watermark Cleanup Script

This script automatically deletes watermark images that are older than 30 days to save storage space.

## Manual Execution

To run the cleanup script manually:

```bash
cd kalima-platform/backend
npm run cleanup:watermarks
```

## Automated Execution (Cron Job)

### On Linux/Mac

1. Open crontab editor:
```bash
crontab -e
```

2. Add this line to run the cleanup daily at 2 AM:
```bash
0 2 * * * cd /path/to/kalima-platform/backend && npm run cleanup:watermarks >> /var/log/watermark-cleanup.log 2>&1
```

Replace `/path/to/kalima-platform/backend` with your actual project path.

### On Windows (Task Scheduler)

1. Open Task Scheduler
2. Create a new Basic Task
3. Set trigger: Daily at 2:00 AM
4. Set action: Start a program
   - Program: `cmd.exe`
   - Arguments: `/c cd /d "C:\path\to\kalima-platform\backend" && npm run cleanup:watermarks`
5. Save the task

### Using PM2 (Recommended for Production)

If you're using PM2 to manage your Node.js application:

1. Install pm2-cron:
```bash
npm install -g pm2
```

2. Create a cron job in PM2:
```bash
pm2 start scripts/cleanupOldWatermarks.js --cron "0 2 * * *" --no-autorestart
```

This will run the cleanup script daily at 2 AM.

## What the Script Does

1. Connects to the database
2. Finds all purchases with watermarks older than 30 days
3. Deletes the watermark image files from the filesystem
4. Updates the database to remove watermark references
5. Logs the results

## Monitoring

Check the logs to ensure the cleanup is running correctly:
- Manual runs: Output will be displayed in the terminal
- Cron jobs: Check `/var/log/watermark-cleanup.log` (Linux/Mac)
- PM2: Use `pm2 logs cleanupOldWatermarks`

## Configuration

To change the retention period (default: 30 days), edit the `DAYS_TO_KEEP` constant in `cleanupOldWatermarks.js`.
