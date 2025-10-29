"use client";

import { format, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";

type Post = {
  id: string;
  title: string;
  content?: string;
  especificacao?: string;
  status: string;
  publish_date?: string | Date;
};

type DayCalendarViewProps = {
  posts: Post[];
  currentDate: Date;
  onPostClick: (post: Post) => void;
  loading?: boolean;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    tema_pendente: "#f59e0b", // amber-500
    tema_aprovado: "#22c55e", // green-500
    tema_rejeitado: "#ef4444", // red-500
    conteudo_pendente: "#3b82f6", // blue-500
    conteudo_aprovado: "#22c55e",
    conteudo_rejeitado: "#ef4444",
  };
  return colors[status] || "#6b7280"; // gray-500 fallback
};

export function DayCalendarView({
  posts,
  currentDate,
  onPostClick,
  loading = false,
}: DayCalendarViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getPostsForHour = (hour: number) =>
    posts.filter((post) => {
      if (!post.publish_date) return false;
      const postDate = new Date(post.publish_date);
      return isSameDay(postDate, currentDate) && postDate.getHours() === hour;
    });

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
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {hours.map((hour) => {
            const hourPosts = getPostsForHour(hour);

            return (
              <div key={hour} className="flex border-b border-slate-200">
                {/* Coluna de hora */}
                <div className="w-24 p-4 text-sm text-slate-500 text-right border-r border-slate-200 bg-slate-50">
                  {hour}:00
                </div>

                {/* Área droppable (arrastar e soltar) */}
                <Droppable droppableId={`${currentDate.toISOString()}-${hour}`}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 p-3 min-h-[80px] transition-colors",
                        snapshot.isDraggingOver
                          ? "bg-blue-50"
                          : "bg-white hover:bg-slate-50"
                      )}
                    >
                      <div className="space-y-2">
                        {hourPosts.map((post, index) => {
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
                                    "cursor-pointer px-4 py-3 rounded-lg transition-all text-slate-900",
                                    snapshot.isDragging
                                      ? "shadow-lg ring-2 ring-blue-400"
                                      : "shadow-sm"
                                  )}
                                  style={{
                                    backgroundColor: `${color}20`,
                                    borderLeft: `4px solid ${color}`,
                                    ...provided.draggableProps.style,
                                  }}
                                >
                                  <div className="font-semibold mb-1 text-sm">
                                    {format(
                                      new Date(post.publish_date!),
                                      "HH:mm",
                                      { locale: ptBR }
                                    )}{" "}
                                    - {post.title}
                                  </div>
                                  <div className="text-sm text-slate-600 line-clamp-2">
                                    {post.content || post.especificacao}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
