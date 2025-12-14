import { supabase } from "./supabase";

export type AuditActionType =
  | "user_login"
  | "user_logout"
  | "user_register"
  | "role_change"
  | "user_update"
  | "user_delete"
  | "master_admin_created"
  | "master_admin_updated"
  | "master_admin_deactivated"
  | "ch_created"
  | "ch_approved"
  | "ch_suspended"
  | "ch_reactivated"
  | "donation_created"
  | "donation_claimed"
  | "donation_delivered"
  | "job_created"
  | "job_closed"
  | "job_filled"
  | "workshop_proposed"
  | "workshop_approved"
  | "workshop_rejected"
  | "workshop_completed"
  | "worker_created"
  | "worker_placed"
  | "settings_updated"
  | "system_action";

export interface AuditLogEntry {
  action_type: AuditActionType;
  entity_type?: string;
  entity_id?: string;
  description?: string;
  metadata?: Record<string, any>;
}

/**
 * Log an action to the system_logs table for audit purposes.
 * This function is fire-and-forget - it won't throw errors to avoid
 * disrupting the main flow.
 */
export async function logAuditAction(entry: AuditLogEntry): Promise<void> {
  try {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData.user?.id;

    await supabase.from("system_logs").insert({
      user_id: userId || null,
      action_type: entry.action_type,
      entity_type: entry.entity_type || null,
      entity_id: entry.entity_id || null,
      description: entry.description || null,
      metadata: entry.metadata || {},
    });
  } catch (error) {
    // Silently fail - audit logging should not break main functionality
    console.warn("Failed to log audit action:", error);
  }
}

/**
 * Helper to log role changes specifically
 */
export async function logRoleChange(
  userId: string,
  oldRole: string,
  newRole: string,
  changedBy: string
): Promise<void> {
  await logAuditAction({
    action_type: "role_change",
    entity_type: "user",
    entity_id: userId,
    description: `Role changed from ${oldRole} to ${newRole}`,
    metadata: {
      old_role: oldRole,
      new_role: newRole,
      changed_by: changedBy,
    },
  });
}

/**
 * Helper to log Master Admin actions
 */
export async function logMasterAdminAction(
  action: "master_admin_created" | "master_admin_updated" | "master_admin_deactivated",
  adminId: string,
  adminName: string,
  details?: Record<string, any>
): Promise<void> {
  const descriptions = {
    master_admin_created: `Master Admin ${adminName} was created`,
    master_admin_updated: `Master Admin ${adminName} was updated`,
    master_admin_deactivated: `Master Admin ${adminName} was deactivated`,
  };

  await logAuditAction({
    action_type: action,
    entity_type: "master_admin",
    entity_id: adminId,
    description: descriptions[action],
    metadata: details,
  });
}

/**
 * Helper to log Community Head actions
 */
export async function logCHAction(
  action: "ch_created" | "ch_approved" | "ch_suspended" | "ch_reactivated",
  chId: string,
  chName: string,
  details?: Record<string, any>
): Promise<void> {
  const descriptions = {
    ch_created: `Community Head ${chName} was created`,
    ch_approved: `Community Head ${chName} was approved`,
    ch_suspended: `Community Head ${chName} was suspended`,
    ch_reactivated: `Community Head ${chName} was reactivated`,
  };

  await logAuditAction({
    action_type: action,
    entity_type: "community_head",
    entity_id: chId,
    description: descriptions[action],
    metadata: details,
  });
}
