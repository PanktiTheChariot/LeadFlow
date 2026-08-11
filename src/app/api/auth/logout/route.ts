import { clearSessionCookie } from "@/lib/auth/session";
import { jsonOk } from "@/server/http";

export async function POST() {
  await clearSessionCookie();
  return jsonOk({ success: true });
}
