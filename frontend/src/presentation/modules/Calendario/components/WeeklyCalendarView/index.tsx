/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { startOfWeek, addDays, isSameDay, format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

// ====================== Tipagem ======================
type Post = {
  id: string;
  title: string;
  status: string;
  publish_date?: string | Date;
};

type WeeklyCalendarViewProps = {
  posts: Post[];
  weekStart: Date;
  onPostClick: (post: Post) => void;
  loading?: boolean;
};

// ====================== Helpers ======================
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pendente: "bg-amber-100 text-amber-800 border-amber-200",
    aprovado: "bg-green-100 text-green-800 border-green-200",
    rejeitado: "bg-red-100 text-red-800 border-red-200",
    em_revisao: "bg-blue-100 text-blue-800 border-blue-200",
    publicado: "bg-purple-100 text-purple-800 border-purple-200",
  };
  return colors[status] || colors.pendente;
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, React.ComponentType<any>> = {
    pendente: Clock,
    aprovado: CheckCircle,
    rejeitado: XCircle,
    em_revisao: AlertCircle,
  };
  const Icon = icons[status] || Clock;
  return <Icon className="w-3 h-3" />;
};

// ====================== Componente ======================
export function WeeklyCalendarView({
  posts,
  weekStart,
  onPostClick,
  loading = false,
}: WeeklyCalendarViewProps) {
  const startDate = startOfWeek(weekStart, { locale: ptBR });
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const getPostsForDay = (day: Date) =>
    posts.filter(
      (post) => post.publish_date && isSameDay(new Date(post.publish_date), day)
    );

  const weekDayNames = [
    "Domingo",
    "Segunda",
    "Terça",
    "Quarta",
    "Quinta",
    "Sexta",
    "Sábado",
  ];

  // Estado de carregamento
  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-7 gap-3">
          {weekDayNames.map((day) => (
            <div key={day} className="p-3">
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-4 w-12 mb-3" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  // Render principal
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200 overflow-hidden">
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayPosts = getPostsForDay(day);
          const isTodayDate = isToday(day);

          return (
            <Droppable key={day.toISOString()} droppableId={day.toISOString()}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "min-h-[400px] p-3 border-r border-b border-slate-200 last:border-r-0 transition-colors",
                    snapshot.isDraggingOver
                      ? "bg-blue-50"
                      : "bg-white hover:bg-slate-50",
                    isTodayDate && "bg-blue-50/30"
                  )}
                >
                  {/* Cabeçalho do dia */}
                  <div className="mb-3 pb-2 border-b border-slate-200">
                    <div
                      className={cn(
                        "text-xs font-bold uppercase tracking-wider mb-1",
                        isTodayDate ? "text-blue-600" : "text-slate-600"
                      )}
                    >
                      {weekDayNames[day.getDay()]}
                    </div>
                    <div
                      className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                        isTodayDate
                          ? "bg-blue-600 text-white"
                          : "text-slate-900"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                  </div>

                  {/* Posts do dia */}
                  <div className="space-y-2 overflow-y-auto max-h-[320px]">
                    {dayPosts.map((post, index) => (
                      <Draggable key={post.id} draggableId={post.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onPostClick(post)}
                            className={cn(
                              "p-2 bg-white rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200",
                              snapshot.isDragging
                                ? "shadow-lg ring-2 ring-blue-400 rotate-2"
                                : "shadow-sm border-slate-200"
                            )}
                          >
                            <p className="text-xs font-semibold text-slate-900 truncate leading-tight mb-1.5">
                              {post.title}
                            </p>
                            <div className="flex items-center gap-1">
                              <Badge
                                className={cn(
                                  getStatusColor(post.status),
                                  "text-[9px] px-1.5 py-0 h-5 border flex items-center gap-1"
                                )}
                              >
                                {getStatusIcon(post.status)}
                                {post.status}
                              </Badge>
                            </div>
                            {post.publish_date && (
                              <p className="text-[10px] text-slate-500 mt-1">
                                {format(new Date(post.publish_date), "HH:mm")}
                              </p>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>

                  {/* Contador de posts */}
                  {dayPosts.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p className="text-xs text-slate-500 font-medium">
                        {dayPosts.length}{" "}
                        {dayPosts.length === 1 ? "post" : "posts"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </Card>
  );
}
