/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase/service"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const allowed = ["status", "title", "publish_date", "social_network", "priority", "client_id", "tema", "especificacao", "content"]
    const payload: Record<string, any> = {}
    for (const k of allowed) if (k in body) payload[k] = body[k]
    if (typeof payload.status === 'string') {
      // Normaliza novos status do board para os usados no banco
      if (payload.status === 'concluido') payload.status = 'aprovado'
      else if (payload.status === 'em_progresso') payload.status = 'em_revisao'
      else if (payload.status === 'pendente') payload.status = 'pendente'
    }
    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 })
    }

    // Use service role to avoid client-cookie coupling on admin UI
    // Fallback gracefully to server client when the service key
    // is not configured in local environments.
    let supabase: any
    try {
      supabase = getSupabaseServiceClient()
    } catch {
      supabase = await getSupabaseServerClient()
    }
    const { error } = await supabase
      .from("posts")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
