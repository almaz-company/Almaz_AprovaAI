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
        publish_date:
          p.publish_date || p.created_at || new Date().toISOString(),
        priority: p.priority ?? null,
        status: p.status || "pendente",
        media_url: undefined,
        tipo_conteudo: p.tipo_conteudo ?? null,
        tema: p.tema ?? null,
        especificacao: p.especificacao ?? null,
        client_id: p.client_id ?? null,
        client_name: p.client_id
          ? clientMap[String(p.client_id)] || null
          : null,
      }));
      setPosts(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [user?.id]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.content || "").toLowerCase().includes(q) ||
        (p.tema || "").toLowerCase().includes(q)
    );
  }, [posts, query]);

  return (
    <div className="space-y-10">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#053665]">
            Gerenciamento de Posts
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1">
            Visualize, filtre e gerencie publicações recentes com facilidade.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Campo de busca */}
          <div className="relative">
            <Input
              placeholder="Buscar por título, tema ou texto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-72 pl-10 pr-3 py-2 rounded-xl border border-slate-200 shadow-sm focus:border-[#053665]/70 focus:ring-2 focus:ring-[#053665]/15 transition-all duration-200 placeholder:text-slate-400"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-3 top-2.5 h-5 w-5 text-slate-400 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
              />
            </svg>
          </div>

          {/* Botão Novo Post */}
          <Button
            onClick={() => router.push("/upload")}
            className="rounded-xl bg-[#053665] hover:bg-[#042B52] text-white font-medium px-5 py-2.5 shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Novo Post
          </Button>
        </div>
      </div>

      {/* Lista de Posts */}
      <div className="bg-white/90 border border-slate-200 rounded-2xl shadow-sm p-4 transition-all duration-300 hover:shadow-md">
        <ListView
          //@ts-ignore
          posts={filtered}
          loading={loading}
          onPostClick={(p) => {
            setSelected(p);
            setOpen(true);
          }}
          onStatusUpdate={() => load()}
          onClientClick={(name) => setQuery(name)}
        />
      </div>

      {/* Modal do Post */}
      <PostModal
        post={selected as any}
        isOpen={open}
        onClose={() => setOpen(false)}
        onUpdate={() => load()}
        onClientClick={(name) => {
          setQuery(name);
          setOpen(false);
        }}
      />
    </div>
  );
}
