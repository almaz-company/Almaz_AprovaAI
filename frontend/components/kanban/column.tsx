"use client"

import type { KanbanTask, Status } from "@/types/kanban"
import KanbanCard from "./card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface KanbanColumnProps {
  column: { key: Status; label: string; color: string }
  tasks: KanbanTask[]
  loading: boolean
  isDraggingOver: boolean
  draggingId: string | null
  onDragStart: (id: string) => void
  onDragOver: () => void
  onDragLeave: () => void
  onDrop: () => void
  onTaskClick: (task: KanbanTask) => void
}

export default function KanbanColumn({
  column,
  tasks,
  loading,
  isDraggingOver,
  draggingId,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onTaskClick,
}: KanbanColumnProps) {
  return (
    <Card className="bg-white border-slate-200 flex flex-col h-[600px]">
      <CardHeader className="pb-3 border-b border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className={`bg-gradient-to-r ${column.color} text-white px-3 py-1 rounded-full`}>
            <CardTitle className="text-sm font-semibold">{column.label}</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
            {tasks.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-3">
        <div
          className={`space-y-2 transition-all ${isDraggingOver ? "bg-slate-100 rounded-lg p-2" : ""}`}
          onDragOver={(e) => {
            e.preventDefault()
            onDragOver()
          }}
          onDragLeave={onDragLeave}
          onDrop={(e) => {
            e.preventDefault()
            onDrop()
          }}
        >
          {loading ? (
            <div className="text-sm text-slate-500 text-center py-4">Carregando...</div>
          ) : tasks.length === 0 ? (
            <div className="text-sm text-slate-400 text-center py-8">Nenhuma tarefa nesta coluna</div>
          ) : (
            tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                isDragging={draggingId === task.id}
                onDragStart={() => onDragStart(task.id)}
                onClick={() => onTaskClick(task)}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

