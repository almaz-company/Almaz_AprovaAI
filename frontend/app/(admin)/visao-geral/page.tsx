/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase/client";
import { listClients } from "@/lib/clients";
import { toast } from "sonner";
import { Activity, BarChart3, CheckCircle2, Clock, PlusCircle, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, ResponsiveContainer } from "recharts";

type Post = {
  id: string;
  title: string;
  status: string;
  publish_date?: string | Date | null;
  social_network?: string | null;
  client_id?: string | null;
  created_at?: string | Date | null;
};

type Review = { id: string; post_id: string; author_type?: string | null; message?: string | null; created_at?: string | null };
type ClientRow = { id: string; company_name: string };

export default function Painel() {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [clientsCount, setClientsCount] = useState<number>(0);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentReviews, setRecentReviews] = useState<Review[]>([]);

  async function loadData() {
    try {
      setLoading(true);
      if (!user?.id) {
        setPosts([]);
        setClientsCount(0);
        setRecentPosts([]);
        setRecentReviews([]);
        return;
      }

      const [postsRes, clientsRes] = await Promise.all([
        supabase
          .from("posts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        listClients(user.id).catch(() => [] as any[]),
      ]);

      const postsData = (postsRes?.data || []).map((p: any) => ({
        id: String(p.id),
        title: p.title || "Sem titulo",
        status: p.status || "pendente",
        publish_date: p.publish_date || null,
        social_network: p.social_network || null,
        client_id: p.client_id || null,
        created_at: p.created_at || null,
      })) as Post[];

      setPosts(postsData);
      const clientRows: ClientRow[] = (clientsRes as any[]).map((c: any) => ({ id: c.id, company_name: c.company_name }));
      setClients(clientRows);
      setClientsCount(clientRows.length || 0);

      // Recentes por data de criação
      setRecentPosts(postsData.slice(0, 5));

      // Buscar últimas avaliações (post_reviews) para os posts do usuário
      if (postsData.length) {
        const ids = postsData.slice(0, 100).map((p) => p.id); // limite de segurança
        const { data: reviews, error: revErr } = await supabase
          .from("post_reviews")
          .select("id, post_id, author_type, message, created_at")
          .in("post_id", ids)
          .order("created_at", { ascending: false })
          .limit(8);
        if (!revErr) setRecentReviews(reviews || []);
      }
    } catch (e: any) {
      toast.error("Erro ao carregar dados do painel", { description: e?.message || String(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, [user?.id]);

  const statusCounts = useMemo(() => {
    const base = { pendente: 0, em_revisao: 0, aprovado: 0, rejeitado: 0 } as Record<string, number>;
    posts.forEach((p) => { base[p.status] = (base[p.status] || 0) + 1; });
    return base;
  }, [posts]);

  const networkData = useMemo(() => {
    const counts: Record<string, number> = {};
    posts.forEach((p) => {
      const key = (p.social_network || "sem_rede").toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [posts]);

  const chartConfig = useMemo(() => ({
    instagram: { label: "Instagram", color: "#E1306C" },
    facebook: { label: "Facebook", color: "#1877F2" },
    linkedin: { label: "LinkedIn", color: "#0A66C2" },
    tiktok: { label: "TikTok", color: "#111111" },
    youtube: { label: "YouTube", color: "#FF0000" },
    sem_rede: { label: "Sem rede", color: "#94a3b8" },
  }), []);

  const totalPosts = posts.length;
  const clientsById = useMemo(() => Object.fromEntries(clients.map(c => [c.id, c.company_name])), [clients]);
  const clientNameByPostId = useMemo(() => {
    const map: Record<string, string> = {};
    posts.forEach(p => {
      if (p.client_id) map[p.id] = clientsById[p.client_id] || "";
    });
    return map;
  }, [posts, clientsById]);

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Visao Geral</h1>
            <p className="text-slate-600 text-sm">Acompanhe seus indicadores principais e atividades recentes.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/upload")} className="gap-2">
              <PlusCircle className="w-4 h-4" /> Novo Post
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/90 border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Total de Posts</p>
                <p className="text-3xl font-bold text-[#0a2540]">{loading ? "-" : totalPosts}</p>
              </div>
              <BarChart3 className="w-10 h-10 text-[#0a2540] opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Clientes</p>
                <p className="text-3xl font-bold text-[#0a2540]">{loading ? "-" : clientsCount}</p>
              </div>
              <Users className="w-10 h-10 text-[#053665] opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Aprovados</p>
                <p className="text-3xl font-bold text-green-700">{loading ? "-" : (statusCounts.aprovado || 0)}</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-green-600 opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Pendentes</p>
                <p className="text-3xl font-bold text-amber-600">{loading ? "-" : (statusCounts.pendente || 0)}</p>
              </div>
              <Clock className="w-10 h-10 text-amber-600 opacity-80" />
            </CardContent>
          </Card>
        </div>

        {/* Charts + Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts por Rede */}
          <Card className="bg-white/90 border-0 shadow-md lg:col-span-2">
            <CardHeader>
              <CardTitle>Distribuicao por Rede</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer>
                    {networkData.length <= 5 ? (
                      <PieChart>
                        <Pie data={networkData} dataKey="value" nameKey="name" outerRadius={100} label>
                          {networkData.map((entry, index) => {
                            const color = (chartConfig as any)[entry.name]?.color || "#94a3b8";
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                      </PieChart>
                    ) : (
                      <BarChart data={networkData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {networkData.map((entry, index) => {
                            const color = (chartConfig as any)[entry.name]?.color || "#94a3b8";
                            return <Cell key={`cell-bar-${index}`} fill={color} />;
                          })}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Atividades recentes */}
          <Card className="bg-white/90 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Atividades Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-slate-500">Carregando...</div>
              ) : recentReviews.length === 0 ? (
                <div className="text-sm text-slate-500">Sem atividades recentes.</div>
              ) : (
                <ul className="space-y-4">
                  {recentReviews.map((r) => (
                    <li key={r.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-700 font-medium">[{r.author_type || "cliente"}]</span>
                          {clientNameByPostId[r.post_id] && (
                            <Badge variant="outline" className="text-xs">{clientNameByPostId[r.post_id]}</Badge>
                          )}
                        </div>
                        <span className="text-slate-500">{r.created_at ? format(new Date(r.created_at), "Pp", { locale: ptBR }) : ""}</span>
                      </div>
                      <div className="text-slate-700 whitespace-pre-wrap mt-1">{r.message || "Mensagem"}</div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lista de posts recentes */}
        <Card className="bg-white/90 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Posts Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titulo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rede</TableHead>
                    <TableHead>Publicacao</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-slate-500">Carregando...</TableCell></TableRow>
                  ) : recentPosts.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-slate-500">Nenhum post recente.</TableCell></TableRow>
                  ) : (
                    recentPosts.map((p) => (
                      <TableRow key={p.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{p.title}</span>
                            {p.client_id && (
                              <Badge variant="outline" className="text-xs">
                                {clientsById[p.client_id] || "Cliente"}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{p.social_network || "-"}</TableCell>
                        <TableCell>
                          {p.publish_date ? format(new Date(p.publish_date), "Pp", { locale: ptBR }) : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
