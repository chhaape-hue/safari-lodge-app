import { NextRequest, NextResponse } from "next/server"

const NB_BASE = "https://www.nightsbridge.co.za/bridge"
const NBID     = process.env.NIGHTSBRIDGE_NBID     ?? ""
const PASSWORD = process.env.NIGHTSBRIDGE_PASSWORD ?? ""

/**
 * GET /api/nightsbridge/from-price?bbid=12345
 * Returns the lowest available price for a property.
 * Should be called at least once per day.
 */
export async function GET(req: NextRequest) {
  if (!NBID || !PASSWORD) {
    return NextResponse.json(
      { error: "NightsBridge credentials not configured." },
      { status: 503 }
    )
  }

  const bbid = req.nextUrl.searchParams.get("bbid")
  if (!bbid) {
    return NextResponse.json({ error: "bbid is required" }, { status: 400 })
  }

  try {
    const url = new URL(`${NB_BASE}/fromprice`)
    url.searchParams.set("nbid", NBID)
    url.searchParams.set("password", PASSWORD)
    url.searchParams.set("bbid", bbid)

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `NightsBridge returned HTTP ${res.status}` }, { status: 502 })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = (err as Error).message ?? "Unknown error"
    return NextResponse.json({ error: msg }, { status: 502 })
  }
}
