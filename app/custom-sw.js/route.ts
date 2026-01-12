import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new NextResponse('// Custom service worker not configured', {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript',
    },
  });
}
