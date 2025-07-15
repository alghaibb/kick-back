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
      return NextResponse.json({ error: "Invalid or missing multipart/form-data" }, { status: 400 });
    }
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (4MB limit)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Create a unique filename with user ID and timestamp
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const uniqueFilename = `profile/${session.user.id}/${timestamp}.${fileExtension}`;

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