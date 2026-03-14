/**
 * Feature Flags for Mid vs Final Evaluation
 * 
 * MID EVALUATION (Current): Basic auth + dashboard overview
 * FINAL EVALUATION: Full admin console, audit trails, advanced features
 */

export const FEATURES = {
  // Core authentication (always enabled)
  AUTH_REGISTER: true,
  AUTH_LOGIN: true,
  AUTH_LOGOUT: true,

  // Dashboard basics
  DASHBOARD_STATS: false,        // ← HIDE stats cards for mid-eval
  DASHBOARD_USERS_TABLE: false,  // ← HIDE user management table
  DASHBOARD_AUDIT_LOGS: false,   // ← HIDE audit logs initially
  DASHBOARD_ACTIVITY_CHART: false, // ← HIDE activity chart

  // Admin features
  ADMIN_PANEL: true,             // ← SHOW entire /admin page
  ADMIN_USER_DELETE: true,
  ADMIN_USER_UNLOCK: true,
  ADMIN_SETTINGS: true,          // ← SHOW settings page for mid-eval

  // Demo & visualization
  DEMO_API_EXPLORER: true,
  DEMO_JWT_VISUALIZER: true,
  DEMO_BRUTE_FORCE: true,

  // Moderator features
  MOD_LOGS_ACCESS: false,        // ← HIDE logs from moderators for mid-eval
}

/**
 * TOGGLE FOR FINAL EVALUATION:
 * Change all `false` values to `true` above
 * No code changes needed — just update this file!
 */
