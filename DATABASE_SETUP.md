# Hosana City Housing - Database Setup Guide

This project uses **Neon PostgreSQL** as the primary database, integrated with Next.js through the `@neondatabase/serverless` package.

## Prerequisites

- Neon account and PostgreSQL database set up
- DATABASE_URL environment variable configured in Vercel project settings
- Node.js 18+ installed locally

## Environment Variables

Add the following to your `.env.local` (local development) or Vercel project settings:

```
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=8h
```

## Database Schema

The database includes the following tables:

### Users Table
- `id` (UUID, Primary Key)
- `username` (VARCHAR, Unique)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `full_name` (VARCHAR)
- `role` (VARCHAR) - SUPER_ADMIN, MAYOR, MENDER_STAFF, AUDITOR
- `assigned_mender` (VARCHAR)
- `phone` (VARCHAR)
- `is_active` (BOOLEAN)
- `approval_status` (VARCHAR) - pending, approved, rejected
- `registration_ip` (INET)
- `last_login` (TIMESTAMP)
- `failed_login_attempts` (INTEGER)
- `locked_until` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Householders Table
- Contact information and property details
- References to users table
- File storage fields
- Location data (latitude/longitude)

### Audit Logs Table
- Tracks all user actions
- Stores old/new values in JSONB
- Captures IP and user agent

## Setup Instructions

### Option 1: First-Time Setup (New Database)

Run the complete initialization script:

```bash
node scripts/complete-init.js
```

This will:
1. Create all tables and indexes
2. Add the UUID extension
3. Insert default admin and mayor users
4. Add the approval_status column with constraints

Default credentials:
- **Username**: `admin`
- **Password**: `Admin123!`
- **Role**: SUPER_ADMIN

### Option 2: Add Missing Column (Existing Database)

If your database already exists but is missing the `approval_status` column:

```bash
node scripts/add-approval-status.js
```

## Authentication System

The application implements:

- **Password Hashing**: bcryptjs with 12 salt rounds
- **JWT Tokens**: Signed with JWT_SECRET, expires after JWT_EXPIRY period
- **Account Lockout**: After 5 failed attempts, account locks for 30 minutes
- **Approval Status**: Users must be in 'approved' status to login
- **Role-Based Access**: Different roles have different permissions

## API Routes

### POST /api/auth/login
Authenticates a user and returns JWT token.

**Request**:
```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

**Response**:
```json
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "SUPER_ADMIN",
    "fullName": "System Administrator"
  }
}
```

### POST /api/auth/registration
Creates a new user account (self-registration).

**Request**:
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "MENDER_STAFF",
  "assignedMender": "Mender 1"
}
```

**Restrictions**:
- Only MENDER_STAFF and AUDITOR roles can self-register
- SUPER_ADMIN and MAYOR users must be created by administrators
- New registrations are automatically approved

## Troubleshooting

### Connection Error: "password authentication failed"

1. Verify DATABASE_URL in your Vercel project settings
2. Regenerate the password in Neon console
3. Update the DATABASE_URL environment variable
4. Restart the development server

### Column Not Found Errors

Run the migration script:
```bash
node scripts/add-approval-status.js
```

### Unable to Connect to Database

- Check that your Neon database is active
- Verify SSL mode is enabled in the connection string
- Ensure your IP is whitelisted in Neon (if applicable)
- Test connection locally: `node scripts/test-connection.js`

## Local Development

1. Set up `.env.local`:
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=your-dev-secret
   JWT_EXPIRY=8h
   ```

2. Run the initialization:
   ```bash
   node scripts/complete-init.js
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:3000`

## Production Deployment

1. Set environment variables in Vercel project settings
2. The database migrations will run automatically on first deployment
3. Ensure DATABASE_URL points to your production Neon database
4. Monitor audit logs in the database for compliance

## Security Notes

- Passwords are hashed with bcryptjs (never store plain text)
- JWT tokens are signed and verified server-side
- All database queries use parameterized statements to prevent SQL injection
- Account lockout prevents brute force attacks
- Audit logs track all administrative actions
- Registration IP is captured for security monitoring
