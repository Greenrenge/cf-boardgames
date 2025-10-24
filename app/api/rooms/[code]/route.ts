import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { code: string } }) {
  try {
    const { code } = params;

    // Forward to Workers API
    const workerUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
    const response = await fetch(`${workerUrl}/api/rooms/${code}`);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }
      throw new Error('Failed to get room info');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error getting room info:', error);
    return NextResponse.json({ error: 'Failed to get room info' }, { status: 500 });
  }
}
