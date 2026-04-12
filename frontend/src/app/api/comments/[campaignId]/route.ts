import { NextResponse } from "next/server";

const backendApiUrl =
  process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type RouteContext = {
  params: Promise<{ campaignId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { campaignId } = await context.params;
  const { searchParams } = new URL(request.url);

  const page = searchParams.get("page") ?? "1";
  const limit = searchParams.get("limit") ?? "5";

  const response = await fetch(`${backendApiUrl}/comments/${campaignId}?page=${encodeURIComponent(page)}&limit=${encodeURIComponent(limit)}`, {
    cache: "no-store",
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}