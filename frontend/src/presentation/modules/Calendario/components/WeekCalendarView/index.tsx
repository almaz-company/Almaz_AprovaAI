"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  startOfWeek,
  addDays,
  format,
  isSameDay,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

// ---------- Tipagem ----------
type Post = {
  id: string;
  title: string;
  status: string;
  publish_date?: string | Date;
};

type WeekCalendarViewProps = {
  posts: Post[];
  currentDate: Date;
  onPostClick: (post: Post) => void;
  loading?: boolean;
  daysToShow?: number;
};

// ---------- Helper ----------
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

// ---------- Componente ----------
export function WeekCalendarView({
  posts,
  currentDate,
  onPostClick,
  loading = false,
  daysToShow = 7,
}: WeekCalendarViewProps) {
  const weekStart = startOfWeek(currentDate, { locale: ptBR });

  const days = Array.from({ length: daysToShow }, (_, i) =>
    addDays(weekStart, i)
  );
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getPostsForDayAndHour = (day: Date, hour: number) =>
    posts.filter((post) => {
      if (!post.publish_date) return false;
      const postDate = new Date(post.publish_date);
      return isSameDay(postDate, day) && postDate.getHours() === hour;
    });

  // === Loading ===
  if (loading) {
    return (
      <div className="h-full p-4">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    );
  }

  // === Render principal ===
  return (
    <div className="h-full flex flex-col overflow-hidden bg-white">
      {/* Cabeçalho dos dias */}
      <div
        className="grid border-b border-slate-200 bg-white"
        style={{ gridTemplateColumns: `60px repeat(${daysToShow}, 1fr)` }}
      >
        <div className="border-r border-slate-200" />
        {days.map((day) => {
          const isTodayDate = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="p-3 text-center border-r border-slate-200"
            >
              <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                {format(day, "EEE", { locale: ptBR })}
              </div>
              <div
                className={cn(
                  "text-2xl font-semibold text-slate-900 mx-auto flex items-center justify-center w-10 h-10 rounded-full",
                  isTodayDate && "bg-blue-600 text-white"
                )}
              >
                {format(day, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grade de horas × dias */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="grid"
          style={{ gridTemplateColumns: `60px repeat(${daysToShow}, 1fr)` }}
        >
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              {/* Coluna de horas */}
              <div className="border-r border-b border-slate-200 p-2 text-xs text-slate-500 text-right pr-3 bg-slate-50">
                {hour}:00
              </div>

              {/* Colunas dos dias */}
              {days.map((day) => {
                const dayPosts = getPostsForDayAndHour(day, hour);
                return (
                  <Droppable
                    key={`${day.toISOString()}-${hour}`}
                    droppableId={`${day.toISOString()}-${hour}`}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cn(
                          "border-r border-b border-slate-200 p-1 min-h-[60px] transition-colors",
                          snapshot.isDraggingOver
                            ? "bg-blue-50"
                            : "bg-white hover:bg-slate-50"
                        )}
                      >
                        <div className="space-y-1">
                          {dayPosts.map((post, index) => {
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
                                      "cursor-pointer px-2 py-1 rounded text-xs transition-all",
                                      snapshot.isDragging &&
                                        "shadow-lg ring-2 ring-blue-400 hover:text-white"
                                    )}
                                    style={{
                                      backgroundColor: `${color}20`,
                                      borderLeft: `3px solid ${color}`,
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    <div className="font-medium text-slate-700 truncate">
                                     
                                      - {post.title}
                                    </div>
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
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
