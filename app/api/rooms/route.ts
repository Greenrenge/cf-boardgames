import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostPlayerId, hostPlayerName, gameType } = body;

    // Forward to Workers API
    const workerUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8787';
    const response = await fetch(`${workerUrl}/api/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hostPlayerId,
        hostPlayerName,
        gameType,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
