import { getSession } from "@/lib/sessions";
import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error("Invalid or missing multipart/form-data:", error);
      return NextResponse.json(
        { error: "Invalid or missing multipart/form-data" },
        { status: 400 }
      );
    }

    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads"; // Default to "uploads" if not specified

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Dynamic file size limits based on folder type
    const maxSizes: Record<string, number> = {
      profile: 2 * 1024 * 1024, // 2MB for profiles/avatars
      groups: 4 * 1024 * 1024, // 4MB for group images
      events: 10 * 1024 * 1024, // 10MB for event photos
      comments: 5 * 1024 * 1024, // 5MB for comment attachments
      uploads: 4 * 1024 * 1024, // 4MB default
    };

    const maxSize = maxSizes[folder] || maxSizes.uploads;
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File too large. Max size: ${maxSizeMB}MB` },
        { status: 400 }
      );
    }

    // Create organized folder structure
    const fileExtension = file.name.split(".").pop() || "jpg";
    const timestamp = Date.now();
    const uniqueFilename = `${folder}/${session.user.id}/${timestamp}.${fileExtension}`;

    const blob = await put(uniqueFilename, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    );
  }
}
