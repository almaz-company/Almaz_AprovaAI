/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase/client";
import { listClients } from "@/lib/clients";
import { toast } from "sonner";
import { Activity, BarChart3, CheckCircle2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, FileText } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
} from "recharts";

type Post = {
  id: string;
  title: string;
  status: string;
  publish_date?: string | Date | null;
  social_network?: string | null;
  client_id?: string | null;
  created_at?: string | Date | null;
};

type Review = {
  id: string;
  post_id: string;
  author_type?: string | null;
  message?: string | null;
  created_at?: string | null;
};
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

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  async function handleExportPDF() {
    try {
      const { jsPDF } = await import("jspdf")
      await import("jspdf-autotable")

      const doc = new jsPDF()
      const now = new Date()
      doc.setFontSize(16)
      doc.text("Relatório - Visão Geral", 14, 18)
      doc.setFontSize(10)
      doc.text(`Gerado em: ${format(now, "dd/MM/yyyy HH:mm", { locale: ptBR })}`, 14, 25)

      // Resumo
      const resumoLines = [
        `Total de Posts: ${posts.length}`,
        `Clientes: ${clientsCount}`,
        `Aprovados: ${statusCounts.aprovado || 0}`,
        `Pendentes: ${statusCounts.pendente || 0}`,
        `Em revisão: ${statusCounts.em_revisao || 0}`,
        `Rejeitados: ${statusCounts.rejeitado || 0}`,
      ]
      doc.setFontSize(12)
      doc.text("Resumo", 14, 35)
      doc.setFontSize(10)
      resumoLines.forEach((line, i) => doc.text(line, 14, 42 + i * 6))

      // Posts Recentes
      let startY = 42 + resumoLines.length * 6 + 6
      doc.setFontSize(12)
      doc.text("Posts Recentes", 14, startY)
      startY += 4
      // @ts-ignore - plugin injects autoTable into jsPDF instance
      ;(doc as any).autoTable({
        startY,
        head: [["Título", "Status", "Rede", "Publicação"]],
        body: recentPosts.map((p) => [
          p.title || "",
          p.status || "",
          p.social_network || "-",
          p.publish_date
            ? format(new Date(p.publish_date), "dd/MM/yyyy HH:mm", { locale: ptBR })
            : "-",
        ]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [27, 75, 124] },
        theme: "grid",
      })
      // @ts-ignore
      let afterY = (doc as any).lastAutoTable?.finalY || startY + 10

      // Atividades Recentes
      doc.setFontSize(12)
      doc.text("Atividades Recentes", 14, afterY + 10)
      // @ts-ignore
      ;(doc as any).autoTable({
        startY: afterY + 14,
        head: [["Autor", "Cliente", "Mensagem", "Data"]],
        body: recentReviews.map((r) => [
          r.author_type === "user" ? "Usuário" : "Cliente",
          clientNameByPostId[r.post_id] || "",
          r.message || "-",
          r.created_at
            ? format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
            : "",
        ]),
        columnStyles: { 2: { cellWidth: 80 } },
        styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [27, 75, 124] },
        theme: "grid",
      })

      doc.save("relatorio-visao-geral.pdf")
      toast.success("PDF gerado com sucesso")
    } catch (e: any) {
      toast.error("Falha ao gerar PDF", { description: e?.message || String(e) })
    }
  }

  async function handleExportWord() {
    try {
      const docx = await import("docx")
      const {
        Document,
        Packer,
        Paragraph,
        HeadingLevel,
        Table,
        TableRow,
        TableCell,
        WidthType,
        TextRun,
      } = docx as any

      const now = new Date()

      const resumoPara = new Paragraph({
        children: [
          new TextRun({ text: `Gerado em: ${format(now, "dd/MM/yyyy HH:mm", { locale: ptBR })}`, size: 20 }),
        ],
      })

      const resumoList = [
        `Total de Posts: ${posts.length}`,
        `Clientes: ${clientsCount}`,
        `Aprovados: ${statusCounts.aprovado || 0}`,
        `Pendentes: ${statusCounts.pendente || 0}`,
        `Em revisão: ${statusCounts.em_revisao || 0}`,
        `Rejeitados: ${statusCounts.rejeitado || 0}`,
      ].map((t) => new Paragraph({ children: [new TextRun({ text: t, size: 20 })] }))

      const postsRows = [
        new TableRow({
          children: ["Título", "Status", "Rede", "Publicação"].map((h: string) =>
            new TableCell({ children: [new Paragraph({ text: h })], width: { size: 25, type: WidthType.PERCENTAGE } })
          ),
        }),
        ...recentPosts.map(
          (p) =>
            new TableRow({
              children: [
                p.title || "",
                p.status || "",
                p.social_network || "-",
                p.publish_date
                  ? format(new Date(p.publish_date), "dd/MM/yyyy HH:mm", { locale: ptBR })
                  : "-",
              ].map((v) => new TableCell({ children: [new Paragraph({ text: String(v) })] })),
            })
        ),
      ]

      const reviewsRows = [
        new TableRow({
          children: ["Autor", "Cliente", "Mensagem", "Data"].map((h: string) =>
            new TableCell({ children: [new Paragraph({ text: h })], width: { size: 25, type: WidthType.PERCENTAGE } })
          ),
        }),
        ...recentReviews.map(
          (r) =>
            new TableRow({
              children: [
                r.author_type === "user" ? "Usuário" : "Cliente",
                clientNameByPostId[r.post_id] || "",
                r.message || "-",
                r.created_at
                  ? format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                  : "",
              ].map((v) => new TableCell({ children: [new Paragraph({ text: String(v) })] })),
            })
        ),
      ]

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({ text: "Relatório - Visão Geral", heading: HeadingLevel.HEADING_1 }),
              resumoPara,
              ...resumoList,
              new Paragraph({ text: " " }),
              new Paragraph({ text: "Posts Recentes", heading: HeadingLevel.HEADING_2 }),
              new Table({ rows: postsRows }),
              new Paragraph({ text: " " }),
              new Paragraph({ text: "Atividades Recentes", heading: HeadingLevel.HEADING_2 }),
              new Table({ rows: reviewsRows }),
            ],
          },
        ],
      })

      const blob = await (Packer as any).toBlob(doc)
      downloadBlob(blob, "relatorio-visao-geral.docx")
      toast.success("Word gerado com sucesso")
    } catch (e: any) {
      toast.error("Falha ao gerar Word", { description: e?.message || String(e) })
    }
  }

  async function handleExportExcel() {
    try {
      const XLSX: any = await import("xlsx")

      const resumoSheetData = [
        ["Métrica", "Valor"],
        ["Total de Posts", posts.length],
        ["Clientes", clientsCount],
        ["Aprovados", statusCounts.aprovado || 0],
        ["Pendentes", statusCounts.pendente || 0],
        ["Em revisão", statusCounts.em_revisao || 0],
        ["Rejeitados", statusCounts.rejeitado || 0],
      ]
      const wsResumo = XLSX.utils.aoa_to_sheet(resumoSheetData)

      const postsSheetData = [
        ["Título", "Status", "Rede", "Publicação"],
        ...recentPosts.map((p) => [
          p.title || "",
          p.status || "",
          p.social_network || "-",
          p.publish_date
            ? format(new Date(p.publish_date), "dd/MM/yyyy HH:mm", { locale: ptBR })
            : "-",
        ]),
      ]
      const wsPosts = XLSX.utils.aoa_to_sheet(postsSheetData)

      const reviewsSheetData = [
        ["Autor", "Cliente", "Mensagem", "Data"],
        ...recentReviews.map((r) => [
          r.author_type === "user" ? "Usuário" : "Cliente",
          clientNameByPostId[r.post_id] || "",
          r.message || "-",
          r.created_at
            ? format(new Date(r.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
            : "",
        ]),
      ]
      const wsReviews = XLSX.utils.aoa_to_sheet(reviewsSheetData)

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo")
      XLSX.utils.book_append_sheet(wb, wsPosts, "Posts Recentes")
      XLSX.utils.book_append_sheet(wb, wsReviews, "Atividades Recentes")
      XLSX.writeFile(wb, "relatorio-visao-geral.xlsx")
      toast.success("Excel gerado com sucesso")
    } catch (e: any) {
      toast.error("Falha ao gerar Excel", { description: e?.message || String(e) })
    }
  }

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
      const clientRows: ClientRow[] = (clientsRes as any[]).map((c: any) => ({
        id: c.id,
        company_name: c.company_name,
      }));
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
      toast.error("Erro ao carregar dados do painel", {
        description: e?.message || String(e),
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const statusCounts = useMemo(() => {
    const base = {
      pendente: 0,
      em_revisao: 0,
      aprovado: 0,
      rejeitado: 0,
    } as Record<string, number>;
    posts.forEach((p) => {
      base[p.status] = (base[p.status] || 0) + 1;
    });
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

  const chartConfig = useMemo(
    () => ({
      instagram: { label: "Instagram", color: "#E1306C" }, // Rosa Instagram
      facebook: { label: "Facebook", color: "#1877F2" }, // Azul Facebook
      linkedin: { label: "LinkedIn", color: "#0A66C2" }, // Azul LinkedIn
      tiktok: { label: "TikTok", color: "#000000" }, // Preto TikTok
      youtube: { label: "YouTube", color: "#FF0000" }, // Vermelho YouTube
      sem_rede: { label: "Sem rede", color: "#053665" },
    }),
    []
  );

  const totalPosts = posts.length;
  const clientsById = useMemo(
    () => Object.fromEntries(clients.map((c) => [c.id, c.company_name])),
    [clients]
  );
  const clientNameByPostId = useMemo(() => {
    const map: Record<string, string> = {};
    posts.forEach((p) => {
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
            <p className="text-slate-600 text-sm">
              Acompanhe seus indicadores principais e atividades recentes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
              <FileDown className="w-4 h-4" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportWord} className="gap-2">
              <FileText className="w-4 h-4" /> Word
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
              <FileSpreadsheet className="w-4 h-4" /> Excel
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/90 border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Total de Posts
                </p>
                <p className="text-3xl font-bold text-[#0a2540]">
                  {loading ? "-" : totalPosts}
                </p>
              </div>
              <BarChart3 className="w-10 h-10 text-[#0a2540] opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Clientes
                </p>
                <p className="text-3xl font-bold text-[#0a2540]">
                  {loading ? "-" : clientsCount}
                </p>
              </div>
              <Users className="w-10 h-10 text-[#053665] opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Aprovados
                </p>
                <p className="text-3xl font-bold text-[#053665]">
                  {loading ? "-" : statusCounts.aprovado || 0}
                </p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-[#053665] opacity-80" />
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-0 shadow-md">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">
                  Pendentes
                </p>
                <p className="text-3xl font-bold text-[#053665]">
                  {loading ? "-" : statusCounts.pendente || 0}
                </p>
              </div>
              <Clock className="w-10 h-10 text-[#053665] opacity-80" />
            </CardContent>
          </Card>
        </div>

        {/* Charts + Recent activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Posts por Rede */}
          <Card className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-col gap-1 pb-2">
              <CardTitle className="text-xl font-semibold text-[#1B4B7C] tracking-tight">
                Distribuição por Rede
              </CardTitle>
              <p className="text-sm text-slate-500 font-medium">
                Visualize a proporção de postagens por plataforma
              </p>
            </CardHeader>

            <CardContent>
              <div className="h-[420px] w-full flex items-center justify-center">
                {networkData?.length ? (
                  <div className="w-full h-full">
                    <ChartContainer
                      config={chartConfig}
                      className="w-full h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        {networkData.length <= 5 ? (
                          <PieChart>
                            <Pie
                              data={networkData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={120}
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                            >
                              {networkData.map((entry, index) => {
                                const color =
                                  (chartConfig as any)[entry.name]?.color ||
                                  "#94a3b8";
                                return (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={color}
                                    className="transition-all duration-300 hover:opacity-80"
                                  />
                                );
                              })}
                            </Pie>
                            <ChartTooltip
                              content={<ChartTooltipContent nameKey="name" />}
                              cursor={{ fill: "rgba(0,0,0,0.04)" }}
                            />
                            <ChartLegend
                              content={<ChartLegendContent nameKey="name" />}
                              layout="horizontal"
                              align="center"
                              verticalAlign="bottom"
                            />
                          </PieChart>
                        ) : (
                          <BarChart data={networkData} barCategoryGap="25%">
                            <CartesianGrid
                              strokeDasharray="3 3"
                              stroke="#e2e8f0"
                            />
                            <XAxis
                              dataKey="name"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: "#475569", fontSize: 12 }}
                            />
                            <YAxis
                              allowDecimals={false}
                              tickLine={false}
                              axisLine={false}
                              tick={{ fill: "#475569", fontSize: 12 }}
                            />
                            <ChartTooltip
                              content={<ChartTooltipContent nameKey="name" />}
                              cursor={{ fill: "rgba(0,0,0,0.04)" }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                              {networkData.map((entry, index) => {
                                const color =
                                  (chartConfig as any)[entry.name]?.color ||
                                  "#3B82F6";
                                return (
                                  <Cell
                                    key={`cell-bar-${index}`}
                                    fill={color}
                                    className="transition-all duration-300 hover:opacity-80"
                                  />
                                );
                              })}
                            </Bar>
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                ) : (
                  <div className="text-slate-500 text-sm italic">
                    Nenhum dado disponível para exibir o gráfico.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl lg:col-span-2">
            <CardHeader className="flex items-center justify-between pb-3 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-[#1B4B7C] text-lg font-semibold tracking-tight">
                <Activity className="w-5 h-5 text-[#1B4B7C]" /> Atividades
                Recentes
              </CardTitle>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                Atualizado em tempo real
              </span>
            </CardHeader>

            <CardContent className="pt-5 px-4">
              {loading ? (
                <div className="flex items-center justify-center text-slate-500 text-sm animate-pulse py-10">
                  Carregando atividades...
                </div>
              ) : recentReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                  <Activity className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm">
                    Nenhuma atividade recente encontrada.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-100/60 text-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">
                          Autor
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Cliente
                        </th>
                        <th className="px-4 py-3 text-left font-semibold">
                          Mensagem
                        </th>
                        <th className="px-4 py-3 text-right font-semibold">
                          Data
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {recentReviews.map((r) => (
                        <tr
                          key={r.id}
                          className="hover:bg-slate-50/80 transition-colors duration-200"
                        >
                          <td className="px-4 py-3 text-[#1B4B7C] font-medium capitalize">
                            {r.author_type === "user" ? "Usuário" : "Cliente"}
                          </td>
                          <td className="px-4 py-3">
                            {clientNameByPostId[r.post_id] ? (
                              <Badge
                                variant="outline"
                                className="text-[11px] px-2 py-0 border-[#1B4B7C]/30 text-[#1B4B7C]"
                              >
                                {clientNameByPostId[r.post_id]}
                              </Badge>
                            ) : (
                              <span className="text-slate-400 text-xs italic">
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-700 whitespace-pre-wrap max-w-[300px] truncate">
                            {r.message || "Mensagem não disponível"}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-500 text-xs">
                            {r.created_at
                              ? format(
                                  new Date(r.created_at),
                                  "dd/MM/yyyy • HH:mm",
                                  {
                                    locale: ptBR,
                                  }
                                )
                              : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
                    <TableRow>
                      <TableCell colSpan={4} className="text-slate-500">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : recentPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-slate-500">
                        Nenhum post recente.
                      </TableCell>
                    </TableRow>
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
                          <Badge variant="outline">{p.status}</Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {p.social_network || "-"}
                        </TableCell>
                        <TableCell>
                          {p.publish_date
                            ? format(new Date(p.publish_date), "Pp", {
                                locale: ptBR,
                              })
                            : "-"}
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
