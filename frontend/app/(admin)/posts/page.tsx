/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase/client";
import { listClients } from "@/lib/clients";
import { toast } from "sonner";

type Post = {
  id: string;
  title: string;
  status: string;
  publish_date?: string | Date | null;
  social_network?: string | null;
  client_id?: string | null;
  priority?: string | null;
  reviews_count?: number;
};

type ClientRow = { id: string; company_name: string; slug?: string };

export default function PostsManagementPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    network: "all",
    client: "all",
  });

  async function loadPosts() {
    try {
      setLoading(true);
      if (!user?.id) {
        setPosts([]);
        return;
      }
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("publish_date", { ascending: true });
      if (error) throw error;
      const base = (data || []).map((p: any) => ({
        id: String(p.id),
        title: p.title || "Sem titulo",
        status: p.status || "pendente",
        publish_date: p.publish_date || null,
        social_network: p.social_network || null,
        client_id: p.client_id || null,
        priority: p.priority || null,
      })) as Post[];

      // Aggregate review counts in one batch
      const ids = base.map((p) => p.id);
      const counts: Record<string, number> = {};
      if (ids.length) {
        const { data: revs, error: revErr } = await supabase
          .from("post_reviews")
          .select("post_id")
          .in("post_id", ids);
        if (!revErr) {
          (revs || []).forEach((r: any) => {
            const k = String(r.post_id);
            counts[k] = (counts[k] || 0) + 1;
          });
        }
      }
      setPosts(base.map((p) => ({ ...p, reviews_count: counts[p.id] || 0 })));
    } catch (e: any) {
      toast.error("Erro ao carregar posts", { description: e?.message || String(e) });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, [user?.id]);

  // Refresh posts when modal actions update reviews/status
  useEffect(() => {
    const handler = () => { loadPosts(); };
    window.addEventListener("reviews-updated", handler);
    return () => {

      window.removeEventListener("reviews-updated", handler);
    };
  }, [user?.id]);

  useEffect(() => {
    async function load() {
      try {
        if (!user?.id) return;
        const data = await listClients(user.id);
        setClients((data || []).map((c: any) => ({ id: c.id, company_name: c.company_name, slug: c.slug })));
      } catch {
        // ignore
      }
    }
    load();
  }, [user?.id]);

  const clientsById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c.company_name])), [clients]);
  const slugById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c.slug])), [clients]);

  const filtered = posts.filter((p) => {
    const s = filters.search.toLowerCase();
    const searchMatch = p.title.toLowerCase().includes(s);
    const statusMatch = filters.status === "all" || p.status === filters.status;
    const netMatch = filters.network === "all" || p.social_network === filters.network;
    const clientMatch = filters.client === "all" || (filters.client === "none" ? !p.client_id : p.client_id === filters.client);
    return searchMatch && statusMatch && netMatch && clientMatch;
  });

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao atualizar");
      toast.success("Status atualizado");
      await loadPosts();
    } catch (e: any) {
      toast.error("Erro ao atualizar status", { description: e?.message || String(e) });
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Gestao de Posts</h1>
            <p className="text-slate-600 text-sm">Acompanhe aprovacoes e solicitacoes de alteracao dos clientes.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/upload")}>Novo Post</Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow">
          <CardContent className="p-4 grid md:grid-cols-4 gap-3">
            <Input
              placeholder="Buscar por titulo"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            />
            <Select value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_revisao">Em revisao</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.network} onValueChange={(v) => setFilters((f) => ({ ...f, network: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Rede" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.client} onValueChange={(v) => setFilters((f) => ({ ...f, client: v }))}>
              <SelectTrigger>
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                <SelectItem value="none">Sem cliente</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Lista */}
        <Card className="bg-white/90 border-0 shadow">
          <CardHeader>
            <CardTitle>Posts ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-600 border-b">
                  <th className="py-2 pr-3">Titulo</th>
                  <th className="py-2 pr-3">Cliente</th>
                  <th className="py-2 pr-3">Canal</th>
                  <th className="py-2 pr-3">Publicacao</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Solicitacoes</th>
                  <th className="py-2 pr-3 text-right">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="py-6 text-center text-slate-500" colSpan={7}>Carregando...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td className="py-6 text-center text-slate-500" colSpan={7}>Nenhum post encontrado.</td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="border-b last:border-b-0">
                      <td className="py-3 pr-3">
                        <div className="font-medium text-slate-900">{p.title}</div>
                        {p.priority && (
                          <div className="text-xs text-slate-500">Prioridade: {p.priority}</div>
                        )}
                      </td>
                      <td className="py-3 pr-3">{p.client_id ? (clientsById[p.client_id] || "-") : "-"}</td>
                      <td className="py-3 pr-3 capitalize">{p.social_network || "-"}</td>
                      <td className="py-3 pr-3">{p.publish_date ? format(new Date(p.publish_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}</td>
                      <td className="py-3 pr-3">
                        <Badge className={
                          p.status === "aprovado" ? "bg-green-100 text-green-800" :
                          p.status === "rejeitado" ? "bg-red-100 text-red-800" :
                          p.status === "em_revisao" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                        }>
                          {p.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-3 pr-3">
                        <ReviewsButton postId={p.id} count={p.reviews_count || 0} />
                      </td>
                      <td className="py-3 pr-0">
                        <div className="flex gap-2 justify-end">
                          <CopyPreviewLink clientId={p.client_id || ""} clients={clients} slugs={slugById} />
                          <Button variant="outline" onClick={() => router.push(`/upload?postId=${p.id}`)}>Upload</Button>
                          {p.status !== "aprovado" && (
                            <Button onClick={() => updateStatus(p.id, "aprovado")} className="bg-green-600 text-white">Aprovar</Button>
                          )}
                          {p.status !== "em_revisao" && (
                            <Button variant="outline" onClick={() => updateStatus(p.id, "em_revisao")}>Revisao</Button>
                          )}
                          {p.status !== "rejeitado" && (
                            <Button variant="outline" className="text-red-600" onClick={() => updateStatus(p.id, "rejeitado")}>Rejeitar</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ReviewsButton({ postId, count }: { postId: string; count: number }) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [reviews, setReviews] = React.useState<any[]>([])
  const [adminMsg, setAdminMsg] = React.useState("")
  const [saving, setSaving] = React.useState(false)

  async function load() {
    try {
      setLoading(true)
      const res = await fetch(`/api/posts/${postId}/reviews`, { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) setReviews(data.reviews || [])
      else setReviews([])
    } finally { setLoading(false) }
  }

  React.useEffect(() => { if (open) load() }, [open, postId])

  async function sendReply() {
    try {
      const text = adminMsg.trim()
      if (!text) return
      setSaving(true)
      const res = await fetch(`/api/posts/${postId}/reviews`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro ao enviar')
      setAdminMsg("")
      await load()
      // notify parent

      window.dispatchEvent(new Event('reviews-updated'))
    } catch (e: any) {
      // Provide feedback so user understands failures
      const msg = e?.message || 'Falha ao enviar resposta'
      toast.error('Nao foi possivel enviar', { description: msg })
    } finally { setSaving(false) }
  }

  async function setStatus(next: string) {
    try {
      setSaving(true)
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Erro ao atualizar status')
      // notify parent to refresh list counts and badges

      window.dispatchEvent(new Event('reviews-updated'))
      setOpen(false)
    } catch (e: any) {
      const msg = e?.message || 'Falha ao atualizar status'
      toast.error('Acao nao concluida', { description: msg })
    } finally { setSaving(false) }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        {count} {count === 1 ? 'solicitacao' : 'solicitacoes'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>Solicitacoes</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="text-sm text-slate-500">Carregando…</div>
          ) : reviews.length === 0 ? (
            <div className="text-sm text-slate-500">Nenhuma solicitacao.</div>
          ) : (
            <ul className="space-y-3 max-h-80 overflow-auto">
              {reviews.map((r) => (
                <li key={r.id} className="text-sm">
                  <div className="text-slate-500 mb-1">[{r.author_type}] • {r.created_at ? new Date(r.created_at).toLocaleString() : ''}</div>
                  <div className="text-slate-800 whitespace-pre-wrap">{r.message}</div>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 space-y-2">
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows={3}
              placeholder="Responder ao cliente (opcional)"
              value={adminMsg}
              onChange={(e) => setAdminMsg(e.target.value)}
            />
            <div className="flex justify-between items-center gap-2">
              <div className="text-xs text-slate-500">Acoes rapidas</div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={saving || !adminMsg.trim()} onClick={sendReply}>Responder</Button>
                <Button variant="outline" disabled={saving} onClick={() => setStatus('em_revisao')}>Marcar como revisao</Button>
                <Button className="bg-green-600 text-white" disabled={saving} onClick={() => setStatus('aprovado')}>Marcar como resolvido</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function CopyPreviewLink({ clientId, clients, slugs }: { clientId: string, clients: ClientRow[], slugs: Record<string, string | undefined> }) {
  const slug = clientId ? slugs[clientId] : undefined
  if (!slug) return <Button variant="outline" disabled>Preview</Button>
  const link = `${location.origin}/preview/${slug}`
  return (
    <Button variant="outline" onClick={() => navigator.clipboard.writeText(link).then(() => toast.success('Link copiado'))}>Copiar link</Button>
  )
}
