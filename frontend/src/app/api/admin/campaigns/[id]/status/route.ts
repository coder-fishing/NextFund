import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

const backendApiUrl =
  process.env.BACKEND_API_URL ?? 'http://localhost:5000/api';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;
  const body = await request.json();

  // Reuse existing updateCampaignStatus endpoint on backend
  const response = await fetch(`${backendApiUrl}/campaigns/${id}/status`, {
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
