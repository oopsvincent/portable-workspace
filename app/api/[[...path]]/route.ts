import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', app: 'Portable Workspace', version: '1.0.0' });
}

export async function POST() {
  return NextResponse.json({ status: 'ok', message: 'Portable Workspace API' });
}
