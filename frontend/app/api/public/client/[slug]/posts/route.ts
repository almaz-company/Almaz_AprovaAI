/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import { getSupabaseServiceClient } from "@/lib/supabase/service"

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const supabase = getSupabaseServiceClient()

    const { data: client, error: clientErr } = await supabase
      .from("clients")
      .select("id, company_name, logo_url")
      .eq("slug", slug)
      .single()
    if (clientErr) throw clientErr
    if (!client) return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })

    const { data: posts, error: postsErr } = await supabase
      .from("posts")
      .select("*")
      .eq("client_id", client.id)
      .order("publish_date", { ascending: false })
    if (postsErr) throw postsErr

    // Attach first media signed URL if available
    const enriched = [] as any[]
    for (const p of posts || []) {
      let media_url: string | undefined
      const { data: files, error: filesErr } = await supabase
        .from("files")
        .select("bucket, path")
        .eq("post_id", p.id)
        .order("created_at", { ascending: false })
        .limit(1)
      if (!filesErr && files && files.length > 0) {
        const f = files[0]
        const { data: signed } = await supabase
          .storage
          .from(f.bucket)
          .createSignedUrl(f.path, 60 * 60 * 24) // 24h
        media_url = signed?.signedUrl
      }
      enriched.push({
        id: p.id,
        title: p.title,
        tema: p.tema,
        especificacao: p.especificacao,
        content: (p as any).content ?? p.especificacao ?? null,
        tipo_conteudo: p.tipo_conteudo,
        social_network: p.social_network,
        publish_date: p.publish_date,
        status: p.status,
        media_url,
      })
    }

    return NextResponse.json({ client, posts: enriched })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || String(e) }, { status: 500 })
  }
}
