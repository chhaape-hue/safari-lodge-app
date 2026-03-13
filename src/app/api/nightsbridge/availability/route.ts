import { NextRequest, NextResponse } from "next/server"

const NB_BASE = "https://www.nightsbridge.co.za/bridge"
const NBID     = process.env.NIGHTSBRIDGE_NBID     ?? ""
const PASSWORD = process.env.NIGHTSBRIDGE_PASSWORD ?? ""

export async function POST(req: NextRequest) {
  if (!NBID || !PASSWORD) {
    return NextResponse.json(
      { error: "NightsBridge credentials not configured. Set NIGHTSBRIDGE_NBID and NIGHTSBRIDGE_PASSWORD in Vercel environment variables." },
      { status: 503 }
    )
  }

  const { bbid, checkIn, checkOut, adults = 2, children = 0 } = await req.json()

  if (!bbid || !checkIn || !checkOut) {
    return NextResponse.json({ error: "bbid, checkIn and checkOut are required" }, { status: 400 })
  }

  try {
    const body = JSON.stringify({
      messagename: "availRQ",
      nbid: NBID,
      password: PASSWORD,
      bbid,
      startdate: checkIn,
      enddate: checkOut,
      adults,
      children,
    })

    const res = await fetch(`${NB_BASE}/avail`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body,
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
