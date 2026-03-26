import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const backendApiUrl =
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const internalSecret = process.env.INTERNAL_API_SECRET;
  if (!internalSecret) {
    return NextResponse.json(
      { message: 'INTERNAL_API_SECRET is not configured on frontend server' },
      { status: 500 }
    );
  }

  const payload = await request.json();

  const response = await fetch(`${backendApiUrl}/campaigns`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': internalSecret,
      'x-user-email': session.user.email,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
