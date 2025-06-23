import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const blob = await put(`${uuid()}-${file.name}`, buffer, {
    access: 'public',
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url });
}
