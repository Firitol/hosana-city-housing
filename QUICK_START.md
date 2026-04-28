# Quick Start Guide - Hosana City Housing

## Prerequisites
- Neon PostgreSQL database created
- Node.js 18+ installed
- DATABASE_URL environment variable configured

## 5-Minute Setup

### 1. Configure Environment Variables
**In Vercel project settings OR locally in `.env.local`:**
```
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=8h
```

### 2. Initialize Database (First Time Only)
```bash
# Full database setup from scratch
node scripts/complete-init.js
```

**If you already have a database but need to add missing column:**
```bash
node scripts/add-approval-status.js
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access Application
Open `http://localhost:3000`

### 5. Login with Default Credentials
- **Username**: `admin`
- **Password**: `Admin123!`

## What Was Fixed

✅ **Database Schema** - Added missing `approval_status` and `registration_ip` columns
✅ **Registration Form** - Now properly creates users with approval status
✅ **Login Form** - Checks approval status and user active status
✅ **Authentication** - Complete JWT token flow with password hashing
✅ **Security** - Account lockout, IP tracking, audit logs
✅ **Environment** - Neon PostgreSQL properly configured

## Key Files

| File | Purpose |
|------|---------|
| `app/api/auth/login/route.ts` | Login endpoint with approval check |
| `app/api/auth/registration/route.ts` | User registration endpoint |
| `app/lib/auth.ts` | Password hashing, token generation |
| `app/lib/db.ts` | Neon database connection |
| `app/login/page.tsx` | Login UI page |
| `app/registration/page.tsx` | Registration UI page |
| `database/init.sql` | Database schema |

## Database Tables

### Users Table
Stores user accounts with authentication data:
- Username/Email (unique)
- Password hash (bcryptjs)
- Role (SUPER_ADMIN, MAYOR, MENDER_STAFF, AUDITOR)
- Approval status (pending/approved/rejected)
- Account lockout tracking
- Last login timestamp

### Householders Table
Stores property/resident information:
- House number, location (lat/long)
- Owner details
- File storage support
- Audit trail (created_by, updated_by)

### Audit Logs Table
Tracks all actions:
- Who did what and when
- Before/after values
- IP address and user agent

## Troubleshooting

### "password authentication failed"
1. Check DATABASE_URL in environment variables
2. Verify credentials in Neon console
3. Regenerate password if needed
4. Update DATABASE_URL in Vercel settings

### "Column approval_status not found"
```bash
node scripts/add-approval-status.js
```

### "Cannot connect to database"
1. Ensure Neon database is active
2. Check SSL mode is enabled
3. Verify IP is whitelisted (if applicable)

### Tests
```bash
# Test database connection
node scripts/test-connection.js
```

## Security Features

- **Password**: Hashed with bcryptjs (12 rounds)
- **Tokens**: JWT signed with secret key
- **Lockout**: 5 failed attempts = 30-minute lock
- **Audit**: All actions logged with IP/timestamp
- **Approval**: Admin can approve/reject registrations

## Deployment

1. Set environment variables in Vercel project settings
2. Database runs on Neon (serverless PostgreSQL)
3. No database initialization needed on deployment
4. Migrations run automatically if needed

## Need Help?

Read the detailed guides:
- `DATABASE_SETUP.md` - Complete setup instructions
- `FIXES_SUMMARY.md` - Detailed list of all changes
- `README.md` - Project overview

## Default Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | Admin123! | SUPER_ADMIN |
| mayor | Admin123! | MAYOR |

⚠️ **CHANGE THESE PASSWORDS IN PRODUCTION!**
