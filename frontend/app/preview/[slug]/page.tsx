"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import Video from "next-video";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      ["reels", "video", "vídeo"].includes((selected?.tipo_conteudo || "").toLowerCase()))
  );
  const isImage = !!(
    selected?.media_url && (
      /\.(jpeg|jpg|gif|png|webp|avif|bmp)$/i.test(selected.media_url) ||
      ["imagem", "image", "foto", "stories", "carousel", "carrossel"].includes(
        (selected?.tipo_conteudo || "").toLowerCase()
      )
    )
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
    const text = (adjustText || '').trim();
    if (!text) { setAdjustError('Descreva o ajuste desejado.'); return; }
    try {
      setAdjustLoading(true);
      const res = await fetch(`/api/public/posts/${selected?.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (res.ok) {
        await updateStatus(selected!.id, 'em_revisao');
        const r = await fetch(`/api/posts/${selected!.id}/reviews`);
        const d = await r.json();
        setHistory(d.reviews || []);
        setAdjustOpen(false);
        setAdjustText('');
        setAdjustError(null);
      } else {
        const d = await res.json().catch(() => ({}));
        setAdjustError(d?.error || 'Falha ao enviar');
      }
    } catch (e) {
      setAdjustError((e as any)?.message || String(e));
    } finally {
      setAdjustLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center gap-4 pb-4 border-b">
          {client?.logo_url && (
            <Image
              src={client.logo_url}
              alt={client.company_name}
              width={48}
              height={48}
              className="w-12 h-12 rounded-md shadow-sm object-cover"
            />
          )}
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Preview</h1>
            <p className="text-slate-600 text-sm">
              Cliente: {client?.company_name || slug}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            >
              {"<"}
            </Button>
            <div className="text-slate-700 text-sm font-medium w-32 text-center">
              {(() => {
                const m = format(currentMonth, "MMMM yyyy", { locale: ptBR });
                return m.charAt(0).toUpperCase() + m.slice(1);
              })()}
            </div>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              {">"}
            </Button>
          </div>
        </header>

        {error && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-6 text-red-700">{error}</CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between border rounded-md px-4 py-2">
          <div className="text-sm font-medium text-slate-800">
            {weekRange && (
              <>
                Semana {weekIndex + 1} (
                {format(currentMonth, "MMMM", { locale: ptBR })}){" "}
                {format(weekRange.start, "dd/MM")} ate{" "}
                {format(weekRange.end, "dd/MM")}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {weekPosts.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`h-7 w-7 rounded border text-xs font-medium ${
                  i === selectedIndex
                    ? "bg-slate-500 text-white border-slate-500"
                    : "bg-white text-slate-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-6 text-center text-slate-600">
              Carregando...
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-slate-500">
              Nenhum post para revisar.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="relative bg-zinc-300 rounded-md overflow-hidden min-h-[420px] flex items-center justify-center">
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
                  <div className="text-white/60 text-sm">Sem mídia</div>
                )}
              </div>

              <Card className="mt-4">
                <CardContent className="p-5">
                  <div className="text-slate-700 font-semibold mb-2">
                    Legenda
                  </div>
                  <div className="whitespace-pre-wrap text-slate-800 leading-relaxed min-h-20">
                    {selected?.content || "Sem legenda."}
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-xs text-slate-500">
                      {selected?.social_network && (
                        <span className="capitalize">
                          {selected.social_network}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAdjustText("");
                          setAdjustError(null);
                          setAdjustOpen(true);
                        }}
                      >
                        Solicitar ajuste
                      </Button>
                      <Button
                        onClick={() =>
                          selected?.id && updateStatus(selected.id, "aprovado")
                        }
                        className="bg-blue-950 hover:bg-emerald-700 text-white"
                      >
                        Aprovar item
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-5">
                <div className="text-blue-950 font-semibold mb-4">
                  Historico
                </div>
                <div className="divide-y">
                  {history.length === 0 && (
                    <div className="text-sm text-slate-500 py-6">
                      Sem eventos.
                    </div>
                  )}
                  {history.map((h) => (
                    <div key={h.id} className="py-3 text-sm">
                      <div className="text-slate-900 font-medium">
                        {h.author_type === "client" ? "Cliente" : "Equipe"}{" "}
                        comentou
                      </div>
                      <div className="text-slate-500 text-xs">
                        {h.created_at
                          ? format(new Date(h.created_at), "dd/MM/yyyy HH:mm")
                          : ""}
                      </div>
                      <div className="text-slate-700 mt-1 whitespace-pre-wrap">
                        {h.message}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
          <DialogContent className="sm:max-w-md p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-5 pb-3 border-b">
              <DialogTitle className="text-base font-semibold text-slate-900">Solicitar ajuste</DialogTitle>
            </DialogHeader>
            <div className="px-6 py-4">
              <Textarea
                placeholder="Descreva de forma objetiva o ajuste desejado"
                value={adjustText}
                onChange={(e)=>{ setAdjustText(e.target.value); setAdjustError(null); }}
                className="min-h-28 bg-white"
              />
              {adjustError && (
                <div className="text-xs text-red-600 mt-2">{adjustError}</div>
              )}
            </div>
            <div className="px-6 pb-5 flex items-center justify-end gap-2 border-t pt-3">
              <Button variant="outline" onClick={()=> setAdjustOpen(false)}>Cancelar</Button>
              <Button onClick={submitAdjust} disabled={adjustLoading} className="bg-blue-950 text-white">
                {adjustLoading ? 'Enviando...' : 'Enviar' }
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

