"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  startOfYear,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

// ====================== Tipagem ======================
type Post = {
  id: string;
  title: string;
  status: string;
  publish_date?: string | Date;
};

type MiniMonthProps = {
  monthDate: Date;
  posts: Post[];
  onPostClick: (post: Post) => void;
};

type YearCalendarViewProps = {
  posts: Post[];
  currentYear: Date;
  onPostClick: (post: Post) => void;
  loading?: boolean;
};

// ====================== Helper ======================
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    tema_pendente: "bg-amber-500",
    tema_aprovado: "bg-green-500",
    tema_rejeitado: "bg-red-500",
    conteudo_pendente: "bg-blue-500",
    conteudo_aprovado: "bg-green-500",
    conteudo_rejeitado: "bg-red-500",
  };
  return colors[status] || "bg-gray-500";
};

// ====================== MiniMonth ======================
const MiniMonth = ({ monthDate, posts, onPostClick }: MiniMonthProps) => {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
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

  const weekDayNames = ["D", "S", "T", "Q", "Q", "S", "S"];

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 hover:shadow-md transition-shadow">
      {/* Nome do mês */}
      <h3 className="text-sm font-semibold text-slate-900 mb-2 text-center capitalize">
        {format(monthDate, "MMMM", { locale: ptBR })}
      </h3>

      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDayNames.map((day, i) => (
          <div
            key={i}
            className="text-[10px] text-slate-500 text-center font-medium"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const dayPosts = getPostsForDay(day);
          const isCurrentMonth = isSameMonth(day, monthDate);
          const hasMultiplePosts = dayPosts.length > 1;

          return (
            <div
              key={i}
              onClick={() =>
                dayPosts.length > 0 && onPostClick(dayPosts[0])
              }
              className={cn(
                "aspect-square flex items-center justify-center text-[11px] rounded relative select-none transition-all",
                !isCurrentMonth
                  ? "text-slate-300"
                  : "text-slate-700 hover:bg-slate-50",
                dayPosts.length > 0 && "cursor-pointer"
              )}
            >
              {/* Número do dia */}
              {format(day, "d")}

              {/* Indicador de post */}
              {dayPosts.length > 0 && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-[2px]">
                  {hasMultiplePosts ? (
                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                  ) : (
                    <div
                      className={cn(
                        "w-1 h-1 rounded-full",
                        getStatusColor(dayPosts[0].status)
                      )}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ====================== YearCalendarView ======================
export function YearCalendarView({
  posts,
  currentYear,
  onPostClick,
  loading = false,
}: YearCalendarViewProps) {
  // === Estado de carregamento ===
  if (loading) {
    return (
      <div className="h-full p-6">
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // === Gerar meses do ano ===
  const yearStart = startOfYear(currentYear);
  const months = Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));

  // === Render principal ===
  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {months.map((month, i) => (
            <MiniMonth
              key={i}
              monthDate={month}
              posts={posts}
              onPostClick={onPostClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
