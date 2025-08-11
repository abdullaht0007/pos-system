export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { withApiLogging, ApiHandlerContext } from "@/lib/api-logger";

async function uploadFileHandler(request: NextRequest, context: ApiHandlerContext) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json(
      { error: "No file provided" },
      { status: 400 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Generate unique filename
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
  const filename = `${uniqueSuffix}-${file.name}`;
  const uploadDir = join(process.cwd(), "public", "uploads");
  const filepath = join(uploadDir, filename);

  await writeFile(filepath, buffer);

  return NextResponse.json({
    url: `/uploads/${filename}`,
    filename,
  });
}

export const POST = withApiLogging(uploadFileHandler, "uploadFile");
