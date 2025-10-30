"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
} from "date-fns";

type Post = {
  id: string;
  title: string;
  tema?: string;
  especificacao?: string;
  tipo_conteudo?: string;
  social_network: string;
  publish_date: string;
  status: string;
  media_url?: string;
};

export default function PublicClientPreviewPage() {
  const params = useParams<{ slug: string }>();
  const slug = (params?.slug as string) || "";
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [activeEditId, setActiveEditId] = useState<string | null>(null);
  const [editMsg, setEditMsg] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailPost, setDetailPost] = useState<any | null>(null);
  const [weekIndex, setWeekIndex] = useState(0);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch(`/api/public/client/${slug}/posts`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao carregar preview");
      setClient(data.client);
      setPosts(data.posts || []);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  const parsed = useMemo(
    () =>
      posts
        .map((p) => ({
          ...p,
          date: new Date(p.publish_date),
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [posts]
  );

  const daysForCalendar = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const all = eachDayOfInterval({ start, end });
    const startIdx = weekIndex * 7;
    return all.slice(startIdx, startIdx + 7);
  }, [currentMonth, weekIndex]);

  const totalWeeks = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    const len = eachDayOfInterval({ start, end }).length;
    return Math.ceil(len / 7);
  }, [currentMonth]);

  useEffect(() => {
    const today = new Date();
    if (
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    ) {
      const monthStart = startOfWeek(startOfMonth(currentMonth), {
        weekStartsOn: 1,
      });
      const diffDays = Math.floor(
        (today.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const idx = Math.max(
        0,
        Math.min(totalWeeks - 1, Math.floor(diffDays / 7))
      );
      setWeekIndex(idx);
    } else {
      setWeekIndex(0);
    }
  }, [currentMonth, totalWeeks]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/public/posts/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Erro ao atualizar status");
    await load();
    alert(
      status === "aprovado"
        ? "Post aprovado"
        : status === "rejeitado"
        ? "Solicitada alteração"
        : "Marcado para revisão"
    );
  }

  async function submitInlineChange(postId: string) {
    const text = editMsg.trim();
    if (!text) {
      alert("Descreva as alterações desejadas");
      return;
    }
    const res = await fetch(`/api/public/posts/${postId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Erro ao enviar solicitação");
      return;
    }
    await updateStatus(postId, "em_revisao");
    setActiveEditId(null);
    setEditMsg("");
  }

  function openDetail(p: any) {
    setDetailPost(p);
    setDetailOpen(true);
  }

  function setOpen(arg0: boolean): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50/40 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center gap-4 pb-4 border-b">
          {client?.logo_url && (
            <img
              src={client.logo_url}
              alt={client.company_name}
              className="w-12 h-12 rounded-md shadow-sm object-cover"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Aprovação de Conteúdo
            </h1>
            <p className="text-slate-600 text-sm mt-1">
              Cliente: {client?.company_name || slug}
            </p>
          </div>
        </header>

        {error && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-6 text-red-700 font-medium">
              {error}
            </CardContent>
          </Card>
        )}

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-5xl rounded-2xl border border-slate-200 shadow-lg bg-white/95 backdrop-blur-sm px-8 py-6">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between text-2xl font-semibold text-[#0a2540]">
                <span>{detailPost?.title || detailPost?.tema || "Post"}</span>
                {detailPost?.status && (
                  <Badge className="capitalize bg-[#0a2540]/10 text-[#0a2540] border border-[#0a2540]/20">
                    {String(detailPost.status).replace("_", " ")}
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>

            {detailPost && (
              <div className="grid md:grid-cols-2 gap-10 mt-6">
                {/* Lado esquerdo: mídia + especificação */}
                <div className="space-y-6">
                  {detailPost.media_url &&
                    (/\.(mp4|mov|avi|mkv|webm)$/i.test(detailPost.media_url) ? (
                      <video
                        src={detailPost.media_url}
                        controls
                        className="w-full rounded-xl border border-slate-200 shadow-md max-h-[480px] object-contain"
                      />
                    ) : (
                      <img
                        src={detailPost.media_url}
                        alt="preview"
                        className="w-full rounded-xl border border-slate-200 shadow-md max-h-[480px] object-contain"
                      />
                    ))}

                  {detailPost.especificacao && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm">
                      <div className="text-slate-500 font-medium mb-1">
                        Especificação
                      </div>
                      <div className="whitespace-pre-line text-slate-800 leading-relaxed">
                        {detailPost.especificacao}
                      </div>
                    </div>
                  )}
                </div>

                {/* Lado direito: dados + ações */}
                <div className="flex flex-col justify-between space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-slate-500 font-medium">Canal</div>
                      <div className="font-semibold text-[#0a2540] capitalize">
                        {detailPost.social_network}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500 font-medium">Formato</div>
                      <div className="font-semibold text-[#0a2540]">
                        {detailPost.tipo_conteudo || "-"}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-slate-500 font-medium">
                        Publicação
                      </div>
                      <div className="font-semibold text-[#0a2540]">
                        {detailPost.date
                          ? format(detailPost.date, "dd/MM/yyyy HH:mm")
                          : detailPost.publish_date
                          ? format(
                              new Date(detailPost.publish_date),
                              "dd/MM/yyyy HH:mm"
                            )
                          : "-"}
                      </div>
                    </div>
                  </div>

                  {/* Botões de ação alinhados */}
                  <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-slate-100">
                    <Button
                      variant="outline"
                      onClick={() => setOpen(true)}
                      className="border-[#dc2626]/40 text-[#dc2626] hover:bg-[#dc2626]/10 rounded-full font-medium transition"
                    >
                      Solicitar alteração
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => updateStatus(detailPost.id, "em_revisao")}
                      className="border-[#0a2540]/40 text-[#0a2540] hover:bg-[#0a2540]/10 rounded-full font-medium transition"
                    >
                      Marcar para revisão
                    </Button>
                    <Button
                      onClick={() => updateStatus(detailPost.id, "aprovado")}
                      className="bg-[#0a2540] hover:bg-[#0a2540]/90 text-white rounded-full font-medium px-6 transition"
                    >
                      Aprovar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex gap-2">
            <Button
              variant={view === "calendar" ? "default" : "outline"}
              className="rounded-full"
              onClick={() => setView("calendar")}
            >
              📅 Calendário
            </Button>
          </div>
          {view === "calendar" && (
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
              >
                {"‹"}
              </Button>
              <div className="text-slate-700 font-semibold">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                {"›"}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 justify-end mb-2">
          {Array.from({ length: totalWeeks }).map((_, i) => (
            <Button
              key={i}
              size="sm"
              variant={i === weekIndex ? "default" : "outline"}
              onClick={() => setWeekIndex(i)}
              className="rounded-full"
            >
              Semana {String(i + 1).padStart(2, "0")}
            </Button>
          ))}
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-6 text-center text-slate-600">
              Carregando…
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-slate-500">
              Nenhum post para revisar.
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/95 border border-slate-200 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className="grid grid-cols-7 text-xs text-slate-500 mb-2 font-medium uppercase tracking-wide">
                {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((d) => (
                  <div key={d} className="text-center">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {daysForCalendar.map((day) => {
                  const dayPosts = parsed.filter((p) => isSameDay(p.date, day));
                  const muted = !isSameMonth(day, currentMonth);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-28 rounded-xl border border-slate-200 p-2 transition-all hover:shadow-sm ${
                        muted ? "bg-slate-50 text-slate-400" : "bg-white"
                      }`}
                    >
                      <div className="text-right text-[11px] font-medium text-slate-500 mb-1">
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1">
                        {dayPosts.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => openDetail(p)}
                            className="w-full text-left text-[11px] leading-snug p-2 rounded-lg bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                          >
                            <div className="flex justify-between">
                              <span className="font-medium truncate max-w-[70%] text-slate-800">
                                {p.title || p.tema || "Post"}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {format(p.date, "HH:mm")}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-600">
                              <span className="capitalize">
                                {p.social_network}
                              </span>
                              <span>•</span>
                              <span className="capitalize">
                                {p.status.replace("_", " ")}
                              </span>
                            </div>
                          </button>
                        ))}
                        {dayPosts.length === 0 && (
                          <div className="text-[10px] text-slate-300 text-center italic">
                            —
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function ReviewActions({
  postId,
  onAfterSubmit,
}: {
  postId: string;
  onAfterSubmit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState("");

  async function submitChange() {
    if (!msg.trim()) {
      alert("Descreva as alterações desejadas");
      return;
    }
    const res = await fetch(`/api/public/posts/${postId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Erro ao enviar solicitação");
      return;
    }
    await fetch(`/api/public/posts/${postId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "em_revisao" }),
    });
    setMsg("");
    setOpen(false);
    onAfterSubmit();
    alert("Solicitação enviada!");
  }

  async function approve() {
    await fetch(`/api/public/posts/${postId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "aprovado" }),
    });
    onAfterSubmit();
    alert("Aprovado!");
  }

  function updateStatus(postId: string, arg1: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="flex flex-col gap-3 pt-4">
      {open && (
        <div className="space-y-3">
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Descreva as alterações desejadas"
            className="w-full border border-slate-300 focus:ring-2 focus:ring-blue-400 rounded-lg p-2 text-sm outline-none transition"
            rows={3}
          />
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={submitChange}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Enviar solicitação
            </Button>
          </div>
        </div>
      )}
      {!open && (
        <div className="flex flex-wrap gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(true)}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Solicitar alteração
          </Button>
          <Button
            variant="outline"
            onClick={() => updateStatus(postId, "em_revisao")}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            Marcar para revisão
          </Button>
          <Button
            onClick={approve}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Aprovar
          </Button>
        </div>
      )}
    </div>
  );
}
