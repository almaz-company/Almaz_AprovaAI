/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import Video from "next-video";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

// ---------- Tipagem ----------
type Post = {
  id: string;
  title: string;
  status: string;
  publish_date: string | Date;
  social_network: string;
  media_url?: string;
  tipo_conteudo?: string;
  tema?: string;
  especificacao?: string;
  content?: string;
  client_name?: string;
};

type PostModalProps = {
  post?: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onClientClick?: (name: string) => void;
};

// ---------- Helpers ----------
const getSocialIcon = (network: string) => {
  const icons: Record<string, any> = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube,
    tiktok: AlertCircle,
  };
  const Icon = icons[network] || AlertCircle;
  return <Icon className="w-5 h-5" />;
};

const getStatusConfig = (status: string) => {
  const configs: Record<
    string,
    { color: string; icon: React.ComponentType<any> }
  > = {
    pendente: {
      color: "bg-amber-100 text-amber-800 border-amber-200",
      icon: Clock,
    },
    aprovado: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: CheckCircle,
    },
    rejeitado: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: XCircle,
    },
    em_revisao: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: AlertCircle,
    },
  };
  return configs[status] || configs.pendente;
};

// ---------- Componente ----------
export function PostModal({
  post,
  isOpen,
  onClose,
  onUpdate,
  onClientClick,
}: PostModalProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: "",
    tema: "",
    especificacao: "",
    tipo_conteudo: "",
    content: "",
  });
  useEffect(() => {
    if (!isOpen) {
      // Resetar estados se necessário
    }
  }, [isOpen]);

  /* moved null-check below to keep hooks order */

  const statusConfig = getStatusConfig((post && post.status) || "pendente");
  const StatusIcon = statusConfig.icon;

  const handleQuickAction = async (action: string) => {
    try {
      //@ts-ignore
      await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Erro ao atualizar post:", error);
    }
  };

  // Preenche campos ao abrir e ativa modo edição quando estiver em revisão
  useEffect(() => {
    if (post) {
      setEditData({
        title: post.title || "",
        tema: post.tema || "",
        especificacao: post.especificacao || "",
        tipo_conteudo: post.tipo_conteudo || "",
        content: post.content || "",
      });
      setIsEditing(post.status === "em_revisao");
    }
  }, [post]);

  if (!post) return null;
  const saveEdits = async () => {
    try {
      await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editData.title,
          tema: editData.tema,
          especificacao: editData.especificacao,
          tipo_conteudo: editData.tipo_conteudo,
          content: editData.content,
        }),
      });
      onUpdate();
      setIsEditing(false);
    } catch (e) {
      console.error("Erro ao salvar ajustes:", e);
    }
  };

  const tipo = (post.tipo_conteudo || "").toLowerCase();
  const isVideo = !!(
    post.media_url &&
    (/\.(mp4|mov|avi|mkv|webm)$/i.test(post.media_url) ||
      ["reels", "video", "vídeo"].includes(tipo))
  );
  const isImage = !!(
    post.media_url &&
    (/\.(jpeg|jpg|gif|png|webp|avif|bmp)$/i.test(post.media_url) ||
      ["imagem", "image", "foto", "stories", "carousel", "carrossel"].includes(
        tipo
      ))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 bg-white/95 border border-slate-200 rounded-2xl shadow-xl transition-all duration-300">
        {/* Cabeçalho */}
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-2xl">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-[#053665]">
            {getSocialIcon(post.social_network)}
            {post.title}
          </DialogTitle>

          {post.client_name && (
            <button
              type="button"
              className="text-sm text-slate-500 mt-1 text-left hover:underline hover:text-[#053665]"
              onClick={() => onClientClick?.(post.client_name as string)}
            >
              Cliente: {post.client_name}
            </button>
          )}
        </DialogHeader>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto px-6 pb-8 bg-gradient-to-b from-white to-slate-50">
          {/* Status */}
          <div className="flex items-center justify-between bg-white/90 rounded-xl border border-slate-200 p-3 shadow-sm mb-5">
            <Badge
              className={cn(
                statusConfig.color,
                "border flex items-center gap-1 text-sm px-3 py-1 capitalize"
              )}
            >
              <StatusIcon className="w-4 h-4" />
              {post.status.replace("_", " ")}
            </Badge>
            <div className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">Publicar em:</span>{" "}
              {format(new Date(post.publish_date), "dd/MM/yyyy HH:mm", {
                locale: ptBR,
              })}
            </div>
          </div>

          {/*
          {post.status === "em_revisao" && (
            <div className="mt-4 bg-white/90 p-5 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="text-sm text-slate-700">
                  <span className="font-medium text-[#053665]">
                    Solicitação de revisão ativa
                  </span>{" "}
                  — ajuste os conteúdos abaixo.
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing((v) => !v)}
                    className="border-slate-300 hover:border-slate-400"
                  >
                    {isEditing ? "Ocultar edição" : "Editar conteúdos"}
                  </Button>
                  {isEditing && (
                    <Button
                      onClick={saveEdits}
                      className="bg-[#053665] hover:bg-[#042B52] text-white"
                    >
                      Salvar ajustes
                    </Button>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="grid gap-3">
                  <Input
                    placeholder="Título"
                    value={editData.title}
                    onChange={(e) =>
                      setEditData({ ...editData, title: e.target.value })
                    }
                    className="rounded-xl border border-slate-200 focus:border-[#053665]/60 focus:ring-2 focus:ring-[#053665]/15 text-sm"
                  />
                  <Input
                    placeholder="Tema"
                    value={editData.tema}
                    onChange={(e) =>
                      setEditData({ ...editData, tema: e.target.value })
                    }
                    className="rounded-xl border border-slate-200 focus:border-[#053665]/60 focus:ring-2 focus:ring-[#053665]/15 text-sm"
                  />
                  <Input
                    placeholder="Tipo de conteúdo"
                    value={editData.tipo_conteudo}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        tipo_conteudo: e.target.value,
                      })
                    }
                    className="rounded-xl border border-slate-200 focus:border-[#053665]/60 focus:ring-2 focus:ring-[#053665]/15 text-sm"
                  />
                  <textarea
                    placeholder="Especificação"
                    value={editData.especificacao}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        especificacao: e.target.value,
                      })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm min-h-20 focus:border-[#053665]/60 focus:ring-2 focus:ring-[#053665]/15 transition-all"
                  />
                  <textarea
                    placeholder="Legenda / Conteúdo"
                    value={editData.content}
                    onChange={(e) =>
                      setEditData({ ...editData, content: e.target.value })
                    }
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm min-h-28 focus:border-[#053665]/60 focus:ring-2 focus:ring-[#053665]/15 transition-all"
                  />
                </div>
              )}
            </div>
          )}
          */}
          

            {/*
            {post.status === "em_revisao" && (
            <div className="flex justify-end gap-2 mt-4">
              <Button
                onClick={() => handleQuickAction("aprovado")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Marcar como aprovado
              </Button>
            </div>
          )}
            */}
          

          {/* Mídia */}
          {post.media_url && (
            <div className="bg-slate-100 rounded-xl overflow-hidden mb-5 border border-slate-200 flex items-center justify-center shadow-sm">
              {isVideo ? (
                <Video
                  src={post.media_url}
                  controls
                  className="w-full max-h-[480px] rounded-xl object-contain"
                  preload="metadata"
                />
              ) : isImage ? (
                <img
                  src={post.media_url}
                  alt="media preview"
                  className="w-full max-h-[480px] object-contain rounded-xl"
                />
              ) : (
                <a
                  href={post.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#053665] hover:text-[#042B52] underline p-4 block font-medium"
                >
                  Ver arquivo anexo
                </a>
              )}
            </div>
          )}

          {/* Detalhes */}
          <div className="bg-white/90 border border-slate-200 rounded-xl p-5 shadow-sm mb-5">
            <h4 className="text-sm font-semibold text-[#053665] mb-1">Tema</h4>
            <p className="text-slate-700 text-sm mb-3">
              {post.tema || "Não definido"}
            </p>

            <h4 className="text-sm font-semibold text-[#053665] mb-1">
              Tipo de Conteúdo
            </h4>
            <p className="text-slate-700 text-sm mb-3">
              {post.tipo_conteudo || "Não definido"}
            </p>

            <h4 className="text-sm font-semibold text-[#053665] mb-1">
              Especificação
            </h4>
            <p className="text-slate-700 text-sm whitespace-pre-line">
              {post.especificacao || "Sem especificações."}
            </p>
          </div>

          {/* Texto Principal */}
          <div>
            <h4 className="font-semibold text-[#053665] mb-2 text-sm">
              Legenda / Texto Principal
            </h4>
            <p className="text-slate-700 bg-slate-50 border border-slate-200 p-4 rounded-xl text-sm whitespace-pre-line leading-relaxed shadow-sm">
              {post.content || "Sem conteúdo de texto"}
            </p>
          </div>

          {/* Ações rápidas */}
          {post.status === "pendente" && (
            <div className="border-t border-slate-200 pt-4 mt-6">
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleQuickAction("rejeitado")}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-300"
                >
                  Rejeitar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickAction("em_revisao")}
                  className="text-[#053665] hover:text-[#042B52] hover:bg-blue-50 border-slate-300"
                >
                  Marcar para Revisão
                </Button>
                <Button
                  onClick={() => handleQuickAction("aprovado")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Aprovar
                </Button>
              </div>
            </div>
          )}

          {/* Ação extra */}
          <div className="flex justify-end mt-6">
            <Button
              variant="outline"
              onClick={() => router.push(`/upload?postId=${post.id}`)}
              className="border-slate-300 hover:border-slate-400"
            >
              Abrir upload de mídia
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
