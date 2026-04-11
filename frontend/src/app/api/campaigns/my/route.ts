import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const backendApiUrl =
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const filter = searchParams.get('filter') ?? 'all';

  const response = await fetch(
    `${backendApiUrl}/campaigns/me?filter=${encodeURIComponent(filter)}`,
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
