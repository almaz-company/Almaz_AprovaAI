/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Share2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// ===== Tipagem das props =====
type Post = {
  id: string;
  title: string;
  content?: string;
  social_network: string;
  publish_date: string | Date;
  priority?: string;
  status: string;
  client_name?: string;
};

type ListViewProps = {
  posts: Post[];
  onPostClick: (post: Post) => void;
  loading?: boolean;
  onStatusUpdate?: () => void;
  onClientClick?: (name: string) => void;
};

// ===== Ícones das redes =====
const getSocialIcon = (network: string) => {
  const icons: Record<string, any> = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube,
    tiktok: AlertCircle,
  };
  const IconComponent = icons[network] || AlertCircle;
  return <IconComponent className="w-4 h-4" />;
};

// ===== Status (cor + ícone) =====
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
    publicado: {
      color: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Share2,
    },
  };
  return configs[status] || configs.pendente;
};

// ===== Deriva status por etapa (Roteiro/Conteúdo) =====
type StageStatus = "pendente" | "aprovado" | "rejeitado" | "em_revisao";

const deriveStageStatuses = (status: string): { roteiro: StageStatus; conteudo: StageStatus } => {
  const s = (status || "").toLowerCase();
  if (s.startsWith("tema_")) {
    const step = s.replace("tema_", "") as StageStatus;
    return { roteiro: step, conteudo: "pendente" };
  }
  if (s.startsWith("conteudo_")) {
    const step = s.replace("conteudo_", "") as StageStatus;
    return { roteiro: "aprovado", conteudo: step };
  }
  switch (s) {
    case "pendente":
      return { roteiro: "pendente", conteudo: "pendente" };
    case "em_revisao":
      return { roteiro: "aprovado", conteudo: "em_revisao" };
    case "aprovado":
    case "publicado":
      return { roteiro: "aprovado", conteudo: "aprovado" };
    case "rejeitado":
      return { roteiro: "aprovado", conteudo: "rejeitado" };
    default:
      return { roteiro: "pendente", conteudo: "pendente" };
  }
};

const getStageBadgeStyles = (stage: StageStatus) => {
  const map: Record<StageStatus, string> = {
    aprovado: "bg-green-50 text-green-700 border border-green-200",
    pendente: "bg-amber-50 text-amber-700 border border-amber-200",
    rejeitado: "bg-red-50 text-red-700 border border-red-200",
    em_revisao: "bg-blue-50 text-blue-700 border border-blue-200",
  };
  return map[stage] || map.pendente;
};

const stageLabel = (stage: StageStatus) => {
  switch (stage) {
    case "aprovado":
      return "APROVADO";
    case "pendente":
      return "PENDENTE";
    case "rejeitado":
      return "REJEITADO";
    case "em_revisao":
      return "AJUSTE";
    default:
      return String(stage).toUpperCase();
  }
};

// ===== Componente principal =====
export function ListView({
  posts,
  onPostClick,
  loading = false,
  onStatusUpdate,
  onClientClick,
}: ListViewProps) {
  // Atualização de status via API
  const handleStatusChange = async (postId: string, newStatus: string) => {
    try {
      await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      onStatusUpdate?.();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert("Erro ao atualizar status da postagem. Tente novamente.");
    }
  };

  // ===== Estado de carregamento =====
  if (loading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 p-6">
        <CardContent className="p-0">
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="p-4 border border-slate-200 rounded-xl bg-white"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <Skeleton className="h-5 w-64 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===== Nenhum post encontrado =====
  if (!posts.length) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
        <CardContent className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Nenhuma postagem encontrada
          </h3>
          <p className="text-slate-500">
            Ajuste os filtros ou crie uma nova postagem.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ===== Renderização normal =====
  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">
          Lista de Postagens ({posts.length})
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => {
            //const statusConfig = getStatusConfig(post.status);
            //const StatusIcon = statusConfig.icon;
            const stages = deriveStageStatuses(post.status);

            return (
              <div
                key={post.id}
                className="p-4 border border-slate-200 rounded-xl hover:shadow-lg transition-all duration-200 cursor-pointer group bg-white"
                onClick={() => onPostClick(post)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors mb-1">
                      {post.title}
                    </h4>
                    <p className="text-sm text-slate-600 line-clamp-2">
                      {post.content || "Sem descrição"}
                    </p>
                  </div>
                 
                   {/* Indicadores de etapas (Roteiro / Conteúdo) */}
                  <div className="ml-auto hidden sm:flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Tema
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                          getStageBadgeStyles(stages.roteiro)
                        )}
                      >
                        {stageLabel(stages.roteiro)}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Visual
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                          getStageBadgeStyles(stages.conteudo)
                        )}
                      >
                        {stageLabel(stages.conteudo)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    {post.client_name && (
                      <Badge
                        variant="outline"
                        className="max-w-[200px] truncate hover:bg-slate-100 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onClientClick?.(post.client_name as string);
                        }}
                        title={post.client_name}
                      >
                        {post.client_name}
                      </Badge>
                    )}
                    <Badge variant="outline" className="flex items-center gap-1">
                      {getSocialIcon(post.social_network)}
                      {post.social_network}
                    </Badge>

                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {format(new Date(post.publish_date), "dd/MM/yyyy HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                    {/*
                    
                    */}
                    {post.priority && post.priority !== "media" && (
                      <Badge
                        className={cn(
                          post.priority === "alta"
                            ? "bg-red-100 text-red-800"
                            : post.priority === "media"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800",
                          "capitalize"
                        )}
                      >
                        {post.priority}
                      </Badge>
                    )}
                  </div>

                 

                  {/* Botões de ação */}
                  {post.status === "pendente" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(post.id, "rejeitado");
                        }}
                      >
                        Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(post.id, "aprovado");
                        }}
                      >
                        Aprovar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
