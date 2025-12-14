import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const body = await request.json();

    // Appel serveur à serveur (pas de CORS ici)
    const backendRes = await fetch(`${API_URL}/api/analytics/track`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!backendRes.ok) {
        return NextResponse.json({ error: 'Backend error' }, { status: backendRes.status });
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}