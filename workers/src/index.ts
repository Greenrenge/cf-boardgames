import { Hono } from 'hono';
import { cors } from 'hono/cors';
import locationsData from '../../data/locations.json';

// Types for Cloudflare Workers environment
export interface Env {
  DB: D1Database;
  ASSETS: R2Bucket;
  GAME_ROOMS: DurableObjectNamespace;
}

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use(
  '/*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Create room endpoint
app.post('/api/rooms', async (c) => {
  try {
    const body = await c.req.json();
    const { hostPlayerId, hostPlayerName, gameType = 'spyfall' } = body;

    if (!hostPlayerId || !hostPlayerName) {
      return c.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'hostPlayerId and hostPlayerName are required',
          },
        },
        400
      );
    }

    // Generate unique 6-character room code
    const roomCode = generateRoomCode();

    // Create Durable Object for this room
    const roomId = c.env.GAME_ROOMS.idFromName(roomCode);
    const roomStub = c.env.GAME_ROOMS.get(roomId);

    // Initialize the room
    await roomStub.fetch(`http://internal/init`, {
      method: 'POST',
      body: JSON.stringify({ hostPlayerId, hostPlayerName, gameType }),
    });

    return c.json(
      {
        roomCode,
        hostPlayerId,
        gameType,
        createdAt: new Date().toISOString(),
        websocketUrl: `wss://${c.req.header('host')}/api/ws/${roomCode}`,
      },
      201
    );
  } catch (error) {
    console.error('Error creating room:', error);
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create room',
        },
      },
      500
    );
  }
});

// Get room info endpoint
app.get('/api/rooms/:code', async (c) => {
  try {
    const roomCode = c.req.param('code');

    if (!roomCode || roomCode.length !== 6) {
      return c.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid room code format',
          },
        },
        400
      );
    }

    // Get Durable Object for this room
    const roomId = c.env.GAME_ROOMS.idFromName(roomCode);
    const roomStub = c.env.GAME_ROOMS.get(roomId);

    const response = await roomStub.fetch(`http://internal/info`);

    if (response.status === 404) {
      return c.json(
        {
          error: {
            code: 'ROOM_NOT_FOUND',
            message: `Room with code ${roomCode} does not exist`,
          },
        },
        404
      );
    }

    return response;
  } catch (error) {
    console.error('Error getting room info:', error);
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get room info',
        },
      },
      500
    );
  }
});

// Update room configuration endpoint
app.patch('/api/rooms/:code/config', async (c) => {
  try {
    const roomCode = c.req.param('code');

    if (!roomCode || roomCode.length !== 6) {
      return c.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid room code format',
          },
        },
        400
      );
    }

    const body = await c.req.json();
    const { maxPlayers, spyCount } = body;

    // Validate maxPlayers (4-20)
    if (maxPlayers !== undefined && (maxPlayers < 4 || maxPlayers > 20)) {
      return c.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'maxPlayers must be between 4 and 20',
          },
        },
        400
      );
    }

    // Validate spyCount (1-3)
    if (spyCount !== undefined && (spyCount < 1 || spyCount > 3)) {
      return c.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'spyCount must be between 1 and 3',
          },
        },
        400
      );
    }

    // Get Durable Object for this room
    const roomId = c.env.GAME_ROOMS.idFromName(roomCode);
    const roomStub = c.env.GAME_ROOMS.get(roomId);

    const response = await roomStub.fetch(`http://internal/config`, {
      method: 'PATCH',
      body: JSON.stringify({ maxPlayers, spyCount }),
    });

    return response;
  } catch (error) {
    console.error('Error updating room config:', error);
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update room configuration',
        },
      },
      500
    );
  }
});

// Get locations endpoint
app.get('/api/locations', async (c) => {
  try {
    const difficultyParam = c.req.query('difficulty');
    let locations: any[] = [];

    // Try to fetch from D1 database first
    if (c.env.DB) {
      try {
        let query = 'SELECT * FROM locations WHERE 1=1';
        const params: string[] = [];

        if (difficultyParam) {
          const difficulties = difficultyParam.split(',');
          const placeholders = difficulties.map(() => '?').join(',');
          query += ` AND difficulty IN (${placeholders})`;
          params.push(...difficulties);
        }

        const result = await c.env.DB.prepare(query)
          .bind(...params)
          .all();

        locations =
          result.results?.map((row: any) => ({
            id: row.id,
            nameTh: row.name_th,
            difficulty: row.difficulty,
            roles: JSON.parse(row.roles),
            imageUrl: row.image_url,
          })) || [];

        console.log('[Locations API] Fetched from D1:', locations.length);
      } catch (dbError) {
        console.warn('[Locations API] D1 not available, using fallback data:', dbError);
      }
    }

    // Fallback: Use hardcoded locations if D1 is not available or empty
    if (locations.length === 0) {
      // Use imported static locations data
      locations = [...locationsData];

      // Filter by difficulty if specified
      if (difficultyParam) {
        const difficulties = difficultyParam.split(',');
        locations = locations.filter((loc: any) => difficulties.includes(loc.difficulty));
      }

      console.log('[Locations API] Using fallback data:', locations.length);
    }

    return c.json({ locations });
  } catch (error) {
    console.error('[Locations API] Error:', error);
    return c.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch locations',
        },
      },
      500
    );
  }
});

// WebSocket upgrade endpoint
app.get('/api/ws/:code', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.json({ error: 'Expected WebSocket' }, 426);
  }

  const roomCode = c.req.param('code');
  const roomId = c.env.GAME_ROOMS.idFromName(roomCode);
  const roomStub = c.env.GAME_ROOMS.get(roomId);

  return roomStub.fetch(c.req.raw);
});

// Helper function to generate room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export default app;

// Export Durable Object class
export { GameRoom } from './durable-objects/GameRoom';
