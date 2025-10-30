/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase/service"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { status } = await req.json()
    if (!status || !["aprovado", "rejeitado", "em_revisao"].includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 })
    }
    const { id } = await params
    let supabase: any
    try {
      supabase = getSupabaseServiceClient()
    } catch {
      supabase = await getSupabaseServerClient()
    }
    const { error } = await supabase.from("posts").update({ status }).eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
