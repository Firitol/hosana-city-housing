#!/bin/bash

# Hosana City Housing - Database Setup Assistant

echo "🏘️  Hosana City Housing - Database Setup"
echo "=========================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  WARNING: DATABASE_URL environment variable is not set"
    echo ""
    echo "To set it locally, add to .env.local:"
    echo "  DATABASE_URL=postgresql://user:password@host/database?sslmode=require"
    echo ""
    echo "To set it in Vercel, use the Settings tab in the project."
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "Select an option:"
echo "1) Full database initialization (fresh setup)"
echo "2) Add missing approval_status column (migration)"
echo "3) Test database connection"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🔄 Running full database initialization..."
        node scripts/complete-init.js
        ;;
    2)
        echo ""
        echo "🔄 Running migration..."
        node scripts/add-approval-status.js
        ;;
    3)
        echo ""
        echo "🔄 Testing database connection..."
        node scripts/test-connection.js
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Open: http://localhost:3000"
echo "3. Login with: admin / Admin123!"
echo ""
