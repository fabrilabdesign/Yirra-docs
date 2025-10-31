#!/bin/bash

# Database Migration Script for Reddit Credentials
# Run this to update the database with the Reddit user pool

set -e

echo "🗄️  Reddit Credentials Database Migration"
echo "========================================="

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Please install PostgreSQL client:"
    echo "   Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "   CentOS/RHEL: sudo yum install postgresql"
    echo "   macOS: brew install postgresql"
    exit 1
fi

# Database connection details (update these)
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-magic_sauce}"
DB_USER="${DB_USER:-postgres}"

echo "📋 Migration Details:"
echo "   Host: $DB_HOST:$DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Check if we need password
if [ -z "$DB_PASSWORD" ]; then
    echo "⚠️  DB_PASSWORD environment variable not set"
    echo "   Set it with: export DB_PASSWORD=your_password"
    echo "   Or use .pgpass file for password-less authentication"
    echo ""
fi

echo "🔄 Running database migration..."
echo "   File: Magic_sauce/automations/database-migration.sql"
echo ""

# Run the migration
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "Magic_sauce/automations/database-migration.sql"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🔍 Verifying data insertion..."
    echo "-------------------------------"
    
    # Verify the credentials were inserted
    echo "Reddit accounts in database:"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT account, LEFT(client_id, 10) || '...' as client_id_preview, LEFT(client_secret, 10) || '...' as client_secret_preview FROM rate_limits ORDER BY account;" -t
    
    echo ""
    echo "📊 Account count:"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT COUNT(*) as total_accounts FROM rate_limits;" -t
    
    echo ""
    echo "🎯 Next Steps:"
    echo "1. Test voting system: ./test-voting-system.sh"
    echo "2. Monitor logs for any credential issues"
    echo "3. Set up account rotation if needed"
    
else
    echo "❌ Migration failed!"
    echo "   Check the error messages above"
    exit 1
fi
