import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = "https://talk-a-tive-web.onrender.com";

const createProxyResponse = async (backendResponse: Response) => {
  const text = await backendResponse.text();
  let body: unknown;

  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return NextResponse.json(body, { status: backendResponse.status });
};

const getProxyHeaders = (request: NextRequest) => {
  const headers = new Headers(request.headers);
  if (!headers.has("content-type") && request.method === "POST") {
    headers.set("content-type", "application/json");
  }
  return headers;
};

const proxyRequest = async (request: NextRequest, method: "GET" | "POST") => {
  try {
    const response = await fetch(`${BACKEND_API_URL}/api/chats`, {
      method,
      headers: getProxyHeaders(request),
      body: method === "POST" ? await request.text() : undefined,
      cache: method === "GET" ? "no-store" : undefined,
    });

    return createProxyResponse(response);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to reach backend API",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 502 }
    );
  }
};

export async function GET(request: NextRequest) {
  return proxyRequest(request, "GET");
}

export async function POST(request: NextRequest) {
  return proxyRequest(request, "POST");
}
