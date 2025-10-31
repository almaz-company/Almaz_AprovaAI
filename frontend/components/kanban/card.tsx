"use client"

import type { KanbanTask } from "@/types/kanban"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface KanbanCardProps {
  task: KanbanTask
  isDragging: boolean
  onDragStart: () => void
  onClick: () => void
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case "alta":
      return "bg-red-500/10 text-red-700 border-red-500/30"
    case "média":
      return "bg-yellow-500/10 text-yellow-700 border-yellow-500/30"
    case "baixa":
      return "bg-green-500/10 text-green-700 border-green-500/30"
    default:
      return "bg-slate-500/10 text-slate-700 border-slate-500/30"
  }
}

export default function KanbanCard({ task, isDragging, onDragStart, onClick }: KanbanCardProps) {
  const isOverdue = task.dueDate < new Date() && task.status !== "concluido"

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 bg-slate-50" : "bg-white hover:bg-slate-50"
      } hover:border-slate-300 border-slate-200`}
    >
      <div className="space-y-2">
        <h3 className="font-medium text-sm text-slate-900 line-clamp-2">{task.title}</h3>

        <div className="flex gap-2">
          <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-700 border-purple-500/30">
            {task.storyPoints} pts
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 text-slate-700 border-none">
              {tag}
            </Badge>
          ))}
          {task.tags.length > 2 && (
            <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 border-none">
              +{task.tags.length - 2}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            {task.comments > 0 && <span>💬 {task.comments}</span>}
            {task.attachments > 0 && <span>📎 {task.attachments}</span>}
          </div>
          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
            {format(task.dueDate, "dd MMM", { locale: ptBR })}
          </span>
        </div>

        <div className="text-xs text-slate-500 truncate">👤 {task.assignee}</div>
      </div>
    </div>
  )
}

