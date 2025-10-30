/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getSupabaseServiceClient } from "@/lib/supabase/service"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Use service role for read to avoid auth coupling in the admin table badge
    let supabase: any
    try {
      supabase = getSupabaseServiceClient()
    } catch {
      supabase = await getSupabaseServerClient()
    }
    const { data, error } = await supabase
      .from("post_reviews")
      .select("id, post_id, message, author_type, created_at")
      .eq("post_id", id)
      .order("created_at", { ascending: false })
    if (error) throw error
    return NextResponse.json({ reviews: data || [] })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    // Use service role to simplify admin UI usage regardless of cookie state
    let supabase: any
    try {
      supabase = getSupabaseServiceClient()
    } catch {
      supabase = await getSupabaseServerClient()
    }
    const body = await req.json()
    const message = (body?.message || "").toString().trim()
    if (!message) return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 })
    const { error } = await supabase.from("post_reviews").insert({
      post_id: id,
      message,
      author_type: "user",
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
