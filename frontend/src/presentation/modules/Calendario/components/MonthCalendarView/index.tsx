"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

// ===== Tipagem =====
type Post = {
  id: string;
  title: string;
  status: string;
  publish_date?: string | Date;
};

type MonthCalendarViewProps = {
  posts: Post[];
  currentMonth: Date;
  onPostClick: (post: Post) => void;
  loading?: boolean;
};

// ===== Cor do status =====
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    tema_pendente: "#f59e0b", // amber-500
    tema_aprovado: "#22c55e", // green-500
    tema_rejeitado: "#ef4444", // red-500
    conteudo_pendente: "#3b82f6", // blue-500
    conteudo_aprovado: "#22c55e",
    conteudo_rejeitado: "#ef4444",
    pendente: "#f59e0b",
    em_revisao: "#3b82f6",
    aprovado: "#22c55e",
    rejeitado: "#ef4444",
  };
  return colors[status] || "#6b7280"; // gray-500
};

const weekDayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ===== Componente =====
export function MonthCalendarView({
  posts,
  currentMonth,
  onPostClick,
  loading = false,
}: MonthCalendarViewProps) {
  // === Datas base do mês ===
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { locale: ptBR });
  const endDate = endOfWeek(monthEnd, { locale: ptBR });

  const days: Date[] = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  // === Posts por dia ===
  const getPostsForDay = (day: Date) =>
    posts.filter(
      (post) =>
        post.publish_date && isSameDay(new Date(post.publish_date), day)
    );

  // === Estado de carregamento ===
  if (loading) {
    return (
      <div className="h-full p-4">
        <div className="h-full bg-slate-50 rounded-lg animate-pulse" />
      </div>
    );
  }

  // === Render principal ===
  return (
    <div className="h-full flex flex-col">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {weekDayNames.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grade de dias do mês */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr border-l border-t border-slate-200">
        {days.map((day) => {
          const dayPosts = getPostsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isTodayDate = isToday(day);

          return (
            <Droppable key={day.toISOString()} droppableId={day.toISOString()}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "border-r border-b border-slate-200 p-2 min-h-[100px] transition-colors overflow-hidden",
                    snapshot.isDraggingOver
                      ? "bg-blue-50"
                      : "bg-white hover:bg-slate-50",
                    !isCurrentMonth && "bg-slate-50/50"
                  )}
                >
                  {/* Número do dia */}
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className={cn(
                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                        isTodayDate && "bg-blue-600 text-white",
                        !isCurrentMonth && !isTodayDate
                          ? "text-slate-400"
                          : "text-slate-700"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                    {dayPosts.length > 3 && (
                      <span className="text-xs text-slate-500 font-medium">
                        +{dayPosts.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Postagens do dia */}
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((post, index) => {
                      const color = getStatusColor(post.status);
                      return (
                        <Draggable
                          key={post.id}
                          draggableId={post.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onPostClick(post)}
                              className={cn(
                                "group cursor-pointer px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-all",
                                snapshot.isDragging &&
                                  "shadow-lg ring-2 ring-blue-800 hover:text-white"
                              )}
                              style={{
                                backgroundColor: `${color}20`,
                                borderLeft: `3px solid ${color}`,
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              
                              <span className="truncate text-slate-600 text-[11px]">
                                {post.title}
                              </span>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </div>
  );
}
