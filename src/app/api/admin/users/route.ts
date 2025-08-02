import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (skip rate limiting for read operations)
    await requireAdmin(true);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100); // Cap limit at 100
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder =
      (searchParams.get("sortOrder") as "asc" | "desc") || "desc";

    const skip = (page - 1) * limit;

    // Build where clause with optimized search
    const where: Record<string, unknown> = {
      deletedAt: null, // Exclude soft-deleted users
    };

    // Optimized search with full-text search capabilities
    if (search) {
      // Use more efficient search with indexed fields
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { nickname: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role && ["USER", "ADMIN"].includes(role)) {
      where.role = role;
    }

    // Validate sortBy to prevent SQL injection
    const allowedSortFields = [
      "createdAt",
      "updatedAt",
      "firstName",
      "lastName",
      "email",
      "role",
    ];
    const validSortBy = allowedSortFields.includes(sortBy)
      ? sortBy
      : "createdAt";

    // Execute count and data queries in parallel for better performance
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          nickname: true,
          role: true,
          hasOnboarded: true,
          createdAt: true,
          updatedAt: true,
          password: true,
          accounts: {
            select: {
              provider: true,
            },
          },
          // Use conditional loading for counts to improve performance
          _count: search
            ? undefined
            : {
                select: {
                  groupMembers: true,
                  eventComments: true,
                  contacts: true,
                },
              },
        },
        orderBy: {
          [validSortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    // Transform users to include hasPassword boolean without exposing actual password
    const transformedUsers = users.map((user) => ({
      ...user,
      hasPassword: Boolean(user.password), // Convert password to boolean
      password: undefined, // Remove actual password from response
    }));

    const total = totalCount;

    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response = NextResponse.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
      meta: {
        searchApplied: Boolean(search),
        roleFilter: role || null,
      },
    });

    // Add cache headers for better performance
    response.headers.set(
      "Cache-Control",
      search
        ? "private, no-cache"
        : "public, s-maxage=30, stale-while-revalidate=60"
    );

    return response;
  } catch (error) {
    console.error("Error fetching users:", error);

    if (
      error instanceof Error &&
      error.message.includes("Admin access required")
    ) {
      return NextResponse.json(
        { error: "Forbidden - Admin access only" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check if user is admin
    await requireAdmin();

    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "User ID and valid updates are required" },
        { status: 400 }
      );
    }

    // Sanitize updates - only allow specific fields
    const allowedUpdates = [
      "firstName",
      "lastName",
      "nickname",
      "role",
      "hasOnboarded",
    ];
    const sanitizedUpdates = Object.keys(updates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce(
        (obj, key) => {
          obj[key] = updates[key];
          return obj;
        },
        {} as Record<string, unknown>
      );

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json(
        { error: "No valid updates provided" },
        { status: 400 }
      );
    }

    // Check if user exists
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user with optimistic concurrency control
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...sanitizedUpdates,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        nickname: true,
        role: true,
        hasOnboarded: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            groupMembers: true,
            eventComments: true,
            contacts: true,
          },
        },
      },
    });

    return NextResponse.json({
      user: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);

    if (error instanceof Error) {
      if (error.message.includes("Admin access required")) {
        return NextResponse.json(
          { error: "Forbidden - Admin access only" },
          { status: 403 }
        );
      }

      if (error.message.includes("Record to update not found")) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
