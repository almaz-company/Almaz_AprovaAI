/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  startOfMonth,
  startOfWeek,
  addDays,
  isSameDay,
  format,
  isSameMonth,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

type Post = {
  id: string;
  title: string;
  status: string;
  publish_date?: string | Date;
};

type CalendarViewProps = {
  posts: Post[];
  currentDate: Date;
  onPostClick: (post: Post) => void;
  loading?: boolean;
};

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
  const icons: Record<string, any> = {
    pendente: Clock,
    aprovado: CheckCircle,
    rejeitado: XCircle,
    em_revisao: AlertCircle,
  };
  const Icon = icons[status] || Clock;
  return <Icon className="w-3 h-3" />;
};

export function CalendarView({
  posts,
  currentDate,
  onPostClick,
  loading = false,
}: CalendarViewProps) {
  const firstDayOfMonth = startOfMonth(currentDate);
  const startDate = startOfWeek(firstDayOfMonth, { locale: ptBR });
  const days = Array.from({ length: 35 }).map((_, i) => addDays(startDate, i));

  const getPostsForDay = (day: Date) =>
    posts.filter(
      (post) => post.publish_date && isSameDay(new Date(post.publish_date), day)
    );

  const weekDayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  // === Estado de carregamento ===
  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200 p-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDayNames.map((day) => (
            <div
              key={day}
              className="p-2 text-center font-semibold text-xs text-slate-700"
            >
              {day}
            </div>
          ))}

          {Array(35)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="p-2 min-h-[100px] border border-slate-200 rounded-lg bg-slate-50"
              >
                <Skeleton className="h-4 w-6 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
              </div>
            ))}
        </div>
      </Card>
    );
  }

  // === Renderização principal ===
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-sm border border-slate-200 overflow-hidden">
      {/* Header - Dias da semana */}
      <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
        {weekDayNames.map((day) => (
          <div
            key={day}
            className="p-3 text-center font-semibold text-xs text-slate-700 border-r border-slate-200 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid do calendário */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayPosts = getPostsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <Droppable key={day.toString()} droppableId={day.toISOString()}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "min-h-[120px] p-2 border-r border-b border-slate-200 transition-colors",
                    snapshot.isDraggingOver
                      ? "bg-blue-50"
                      : "bg-white hover:bg-slate-50",
                    !isCurrentMonth && "bg-slate-50/50"
                  )}
                >
                  {/* Número do dia */}
                  <div
                    className={cn(
                      "text-right text-xs font-semibold mb-2 px-1",
                      !isCurrentMonth ? "text-slate-400" : "text-slate-700",
                      isToday && "text-blue-600"
                    )}
                  >
                    {isToday ? (
                      <span className="inline-block w-6 h-6 bg-blue-600 text-white rounded-full text-center leading-6">
                        {format(day, "d")}
                      </span>
                    ) : (
                      format(day, "d")
                    )}
                  </div>

                  {/* Postagens do dia */}
                  <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {dayPosts.map((post, index) => (
                      <Draggable
                        key={post.id}
                        draggableId={post.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          //@ts-ignore
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onPostClick(post)}
                            className={cn(
                              "p-1.5 bg-white rounded border cursor-pointer transition-all duration-200 hover:shadow-md",
                              snapshot.isDragging
                                ? "shadow-lg ring-2 ring-blue-400 rotate-2"
                                : "shadow-sm"
                            )}
                          >
                            <p className="text-[10px] font-medium text-slate-900 truncate leading-tight mb-0.5">
                              {post.title}
                            </p>

                            <Badge
                              className={cn(
                                getStatusColor(post.status),
                                "text-[9px] px-1 py-0 h-4 border flex items-center gap-0.5 capitalize"
                              )}
                            >
                              {getStatusIcon(post.status)}
                              {post.status}
                            </Badge>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </Card>
  );
}
