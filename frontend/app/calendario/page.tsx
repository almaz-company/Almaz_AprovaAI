/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import {
  format,
  addMonths,
  addWeeks,
  addDays,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { MonthCalendarView } from "@/src/presentation/modules/Calendario/components/MonthCalendarView";
import { WeekCalendarView } from "@/src/presentation/modules/Calendario/components/WeekCalendarView";
import { DayCalendarView } from "@/src/presentation/modules/Calendario/components/DayCalendarView";
import { YearCalendarView } from "@/src/presentation/modules/Calendario/components/YearCalendarView";
import { PostModal } from "@/src/presentation/modules/Calendario/components/PostModal";
import { ScheduleView } from "@/src/presentation/modules/Calendario/components/ScheduleView";



// ========= Tipagem dos Posts =========
type PostType = {
  id: string;
  title: string;
  status: string;
  social_network?: string;
  publish_date?: string | Date;
};

// ========= Página Principal =========
export default function CalendarPage() {
  const router = useRouter();

  const [posts, setPosts] = useState<PostType[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterNetwork, setFilterNetwork] = useState("all");
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<
    "day" | "week" | "month" | "year" | "schedule" | "4days"
  >("month");

  // ==== Mock de carregamento de posts ====
  useEffect(() => {
    // Aqui você pode substituir pelo fetch real da sua API (Post.list)
    const timer = setTimeout(() => {
      setPosts([
        {
          id: "1",
          title: "Post Instagram",
          status: "tema_pendente",
          social_network: "instagram",
          publish_date: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Post LinkedIn",
          status: "conteudo_aprovado",
          social_network: "linkedin",
          publish_date: new Date(Date.now() + 86400000).toISOString(),
        },
      ]);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // ==== Filtros ====
  const filteredPosts = posts.filter((post) => {
    const statusMatch = filterStatus === "all" || post.status === filterStatus;
    const networkMatch =
      filterNetwork === "all" || post.social_network === filterNetwork;
    return statusMatch && networkMatch;
  });

  // ==== Drag & Drop ====
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;
    console.log("Moved post", draggableId, "to", destination.droppableId);
  };

  // ==== Navegação temporal ====
  const navigateDate = (direction: "next" | "prev") => {
    const dir = direction === "next" ? 1 : -1;
    switch (viewMode) {
      case "month":
        setCurrentDate(addMonths(currentDate, dir));
        break;
      case "week":
      case "4days":
        setCurrentDate(addWeeks(currentDate, dir));
        break;
      case "day":
        setCurrentDate(addDays(currentDate, dir));
        break;
      case "year":
        setCurrentDate(addMonths(currentDate, dir * 12));
        break;
      default:
        break;
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const getDateRangeText = () => {
    switch (viewMode) {
      case "month":
        return format(currentDate, "MMMM yyyy", { locale: ptBR });
      case "week":
      case "4days": {
        const start = startOfWeek(currentDate, { locale: ptBR });
        const end = endOfWeek(currentDate, { locale: ptBR });
        return `${format(start, "d MMM", { locale: ptBR })} - ${format(
          end,
          "d MMM yyyy",
          { locale: ptBR }
        )}`;
      }
      case "day":
        return format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
      case "year":
        return format(currentDate, "yyyy");
      case "schedule":
        return "Agenda";
      default:
        return "";
    }
  };

  // ==== Render ====
  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="h-screen flex flex-col bg-white">
        {/* ======= Header ======= */}
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-slate-900">
                {getDateRangeText()}
              </h1>

              {viewMode !== "schedule" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateDate("prev")}
                    className="h-9 w-9"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={goToToday} className="h-9 px-4">
                    Hoje
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigateDate("next")}
                    className="h-9 w-9"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* ===== View Mode Selector ===== */}
              <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Visualização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Dia</SelectItem>
                  <SelectItem value="week">Semana</SelectItem>
                  <SelectItem value="month">Mês</SelectItem>
                  <SelectItem value="year">Ano</SelectItem>
                  <SelectItem value="schedule">Agenda</SelectItem>
                  <SelectItem value="4days">4 dias</SelectItem>
                </SelectContent>
              </Select>

              {/* ===== Filtros ===== */}
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="tema_pendente">Tema Pendente</SelectItem>
                  <SelectItem value="tema_aprovado">Tema Aprovado</SelectItem>
                  <SelectItem value="conteudo_pendente">
                    Conteúdo Pendente
                  </SelectItem>
                  <SelectItem value="conteudo_aprovado">Aprovado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterNetwork} onValueChange={setFilterNetwork}>
                <SelectTrigger className="w-40 h-9">
                  <SelectValue placeholder="Rede Social" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Redes</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>

              <Button
                className="h-9 bg-blue-600 hover:bg-blue-700"
                onClick={() => router.push("/upload")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar
              </Button>
            </div>
          </div>
        </div>

        {/* ======= Calendar Views ======= */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "month" && (
            <MonthCalendarView
              posts={filteredPosts}
              currentMonth={currentDate}
              onPostClick={setSelectedPost}
              loading={loading}
            />
          )}

          {viewMode === "week" && (
            <WeekCalendarView
              posts={filteredPosts}
              currentDate={currentDate}
              onPostClick={setSelectedPost}
              loading={loading}
              daysToShow={7}
            />
          )}

          {viewMode === "4days" && (
            <WeekCalendarView
              posts={filteredPosts}
              currentDate={currentDate}
              onPostClick={setSelectedPost}
              loading={loading}
              daysToShow={4}
            />
          )}

          {viewMode === "day" && (
            <DayCalendarView
              posts={filteredPosts}
              currentDate={currentDate}
              onPostClick={setSelectedPost}
              loading={loading}
            />
          )}

          {viewMode === "year" && (
            <YearCalendarView
              posts={filteredPosts}
              currentYear={currentDate}
              onPostClick={setSelectedPost}
              loading={loading}
            />
          )}

          {viewMode === "schedule" && (
            <ScheduleView
            //@ts-ignore
              posts={filteredPosts}
              onPostClick={setSelectedPost}
              loading={loading}
            />
          )}
        </div>

        {/* ======= Post Modal ======= */}
        {selectedPost && (
          <PostModal
          //@ts-ignore
            post={selectedPost}
            isOpen={!!selectedPost}
            onClose={() => setSelectedPost(null)}
            onUpdate={() => console.log("Atualizar posts")}
          />
        )}
      </div>
    </DragDropContext>
  );
}
