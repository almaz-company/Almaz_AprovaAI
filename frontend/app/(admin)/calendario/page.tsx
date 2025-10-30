/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { addMonths, addWeeks, addDays } from "date-fns";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import { MonthCalendarView } from "@/src/presentation/modules/Calendario/components/MonthCalendarView";
import { WeekCalendarView } from "@/src/presentation/modules/Calendario/components/WeekCalendarView";
import { DayCalendarView } from "@/src/presentation/modules/Calendario/components/DayCalendarView";
import { YearCalendarView } from "@/src/presentation/modules/Calendario/components/YearCalendarView";
import { PostModal } from "@/src/presentation/modules/Calendario/components/PostModal";
import { ScheduleView } from "@/src/presentation/modules/Calendario/components/ScheduleView";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { listClients } from "@/lib/clients";

type PostType = {
  id: string;
  title: string;
  status: string;
  social_network?: string;
  publish_date?: string | Date | null;
  client_id?: string | null;
  priority?: string;
  tema?: string | null;
  especificacao?: string | null;
  tipo_conteudo?: string | null;
  content?: string | null;
};

export default function CalendarPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [posts, setPosts] = useState<PostType[]>([]);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterNetwork, setFilterNetwork] = useState("all");
  const [filterClient, setFilterClient] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [clients, setClients] = useState<{ id: string; company_name: string }[]>([]);
  const [selectedPost, setSelectedPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<
    "day" | "week" | "month" | "year" | "schedule" | "4days"
  >("month");

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setPosts([]);
        return;
      }
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id)
        .order("publish_date", { ascending: true });
      if (error) throw error;
      const mapped = (data || []).map((p: any) => ({
        id: String(p.id),
        title: p.title || "Sem título",
        status: p.status || "pendente",
        social_network: p.social_network || "instagram",
        publish_date: p.publish_date || null,
        client_id: p.client_id || null,
        priority: p.priority || "media",
        tema: p.tema || null,
        especificacao: p.especificacao || null,
        tipo_conteudo: p.tipo_conteudo || null,
        content: p.content || null,
      }));
      setPosts(mapped);
    } catch (e: any) {
      const msg = e?.message || (typeof e === "string" ? e : JSON.stringify(e || {}))
      console.error("Erro ao carregar posts:", msg);
      toast.error("Erro ao carregar posts", { description: msg });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    async function load() {
      try {
        if (!user?.id) return;
        const data = await listClients(user.id);
        setClients((data || []).map((c: any) => ({ id: c.id, company_name: c.company_name })));
      } catch (e) {
        console.error("Erro ao carregar clientes:", e);
      }
    }
    load();
  }, [user?.id]);

  const filteredPosts = posts.filter((post) => {
    const statusMatch = filterStatus === "all" || post.status === filterStatus;
    const networkMatch = filterNetwork === "all" || post.social_network === filterNetwork;
    const clientMatch =
      filterClient === "all" || (filterClient === "none" ? !post.client_id : post.client_id === filterClient);
    const priorityMatch = filterPriority === "all" || post.priority === filterPriority;
    return statusMatch && networkMatch && clientMatch && priorityMatch;
  });

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    console.log("Moved post", draggableId, "to", destination.droppableId);
  };

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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="p-4 h-[calc(100vh-4rem)] flex flex-col gap-4">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateDate("prev")}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateDate("next")}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode */}
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

            {/* Filtro Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_revisao">Em revisão</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="rejeitado">Rejeitado</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro Rede */}
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

            {/* Filtro Cliente */}
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger className="w-56 h-9">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                <SelectItem value="none">Sem cliente</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Filtro Prioridade */}
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas prioridades</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
              </SelectContent>
            </Select>

            <Button className="h-9 bg-blue-600 hover:bg-blue-700" onClick={() => router.push("/upload")}>
              <Plus className="w-4 h-4 mr-2" />
              Criar
            </Button>
          </div>
        </div>

        {/* Views */}
        <div className="flex-1 overflow-hidden">
          {viewMode === "month" && (
            <MonthCalendarView
             //@ts-ignore
              posts={filteredPosts}
              currentMonth={currentDate}
              onPostClick={setSelectedPost}
              loading={loading}
            />
          )}

          {viewMode === "week" && (
            <WeekCalendarView
            //@ts-ignore
              posts={filteredPosts}
              currentDate={currentDate}
              onPostClick={setSelectedPost}
              loading={loading}
              daysToShow={7}
            />
          )}

          {viewMode === "4days" && (
            <WeekCalendarView
             //@ts-ignore
              posts={filteredPosts}
              currentDate={currentDate}
              onPostClick={setSelectedPost}
              loading={loading}
              daysToShow={4}
            />
          )}

          {viewMode === "day" && (
            <DayCalendarView
             //@ts-ignore
              posts={filteredPosts}
              currentDate={currentDate}
              onPostClick={setSelectedPost}
              loading={loading}
            />
          )}

          {viewMode === "year" && (
            <YearCalendarView
             //@ts-ignore
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

        {/* Modal */}
        {selectedPost && (
          <PostModal
            //@ts-ignore
            post={selectedPost}
            isOpen={!!selectedPost}
            onClose={() => setSelectedPost(null)}
            onUpdate={loadPosts}
          />
        )}
      </div>
    </DragDropContext>
  );
}
