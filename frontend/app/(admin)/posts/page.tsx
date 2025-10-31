/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase/client";
import { listClients } from "@/lib/clients";
import { ListView } from "@/src/presentation/modules/Calendario/components/ListView";
import { PostModal } from "@/src/presentation/modules/Calendario/components/PostModal";

type Post = {
  id: string;
  title: string;
  content?: string | null;
  social_network: string;
  publish_date: string | Date;
  priority?: string | null;
  status: string;
  media_url?: string | null;
  tipo_conteudo?: string | null;
  tema?: string | null;
  especificacao?: string | null;
  client_id?: string | null;
  client_name?: string | null;
};

export default function PostsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);

  async function load() {
    try {
      setLoading(true);
      if (!user?.id) {
        setPosts([]);
        return;
      }

      const [postsRes, clientsRes] = await Promise.all([
        supabase
          .from("posts")
          .select("*")
          .eq("user_id", user.id)
          .order("publish_date", { ascending: false }),
        listClients(user.id).catch(() => [] as any[]),
      ]);

      const clients: any[] = (clientsRes as any[]) || [];
      const clientMap: Record<string, string> = Object.fromEntries(
        clients.map((c: any) => [String(c.id), c.company_name])
      );

      const data = (postsRes as any)?.data as any[] | undefined;
      const mapped: Post[] = (data || []).map((p: any) => ({
        id: String(p.id),
        title: p.title || "Sem titulo",
        content: p.content ?? p.especificacao ?? null,
        social_network: p.social_network || "",
        publish_date: p.publish_date || p.created_at || new Date().toISOString(),
        priority: p.priority ?? null,
        status: p.status || "pendente",
        media_url: undefined,
        tipo_conteudo: p.tipo_conteudo ?? null,
        tema: p.tema ?? null,
        especificacao: p.especificacao ?? null,
        client_id: p.client_id ?? null,
        client_name: p.client_id ? clientMap[String(p.client_id)] || null : null,
      }));
      setPosts(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [user?.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(p =>
      (p.title || "").toLowerCase().includes(q) ||
      (p.content || "").toLowerCase().includes(q) ||
      (p.tema || "").toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Posts</h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar por titulo, tema ou texto..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => router.push("/upload")}>Novo Post</Button>
        </div>
      </div>

      <ListView
      //@ts-ignore
        posts={filtered}
        loading={loading}
        onPostClick={(p) => { setSelected(p); setOpen(true); }}
        onStatusUpdate={() => load()}
        onClientClick={(name) => setQuery(name)}
      />

      <PostModal
        post={selected as any}
        isOpen={open}
        onClose={() => setOpen(false)}
        onUpdate={() => load()}
        onClientClick={(name) => { setQuery(name); setOpen(false); }}
      />

      {!loading && filtered.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum post encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            Tente ajustar a busca ou crie um novo post.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
﻿
