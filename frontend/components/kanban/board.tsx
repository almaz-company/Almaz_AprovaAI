"use client"

import React, { useMemo } from "react"
import type { KanbanTask, Status } from "@/types/kanban"
import KanbanColumn from "./column"

const COLUMNS: { key: Status; label: string; color: string }[] = [
  { key: "pendente", label: "Pendente", color: "from-slate-500 to-slate-600" },
  { key: "em_progresso", label: "Em Progresso", color: "from-blue-500 to-blue-600" },
  { key: "concluido", label: "Concluído", color: "from-green-500 to-green-600" },
]

interface KanbanBoardProps {
  tasks: KanbanTask[]
  loading: boolean
  onTaskMoved: (taskId: string, newStatus: Status) => void
  onTaskClick: (task: KanbanTask) => void
}

export default function KanbanBoard({ tasks, loading, onTaskMoved, onTaskClick }: KanbanBoardProps) {
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [overColumn, setOverColumn] = React.useState<Status | null>(null)

  const grouped = useMemo(() => {
    const map: Record<Status, KanbanTask[]> = {
      pendente: [],
      em_progresso: [],
      concluido: [],
    }
    tasks.forEach((task) => {
      if (map[task.status]) {
        map[task.status].push(task)
      }
    })
    return map
  }, [tasks])

  function handleDrop(status: Status) {
    if (draggingId) {
      onTaskMoved(draggingId, status)
      setDraggingId(null)
      setOverColumn(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {COLUMNS.map((col) => (
        <KanbanColumn
          key={col.key}
          column={col}
          tasks={grouped[col.key]}
          loading={loading}
          isDraggingOver={overColumn === col.key}
          draggingId={draggingId}
          onDragStart={setDraggingId}
          onDragOver={() => setOverColumn(col.key)}
          onDragLeave={() => setOverColumn(null)}
          onDrop={() => handleDrop(col.key)}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  )
}

