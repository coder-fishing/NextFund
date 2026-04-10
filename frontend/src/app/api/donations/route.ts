import { auth } from "@/auth";
import { NextResponse } from "next/server";

const backendApiUrl =
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type SyncUserResponse = {
  token?: string;
  message?: string;
};

const getBackendToken = async (
  email: string,
  name: string | null | undefined,
  avatar: string | null | undefined,
  provider: string | undefined,
  providerId: string | undefined
): Promise<string> => {
  const response = await fetch(`${backendApiUrl}/users/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      name: name ?? email,
      avatar: avatar ?? undefined,
      provider: provider ?? "nextauth",
      providerId: providerId ?? email,
    }),
  });

  const data = (await response.json()) as SyncUserResponse;

  if (!response.ok || !data.token) {
    throw new Error(data.message ?? "Failed to authenticate with backend");
  }

  return data.token;
};

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let token = "";

  try {
    token = await getBackendToken(
      session.user.email,
      session.user.name,
      session.user.image,
      session.user.provider,
      session.user.providerId
    );
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to sync user" },
      { status: 500 }
    );
  }

  const payload = await request.json();

  const response = await fetch(`${backendApiUrl}/donations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}
