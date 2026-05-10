import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const backendApiUrl =
  process.env.BACKEND_API_URL ?? 'http://localhost:5000/api';

export async function GET(request: NextRequest) {
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

  const page = request.nextUrl.searchParams.get('page') ?? '1';
  const limit = request.nextUrl.searchParams.get('limit') ?? '10';

  const response = await fetch(
    `${backendApiUrl}/admin/users?page=${page}&limit=${limit}`,
    {
      headers: {
        'x-internal-secret': internalSecret,
        'x-user-email': session.user.email,
      },
      cache: 'no-store',
    }
  );

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
