import { NextResponse, type NextRequest } from "next/server";
import type { ZodType } from "zod";

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, data }, init);
}

export function jsonError(
  message: string,
  status = 400,
  fieldErrors?: Record<string, string[] | undefined>,
): NextResponse {
  return NextResponse.json({ ok: false, error: message, fieldErrors }, { status });
}

type ParsedBody<T> = { success: true; data: T } | { success: false; response: NextResponse };

/** Parses + validates a JSON body in one step, returning a ready-to-return response on failure. */
export async function parseJsonBody<T>(request: NextRequest, schema: ZodType<T>): Promise<ParsedBody<T>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { success: false, response: jsonError("Request body must be valid JSON") };
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      success: false,
      response: jsonError("Validation failed", 422, result.error.flatten().fieldErrors),
    };
  }

  return { success: true, data: result.data };
}

export function parseQuery<T>(request: NextRequest, schema: ZodType<T>): ParsedBody<T> {
  const query = Object.fromEntries(request.nextUrl.searchParams.entries());
  const result = schema.safeParse(query);
  if (!result.success) {
    return {
      success: false,
      response: jsonError("Invalid query parameters", 422, result.error.flatten().fieldErrors),
    };
  }
  return { success: true, data: result.data };
}

/** Domain errors services throw when a request is well-formed but not allowed/found. */
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function notFound(message = "Resource not found"): HttpError {
  return new HttpError(404, message);
}

export function forbidden(message = "You do not have permission to perform this action"): HttpError {
  return new HttpError(403, message);
}
