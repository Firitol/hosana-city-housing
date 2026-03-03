#!/bin/bash

# Automated Backup Script
# Add to crontab: 0 2 * * * /opt/hosana-housing/scripts/backup.sh

set -e

BACKUP_DIR="/opt/hosana-housing/backups"
DATE=$(date +%Y%m%d-%H%M%S)
DB_USER=$(grep DB_USER /opt/hosana-housing/.env | cut -d '=' -f2)
DB_NAME=$(grep DB_NAME /opt/hosana-housing/.env | cut -d '=' -f2)

echo "📦  Starting backup: $DATE"

# Database backup
docker exec hosana_db pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db-$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db-$DATE.sql

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "✅  Backup complete: db-$DATE.sql.gz"