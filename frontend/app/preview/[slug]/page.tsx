"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import Video from "next-video";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  format,
  addMonths,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR, tr } from "date-fns/locale";
import Image from "next/image";
import { SocialIcon } from "@/src/presentation/modules/Preview/components/SocialMedia";
import { Badge } from "@/components/ui/badge";

type Post = {
  id: string;
  title?: string;
  tema?: string;
  especificacao?: string;
  content?: string;
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
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [weekIndex, setWeekIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustText, setAdjustText] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch(`/api/public/client/${slug}/posts`, {
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erro ao carregar preview");
      setClient(data.client);
      setPosts(
        (data.posts || []).map((p: any) => ({
          ...p,
          date: new Date(p.publish_date),
        }))
      );
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [slug]);

  const allDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const totalWeeks = Math.ceil(allDays.length / 7);
  const daysForWeek = allDays.slice(weekIndex * 7, weekIndex * 7 + 7);

  useEffect(() => {
    const today = new Date();
    if (
      today.getMonth() === currentMonth.getMonth() &&
      today.getFullYear() === currentMonth.getFullYear()
    ) {
      const monthStart = startOfWeek(startOfMonth(currentMonth), {
        weekStartsOn: 1,
      });
      const diff = Math.floor(
        (today.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      setWeekIndex(Math.max(0, Math.min(totalWeeks - 1, Math.floor(diff / 7))));
    } else {
      setWeekIndex(0);
    }
  }, [currentMonth, totalWeeks]);

  const weekRange = useMemo(
    () =>
      daysForWeek.length
        ? { start: daysForWeek[0], end: daysForWeek[6] }
        : null,
    [daysForWeek]
  );
  const weekPosts = useMemo(
    () =>
      posts.filter(
        (p: any) =>
          weekRange && p.date >= weekRange.start && p.date <= weekRange.end
      ),
    [posts, weekRange]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [weekIndex, currentMonth, posts.length]);
  const selected = weekPosts[selectedIndex];

  // Media helpers
  const isVideo = !!(
    selected?.media_url &&
    (/\.(mp4|mov|avi|mkv|webm)$/i.test(selected.media_url) ||
      ["reels", "video", "vídeo"].includes(
        (selected?.tipo_conteudo || "").toLowerCase()
      ))
  );
  const isImage = !!(
    selected?.media_url &&
    (/\.(jpeg|jpg|gif|png|webp|avif|bmp)$/i.test(selected.media_url) ||
      ["imagem", "image", "foto", "stories", "carousel", "carrossel"].includes(
        (selected?.tipo_conteudo || "").toLowerCase()
      ))
  );

  useEffect(() => {
    async function loadHistory() {
      if (!selected?.id) {
        setHistory([]);
        return;
      }
      const res = await fetch(`/api/posts/${selected.id}/reviews`, {
        cache: "no-store",
      });
      const data = await res.json();
      setHistory(res.ok ? data.reviews || [] : []);
    }
    loadHistory();
  }, [selected?.id]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/public/posts/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Erro ao atualizar");
    await load();
    alert(
      status === "aprovado"
        ? "Post aprovado"
        : status === "em_revisao"
        ? "Marcado para revisao"
        : "Atualizado"
    );
  }

  function toggleSpeak(text?: string) {
    if (!text) return;
    try {
      const synth = window.speechSynthesis;
      if (speaking) {
        synth.cancel();
        setSpeaking(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "pt-BR";
      u.onend = () => setSpeaking(false);
      setSpeaking(true);
      synth.speak(u);
    } catch {
      /* ignore */
    }
  }

  async function submitAdjust() {
    if (!selected?.id) return;
    const text = (adjustText || "").trim();
    if (!text) {
      setAdjustError("Descreva o ajuste desejado.");
      return;
    }
    try {
      setAdjustLoading(true);
      const res = await fetch(`/api/public/posts/${selected?.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (res.ok) {
        await updateStatus(selected!.id, "em_revisao");
        const r = await fetch(`/api/posts/${selected!.id}/reviews`);
        const d = await r.json();
        setHistory(d.reviews || []);
        setAdjustOpen(false);
        setAdjustText("");
        setAdjustError(null);
      } else {
        const d = await res.json().catch(() => ({}));
        setAdjustError(d?.error || "Falha ao enviar");
      }
    } catch (e) {
      setAdjustError((e as any)?.message || String(e));
    } finally {
      setAdjustLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Cabeçalho */}
        <header className="flex flex-col md:flex-row md:items-center gap-4 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            {client?.logo_url && (
              <Image
                src={client.logo_url}
                alt={client.company_name}
                width={56}
                height={56}
                className="w-14 h-14 rounded-lg shadow-sm object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Preview
              </h1>
              <p className="text-slate-600 text-sm">
                Cliente:{" "}
                <span className="font-medium">
                  {client?.company_name || slug}
                </span>
              </p>
            </div>
          </div>
          <div className="md:ml-auto flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="rounded-md border-slate-300 hover:border-slate-400 hover:bg-slate-50"
              onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            >
              {"<"}
            </Button>
            <div className="text-slate-800 text-sm font-medium w-36 text-center">
              {(() => {
                const m = format(currentMonth, "MMMM yyyy", { locale: ptBR });
                return m.charAt(0).toUpperCase() + m.slice(1);
              })()}
            </div>
            <Button
              size="icon"
              variant="outline"
              className="rounded-md border-slate-300 hover:border-slate-400 hover:bg-slate-50"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              {">"}
            </Button>
          </div>
        </header>

        {/* Erro */}
        {error && (
          <Card className="border-red-200 bg-red-50 shadow-sm">
            <CardContent className="p-6 text-red-700 font-medium">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Semana atual */}
        <div className="flex items-center justify-between border border-slate-200 rounded-xl px-4 py-3 bg-white/80 shadow-sm">
          <div className="text-sm font-medium text-slate-800">
            {weekRange && (
              <>
                Semana {weekIndex + 1} (
                {format(currentMonth, "MMMM", { locale: ptBR })}){" "}
                {format(weekRange.start, "dd/MM")} a{" "}
                {format(weekRange.end, "dd/MM")}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {weekPosts.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`h-7 w-7 rounded-md border text-xs font-medium transition-all ${
                  i === selectedIndex
                    ? "bg-[#053665] text-white border-[#053665]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo principal */}
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-slate-600 font-medium">
              Carregando...
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-slate-500 font-medium">
              Nenhum post para revisar.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna principal */}
            <div className="lg:col-span-2">
              {/* Mídia */}
              <div className="relative bg-slate-200 rounded-xl overflow-hidden min-h-[420px] flex items-center justify-center">
                {selected?.media_url ? (
                  isVideo ? (
                    <Video
                      src={selected.media_url}
                      controls
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
                    />
                  ) : isImage ? (
                    <img
                      src={selected.media_url}
                      alt="media preview"
                      className="w-full h-auto max-h-[85vh] object-contain rounded-xl"
                    />
                  ) : (
                    <a
                      href={selected.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline p-4 block"
                    >
                      Ver arquivo anexo
                    </a>
                  )
                ) : (
                  <div className="text-slate-500 text-sm font-medium">
                    Sem mídia
                  </div>
                )}
              </div>

              {/* Dados */}
              <div className="space-y-4 mt-6">
                {/* Tema */}
                <div className="bg-white/90 border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                    Tema
                  </div>
                  <div className="text-slate-900 font-medium truncate">
                    {selected?.tema || "—"}
                  </div>
                </div>

                {/* Títulos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/90 border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                      Título da Postagem
                    </div>
                    <div className="text-slate-900 font-medium truncate">
                      {selected?.title || "Sem título"}
                    </div>
                  </div>
                  <div className="bg-white/90 border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                      Título do Conteúdo
                    </div>
                    <div className="text-slate-900 font-medium truncate">
                      {selected?.title || "Sem título"}
                    </div>
                  </div>
                </div>

                {/* Especificação */}
                <div className="bg-white/90 border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                    Especificação do Conteúdo
                  </div>
                  <div className="text-slate-800 leading-relaxed">
                    {selected?.especificacao || "—"}
                  </div>
                </div>

                {/* Canal */}
                <div className="bg-white/90 border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1">
                      Canal
                    </div>
                    <div className="text-slate-900 capitalize font-medium">
                      {selected?.social_network || "—"}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="bg-white/90 border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAdjustText("");
                        setAdjustError(null);
                        setAdjustOpen(true);
                      }}
                      className="border-slate-300 hover:border-slate-400"
                    >
                      Solicitar ajuste
                    </Button>
                    <Button
                      onClick={() =>
                        selected?.id && updateStatus(selected.id, "aprovado")
                      }
                      className="bg-[#053665] hover:bg-[#042B52] text-white"
                    >
                      Aprovar item
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Histórico */}
            {/* Histórico */}
            <Card className="border-slate-200 bg-white/90 shadow-sm rounded-xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#053665] font-semibold text-lg tracking-tight">
                    Histórico de Interações
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-xs font-medium border-slate-300 text-slate-600"
                  >
                    {history.length}{" "}
                    {history.length === 1 ? "evento" : "eventos"}
                  </Badge>
                </div>

                {history.length === 0 ? (
                  <div className="text-sm text-slate-500 py-10 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/40">
                    Nenhum evento registrado até o momento.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((h, index) => (
                      <div
                        key={h.id}
                        className={`group transition-all duration-200 border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-slate-300 ${
                          index % 2 === 0 ? "bg-white/95" : "bg-slate-50/70"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-2.5 w-2.5 rounded-full ${
                                h.author_type === "client"
                                  ? "bg-emerald-500"
                                  : "bg-blue-600"
                              }`}
                            ></div>
                            <span className="text-sm font-medium text-slate-900">
                              {h.author_type === "client"
                                ? "Cliente"
                                : "Equipe"}{" "}
                              <span className="text-slate-500 font-normal">
                                comentou
                              </span>
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-medium">
                            {h.created_at
                              ? format(
                                  new Date(h.created_at),
                                  "dd/MM/yyyy HH:mm"
                                )
                              : ""}
                          </span>
                        </div>

                        <p className="text-slate-700 text-sm mt-1 leading-relaxed whitespace-pre-wrap">
                          {h.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Modal de Ajuste */}
        <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl">
            <DialogHeader className="px-6 pt-5 pb-3 border-b border-slate-200">
              <DialogTitle className="text-base font-semibold text-slate-900">
                Solicitar ajuste
              </DialogTitle>
            </DialogHeader>
            <div className="px-6 py-4">
              <Textarea
                placeholder="Descreva de forma objetiva o ajuste desejado"
                value={adjustText}
                onChange={(e) => {
                  setAdjustText(e.target.value);
                  setAdjustError(null);
                }}
                className="min-h-28 bg-white border border-slate-200 rounded-lg"
              />
              {adjustError && (
                <div className="text-xs text-red-600 mt-2">{adjustError}</div>
              )}
            </div>
            <div className="px-6 pb-5 flex items-center justify-end gap-2 border-t border-slate-200 pt-3">
              <Button variant="outline" onClick={() => setAdjustOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={submitAdjust}
                disabled={adjustLoading}
                className="bg-[#053665] hover:bg-[#042B52] text-white"
              >
                {adjustLoading ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
