import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const backendApiUrl =
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const getInternalHeaders = (email: string, internalSecret: string) => ({
  'Content-Type': 'application/json',
  'x-internal-secret': internalSecret,
  'x-user-email': email,
});

const ensureBackendUser = async (
  email: string,
  name: string | null | undefined,
  avatar: string | null | undefined,
  provider: string | undefined,
  providerId: string | undefined
): Promise<void> => {
  const response = await fetch(`${backendApiUrl}/users/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      name: name ?? email,
      avatar: avatar ?? undefined,
      provider: provider ?? 'nextauth',
      providerId: providerId ?? email,
    }),
  });

  if (!response.ok) {
    const data = (await response.json()) as { message?: string };
    throw new Error(data.message ?? 'Failed to sync user with backend');
  }
};

export async function GET() {
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

  try {
    await ensureBackendUser(
      session.user.email,
      session.user.name,
      session.user.image,
      session.user.provider,
      session.user.providerId
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to sync user' },
      { status: 500 }
    );
  }

  const response = await fetch(`${backendApiUrl}/wallets`, {
    method: 'GET',
    headers: getInternalHeaders(session.user.email, internalSecret),
  });

  const data = (await response.json()) as {
    wallets?: Array<{ address: string; isPrimary: boolean }>;
    message?: string;
  };

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const wallets = Array.isArray(data.wallets) ? data.wallets : [];
  const primaryWallet = wallets.find((wallet) => wallet.isPrimary);
  const firstWallet = wallets[0];

  return NextResponse.json(
    {
      walletAddress: primaryWallet?.address ?? firstWallet?.address ?? null,
      wallets,
    },
    { status: response.status }
  );
}

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

  try {
    await ensureBackendUser(
      session.user.email,
      session.user.name,
      session.user.image,
      session.user.provider,
      session.user.providerId
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to sync user' },
      { status: 500 }
    );
  }

  const response = await fetch(`${backendApiUrl}/wallets/connect`, {
    method: 'POST',
    headers: getInternalHeaders(session.user.email, internalSecret),
    body: JSON.stringify({ address: payload.walletAddress }),
  });

  const data = (await response.json()) as {
    wallet?: { address?: string };
    message?: string;
  };

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  return NextResponse.json(
    {
      message: data.message ?? 'Wallet connected successfully',
      walletAddress: data.wallet?.address ?? null,
    },
    { status: response.status }
  );
}
