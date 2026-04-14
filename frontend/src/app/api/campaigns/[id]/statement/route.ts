import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const backendApiUrl =
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
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

  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') ?? 'csv';

  const response = await fetch(
    `${backendApiUrl}/campaigns/export/${id}?format=${encodeURIComponent(format)}`,
    {
      headers: {
        'x-internal-secret': internalSecret,
        'x-user-email': session.user.email,
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => ({ message: 'Export failed' }));
    return NextResponse.json(data, { status: response.status });
  }

  const arrayBuffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') ?? 'text/csv; charset=utf-8';
  const disposition = response.headers.get('content-disposition') ?? `attachment; filename="campaign-${id}-statement.csv"`;

  return new NextResponse(arrayBuffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': disposition,
    },
  });
}
