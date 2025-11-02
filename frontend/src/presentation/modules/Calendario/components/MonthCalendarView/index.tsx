/* eslint-disable @typescript-eslint/ban-ts-comment */
"use client";

import React from "react";
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
import { motion } from "framer-motion";

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
    tema_pendente: "#f59e0b",
    tema_aprovado: "#22c55e",
    tema_rejeitado: "#ef4444",
    conteudo_pendente: "#3b82f6",
    conteudo_aprovado: "#22c55e",
    conteudo_rejeitado: "#ef4444",
    pendente: "#f59e0b",
    em_revisao: "#3b82f6",
    aprovado: "#22c55e",
    rejeitado: "#ef4444",
  };
  return colors[status] || "#6b7280";
};

const weekDayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ===== Componente =====
export function MonthCalendarView({
  posts,
  currentMonth,
  onPostClick,
  loading = false,
}: MonthCalendarViewProps) {
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

  const getPostsForDay = (day: Date) =>
    posts.filter(
      (post) => post.publish_date && isSameDay(new Date(post.publish_date), day)
    );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl animate-pulse">
        {" "}
        <span className="text-slate-400 font-medium text-sm">
          Carregando calendário...{" "}
        </span>{" "}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white/90 backdrop-blur-sm">
      {/* Cabeçalho dos dias */}{" "}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        {weekDayNames.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-[11px] font-semibold tracking-wide text-slate-600 uppercase select-none"
          >
            {day}{" "}
          </div>
        ))}{" "}
      </div>
      {/* Grade de dias */}
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
                    "border-r border-b p-2 min-h-[110px] transition-all duration-200 relative",
                    snapshot.isDraggingOver
                      ? "bg-blue-50/70 shadow-inner"
                      : "bg-white hover:bg-slate-50/80",
                    !isCurrentMonth && "bg-slate-50/60"
                  )}
                >
                  {/* Dia */}
                  <div className="flex items-center justify-between mb-1">
                    <div
                      className={cn(
                        "w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-semibold transition-all",
                        isTodayDate
                          ? "bg-[#053665] text-white shadow-sm"
                          : isCurrentMonth
                          ? "text-slate-700"
                          : "text-slate-400"
                      )}
                    >
                      {format(day, "d")}
                    </div>
                    {dayPosts.length > 3 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        +{dayPosts.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Postagens */}
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
                            //@ts-ignore
                            <motion.div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onPostClick(post)}
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.15 }}
                              className={cn(
                                "cursor-pointer px-2 py-1 rounded-md text-[11px] flex items-center gap-1.5 select-none group transition-all duration-150",
                                snapshot.isDragging &&
                                  "shadow-md ring-2 ring-blue-400 scale-[1.02]"
                              )}
                              style={{
                                backgroundColor: `${color}12`,
                                borderLeft: `3px solid ${color}`,
                                ...provided.draggableProps.style,
                              }}
                            >
                              <div
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                              />
                              <span className="truncate text-slate-700 group-hover:text-slate-900">
                                {post.title}
                              </span>
                            </motion.div>
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
