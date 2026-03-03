import { sql } from './db';

export interface AuditLogEntry {
  userId?: string;
  username?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await sql`
      INSERT INTO audit_logs (
        user_id, username, action, resource_type, resource_id, 
        old_values, new_values, ip_address, user_agent
      ) VALUES (
        ${entry.userId || null},
        ${entry.username || null},
        ${entry.action},
        ${entry.resourceType || null},
        ${entry.resourceId || null},
        ${entry.oldValues ? JSON.stringify(entry.oldValues) : null},
        ${entry.newValues ? JSON.stringify(entry.newValues) : null},
        ${entry.ipAddress || null},
        ${entry.userAgent || null}
      )
    `;
  } catch (error) {
    console.error('Audit logging failed:', error);
    // Never fail the main operation due to audit logging
  }
}

export async function getAuditLogs(
  userId?: string,
  action?: string,
  startDate?: Date,
  endDate?: Date,
  limit: number = 100
) {
  let query = sql`SELECT * FROM audit_logs WHERE 1=1`;
  
  if (userId) {
    query = sql`${query} AND user_id = ${userId}`;
  }
  
  if (action) {
    query = sql`${query} AND action = ${action}`;
  }
  
  if (startDate) {
    query = sql`${query} AND timestamp >= ${startDate}`;
  }
  
  if (endDate) {
    query = sql`${query} AND timestamp <= ${endDate}`;
  }
  
  query = sql`${query} ORDER BY timestamp DESC LIMIT ${limit}`;
  
  return await query;
}