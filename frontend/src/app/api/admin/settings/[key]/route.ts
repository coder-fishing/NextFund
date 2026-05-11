import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const backendApiUrl =
  process.env.BACKEND_API_URL ?? 'http://localhost:5000/api';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const session = await auth();

  if (!session?.user?.email || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const internalSecret = process.env.INTERNAL_API_SECRET;
  if (!internalSecret) {
    return NextResponse.json(
      { message: 'INTERNAL_API_SECRET is not configured' },
      { status: 500 }
    );
  }

  const response = await fetch(`${backendApiUrl}/admin/settings/${key}`, {
    headers: {
      'x-internal-secret': internalSecret,
      'x-user-email': session.user.email,
    },
    cache: 'no-store',
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const session = await auth();

  if (!session?.user?.email || session.user.role !== 'admin') {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const internalSecret = process.env.INTERNAL_API_SECRET;
  if (!internalSecret) {
    return NextResponse.json(
      { message: 'INTERNAL_API_SECRET is not configured' },
      { status: 500 }
    );
  }

  const body = await req.json();

  const response = await fetch(`${backendApiUrl}/admin/settings/${key}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-secret': internalSecret,
      'x-user-email': session.user.email,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
