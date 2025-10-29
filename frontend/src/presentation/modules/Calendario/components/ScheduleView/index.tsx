/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isFuture, isPast, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============ Tipagem ============
type Post = {
  id: string;
  title: string;
  content?: string;
  social_network: string;
  publish_date: string | Date;
  status: string;
};

type ScheduleViewProps = {
  posts: Post[];
  onPostClick: (post: Post) => void;
  loading?: boolean;
};

// ============ Helpers ============
const getSocialIcon = (network: string) => {
  const icons: Record<string, any> = {
    instagram: Instagram,
    facebook: Facebook,
    linkedin: Linkedin,
    youtube: Youtube,
  };
  const Icon = icons[network] || Calendar;
  return <Icon className="w-4 h-4" />;
};

const getStatusConfig = (status: string) => {
  const configs: Record<
    string,
    { color: string; icon: React.ComponentType<any> }
  > = {
    tema_pendente: { color: "bg-amber-100 text-amber-800", icon: Clock },
    tema_aprovado: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    tema_rejeitado: { color: "bg-red-100 text-red-800", icon: XCircle },
    conteudo_pendente: { color: "bg-blue-100 text-blue-800", icon: Clock },
    conteudo_aprovado: {
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
    },
    conteudo_rejeitado: { color: "bg-red-100 text-red-800", icon: XCircle },
  };
  return (
    configs[status] || { color: "bg-gray-100 text-gray-800", icon: AlertCircle }
  );
};

// ============ Componente ============
export function ScheduleView({
  posts,
  onPostClick,
  loading = false,
}: ScheduleViewProps) {
  // === Estado de carregamento ===
  if (loading) {
    return (
      <div className="h-full p-4">
        <div className="h-full bg-slate-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  // === Ordenar e agrupar postagens por data ===
  const sortedPosts = [...posts].sort(
    (a, b) =>
      new Date(a.publish_date).getTime() - new Date(b.publish_date).getTime()
  );

  const groupedPosts: Record<string, Post[]> = sortedPosts.reduce(
    (acc, post) => {
      const dateKey = format(new Date(post.publish_date), "yyyy-MM-dd");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(post);
      return acc;
    },
    {} as Record<string, Post[]>
  );

  // === Nenhum post ===
  if (sortedPosts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm">
        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Nenhuma postagem agendada.</p>
      </div>
    );
  }

  // === Render principal ===
  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {Object.entries(groupedPosts).map(([dateKey, dayPosts]) => {
          const date = new Date(dateKey);
          const isTodayDate = isToday(date);
          const isFutureDate = isFuture(date);
          const isPastDate = isPast(date) && !isTodayDate;

          return (
            <div key={dateKey} className="space-y-3">
              {/* Cabeçalho da Data */}
              <div
                className={cn(
                  "sticky top-0 z-10 py-3 px-4 rounded-lg flex items-center gap-3 transition-all",
                  isTodayDate
                    ? "bg-blue-600 text-white shadow-sm"
                    : isFutureDate
                    ? "bg-white"
                    : "bg-slate-200 text-slate-600"
                )}
              >
                <Calendar className="w-5 h-5" />
                <h3
                  className={cn(
                    "text-lg font-semibold",
                    isTodayDate && "text-white"
                  )}
                >
                  {format(date, "EEEE, d 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </h3>

                {isTodayDate && (
                  <Badge className="bg-white/20 text-white border-white/30">
                    Hoje
                  </Badge>
                )}

                <span
                  className={cn(
                    "ml-auto text-sm",
                    isTodayDate ? "text-white/80" : "text-slate-500"
                  )}
                >
                  {dayPosts.length} {dayPosts.length === 1 ? "post" : "posts"}
                </span>
              </div>

              {/* Lista de postagens do dia */}
              <div className="space-y-2">
                {dayPosts.map((post) => {
                  const statusConfig = getStatusConfig(post.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={post.id}
                      onClick={() => onPostClick(post)}
                      className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-slate-200"
                    >
                      <div className="flex items-start gap-4">
                        {/* Horário */}
                        <div className="flex-shrink-0 w-16 text-center">
                          <div className="text-2xl font-bold text-slate-900">
                            {format(new Date(post.publish_date), "HH:mm")}
                          </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900 text-lg">
                              {post.title}
                            </h4>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge
                                className={cn(
                                  statusConfig.color,
                                  "flex items-center gap-1 capitalize"
                                )}
                              >
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {post.status.replace("_", " ")}
                              </Badge>

                              <Badge
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                {getSocialIcon(post.social_network)}
                                {post.social_network}
                              </Badge>
                            </div>
                          </div>

                          {post.content && (
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {post.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
