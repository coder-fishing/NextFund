import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const backendApiUrl =
  process.env.BACKEND_API_URL ?? 'http://localhost:5000/api';

export async function POST(req: Request) {
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

  const response = await fetch(`${backendApiUrl}/admin/campaigns/bulk-moderate`, {
    method: 'POST',
    headers: {
      'x-internal-secret': internalSecret,
      'x-user-email': session.user.email,
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
