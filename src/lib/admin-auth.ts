import { getSession } from "@/lib/sessions";
import prisma from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limiter";

// Rate limiting for admin actions (more lenient for read operations)
const adminRateLimit = rateLimit({
  interval: 60 * 1000, // 1 minute
});

export async function checkAdminAccess(skipRateLimit = false) {
  try {
    const session = await getSession();

    if (!session?.user?.id) {
      return { isAdmin: false, error: "Not authenticated" };
    }

    // Apply rate limiting only for write operations (skip for read-only operations)
    if (!skipRateLimit) {
      try {
        await adminRateLimit.check(50); // 50 requests per minute per admin (more lenient)
      } catch (error) {
        console.error("Admin rate limit exceeded:", error);
        return { isAdmin: false, error: "Rate limit exceeded" };
      }
    }

    // Check user role with caching
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
        deletedAt: null, // Ensure user is not soft-deleted
      },
      select: {
        role: true,
      },
    });

    if (!user) {
      return { isAdmin: false, error: "User not found or inactive" };
    }

    const isAdmin = user.role === "ADMIN";

    // Update last active timestamp for admin users (if field exists in schema)
    if (isAdmin) {
      // Fire and forget - don't wait for this
      prisma.user
        .update({
          where: { id: session.user.id },
          data: { updatedAt: new Date() },
        })
        .catch(console.error);
    }

    return { isAdmin, error: isAdmin ? null : "Insufficient permissions" };
  } catch (error) {
    console.error("Admin access check error:", error);
    return { isAdmin: false, error: "Authentication error" };
  }
}

export async function requireAdmin(skipRateLimit = false) {
  const { isAdmin, error } = await checkAdminAccess(skipRateLimit);

  if (!isAdmin) {
    throw new Error(error || "Admin access required");
  }

  return true;
}

// Enhanced admin check with additional security measures
export async function requireAdminWithAudit(
  action: string,
  resource?: string,
  skipRateLimit = false
) {
  const session = await getSession();
  const { isAdmin, error } = await checkAdminAccess(skipRateLimit);

  if (!isAdmin) {
    // Log failed admin access attempts
    console.error(`Failed admin access attempt:`, {
      userId: session?.user?.id || "anonymous",
      action,
      resource,
      timestamp: new Date().toISOString(),
      ip: "unknown", // Could be enhanced with IP tracking
    });

    throw new Error(error || "Admin access required");
  }

  // Log successful admin actions (optional - could be stored in DB)
  if (process.env.NODE_ENV === "development") {
    console.info(`Admin action:`, {
      userId: session?.user?.id,
      action,
      resource,
      timestamp: new Date().toISOString(),
    });
  }

  return true;
}

// Check if current user can perform action on target user
export async function canManageUser(
  targetUserId: string,
  allowSelfEdit = false
) {
  const session = await getSession();
  const { isAdmin } = await checkAdminAccess(true); // Skip rate limit for read-only check

  if (!isAdmin) {
    return { canManage: false, error: "Admin access required" };
  }

  // Prevent admin from managing themselves in certain operations (like delete)
  // But allow self-editing for profile updates
  if (session?.user?.id === targetUserId && !allowSelfEdit) {
    return {
      canManage: false,
      error: "Cannot perform this action on yourself",
    };
  }

  // Additional checks could be added here (e.g., super admin vs regular admin)
  return { canManage: true, error: null };
}

// Validate admin action permissions
export function validateAdminAction(
  action: string,
  data: Record<string, unknown>
) {
  const allowedActions = [
    "update_user",
    "delete_user",
    "recover_user",
    "delete_contact",
    "view_users",
    "view_contacts",
    "view_stats",
  ];

  if (!allowedActions.includes(action)) {
    throw new Error(`Invalid admin action: ${action}`);
  }

  // Validate data based on action
  switch (action) {
    case "update_user":
      if (!data.userId || !data.updates) {
        throw new Error("User ID and updates are required");
      }
      // Sanitize updates - only allow specific fields
      const allowedFields = [
        "firstName",
        "lastName",
        "nickname",
        "role",
        "hasOnboarded",
      ];
      const updates = data.updates as Record<string, unknown>;
      const invalidFields = Object.keys(updates).filter(
        (key) => !allowedFields.includes(key)
      );
      if (invalidFields.length > 0) {
        throw new Error(`Invalid fields: ${invalidFields.join(", ")}`);
      }
      break;

    case "delete_user":
    case "recover_user":
      if (!data.userId) {
        throw new Error("User ID is required");
      }
      break;

    case "delete_contact":
      if (!data.contactId) {
        throw new Error("Contact ID is required");
      }
      break;
  }

  return true;
}
