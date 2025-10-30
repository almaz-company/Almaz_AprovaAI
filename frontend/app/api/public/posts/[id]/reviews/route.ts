/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase/service"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { message } = await req.json()
    const text = (message || "").toString().trim()
    if (!text) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 })
    const supabase = getSupabaseServiceClient()
    const { error } = await supabase.from("post_reviews").insert({
      post_id: id,
      message: text,
      author_type: "client",
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}

