import AuditLog from '../models/AuditLog.js';

/**
 * Log an audit event to MongoDB.
 * Never throws — failures are silently absorbed so they don't break request flow.
 */
export const audit = async (req, action, targetId = null, targetType = null, details = {}) => {
  try {
    await AuditLog.create({
      userId:    req.user?._id,
      userEmail: req.user?.email,
      action,
      targetId:  targetId?.toString(),
      targetType,
      details,
      ip:        req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
      timestamp: new Date(),
    });
  } catch (_) {
    // Silent fail — audit should never crash the main flow
  }
};
