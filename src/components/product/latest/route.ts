import { NextResponse } from "next/server"

export const revalidate = 60

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const limit = searchParams.get("limit") ?? "10"
  const backend = process.env.BACKEND_URL || "http://localhost:8800"
  const r = await fetch(`${backend}/productos/latest?limit=${encodeURIComponent(limit)}`)
  const data = await r.json()
  return NextResponse.json(data, { status: r.status })
}
