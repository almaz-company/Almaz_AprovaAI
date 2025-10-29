/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
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
};

type PostModalProps = {
  post?: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
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
export function PostModal({ post, isOpen, onClose, onUpdate }: PostModalProps) {
  useEffect(() => {
    if (!isOpen) {
      // Resetar estados se necessário
    }
  }, [isOpen]);

  if (!post) return null;

  const statusConfig = getStatusConfig(post.status);
  const StatusIcon = statusConfig.icon;

  const handleQuickAction = async (action: string) => {
    try {
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

  const isVideo =
    post.media_url &&
    (/\.(mp4|mov|avi|mkv|webm)$/i.test(post.media_url) ||
      post.tipo_conteudo === "Reels" ||
      post.tipo_conteudo === "Video");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0">
        {/* Cabeçalho */}
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold text-slate-900">
            {getSocialIcon(post.social_network)}
            {post.title}
          </DialogTitle>
        </DialogHeader>

        {/* Corpo */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="flex items-center justify-between bg-white py-2 mb-4">
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
              Publicar em:{" "}
              {format(new Date(post.publish_date), "dd/MM/yyyy HH:mm", {
                locale: ptBR,
              })}
            </div>
          </div>

          {/* Preview da Mídia */}
          {post.media_url && (
            <div className="bg-slate-100 rounded-xl overflow-hidden mb-4 max-h-[500px] flex items-center justify-center">
              {isVideo ? (
                <video
                  src={post.media_url}
                  controls
                  className="w-full max-h-[500px] rounded-xl object-contain"
                  preload="metadata"
                >
                  Seu navegador não suporta o elemento de vídeo.
                </video>
              ) : /\.(jpeg|jpg|gif|png)$/i.test(post.media_url) ? (
                <img
                  src={post.media_url}
                  alt="media preview"
                  className="w-full max-h-[500px] object-contain rounded-xl"
                />
              ) : (
                <a
                  href={post.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline p-4 block"
                >
                  Ver arquivo anexo
                </a>
              )}
            </div>
          )}

          {/* Detalhes do Conteúdo */}
          <div className="p-4 bg-slate-50 rounded-lg mb-4">
            <h4 className="font-semibold text-slate-900 mb-1 text-sm">Tema:</h4>
            <p className="text-slate-700 text-sm mb-3">
              {post.tema || "Não definido"}
            </p>

            <h4 className="font-semibold text-slate-900 mb-1 text-sm">
              Tipo de Conteúdo:
            </h4>
            <p className="text-slate-700 text-sm mb-3">
              {post.tipo_conteudo || "Não definido"}
            </p>

            <h4 className="font-semibold text-slate-900 mb-1 text-sm">
              Especificação do Conteúdo:
            </h4>
            <p className="text-slate-700 text-sm whitespace-pre-line mb-3">
              {post.especificacao || "Sem especificações."}
            </p>
          </div>

          {/* Legenda / Texto */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">
              Legenda / Texto Principal:
            </h4>
            <p className="text-slate-700 bg-slate-50 p-4 rounded-lg whitespace-pre-line">
              {post.content || "Sem conteúdo de texto"}
            </p>
          </div>

          {/* Ações rápidas */}
          {post.status === "pendente" && (
            <div className="border-t pt-4 mt-4 bg-white">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleQuickAction("rejeitado")}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Rejeitar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleQuickAction("em_revisao")}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Marcar para Revisão
                </Button>
                <Button
                  onClick={() => handleQuickAction("aprovado")}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Aprovar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
