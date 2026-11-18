import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { demoWorkspaces } from "@/db/schema";
import { initialWorkspace } from "@/lib/studio";
import { validateWorkspace } from "@/lib/validate";

export const dynamic = "force-dynamic";
const COOKIE = "ms_studio_demo";
const keyFor = (token: string) =>
  createHash("sha256").update(token).digest("hex");
const reply = (body: unknown, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      Vary: "Cookie",
    },
  });
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(COOKIE)?.value;
    if (token && /^[a-f0-9]{64}$/.test(token)) {
      const [existing] = await db
        .select({ data: demoWorkspaces.data, version: demoWorkspaces.version })
        .from(demoWorkspaces)
        .where(eq(demoWorkspaces.key, keyFor(token)))
        .limit(1);
      if (existing) return reply(existing);
    }
    const fresh = randomBytes(32).toString("hex");
    const data = initialWorkspace();
    await db.insert(demoWorkspaces).values({ key: keyFor(fresh), data });
    const out = reply({ data, version: 1 });
    const secure =
      new URL(req.url).protocol === "https:" ||
      req.headers.get("x-forwarded-proto") === "https";
    // Partitioned HTTPS cookies also isolate the demo when embedded in a preview.
    out.cookies.set(COOKIE, fresh, {
      httpOnly: true,
      sameSite: secure ? "none" : "lax",
      secure,
      partitioned: secure,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return out;
  } catch {
    return reply(
      { error: "Your demo workspace could not be loaded. Please try again." },
      503,
    );
  }
}
export async function PUT(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return reply({ error: "Invalid request origin." }, 403);
    }
    const allowed = [
      req.headers.get("host"),
      req.headers.get("x-forwarded-host")?.split(",")[0].trim(),
    ];
    if (!allowed.includes(originHost))
      return reply({ error: "Request origin is not permitted." }, 403);
  }
  const token = req.cookies.get(COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token))
    return reply(
      {
        error: "This demo session has expired. Reload the page to start again.",
      },
      401,
    );
  try {
    const raw = await req.text();
    if (raw.length > 4000000)
      return reply(
        {
          error:
            "Demo storage is full. Remove a gallery image before adding another.",
        },
        413,
      );
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return reply({ error: "Invalid request format." }, 400);
    }
    if (!body || !Number.isInteger(body.version))
      return reply({ error: "A workspace version is required." }, 400);
    const invalid = validateWorkspace(body.data);
    if (invalid) return reply({ error: invalid }, 422);
    const [updated] = await db
      .update(demoWorkspaces)
      .set({
        data: body.data,
        version: sql`${demoWorkspaces.version} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(demoWorkspaces.key, keyFor(token)),
          eq(demoWorkspaces.version, body.version),
        ),
      )
      .returning({ version: demoWorkspaces.version });
    if (!updated)
      return reply(
        {
          error:
            "The workspace changed in another tab. The latest data has been loaded; please review and retry.",
        },
        409,
      );
    return reply(updated);
  } catch {
    return reply(
      {
        error:
          "Changes could not be saved. Your previous data is safe. Please retry.",
      },
      503,
    );
  }
}
