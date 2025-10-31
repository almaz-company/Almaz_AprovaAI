"use client"

import { Card, CardContent } from "@/components/ui/card"

interface KanbanStatsProps {
  stats: {
    total: number
    completed: number
    inProgress: number
    pending: number
    highPriority: number
  }
}

export default function KanbanStats({ stats }: KanbanStatsProps) {
  // Mantido para compatibilidade futura
  // const completionRate = Math.round((stats.completed / stats.total) * 100) || 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <StatCard title="Total" value={stats.total} icon="📊" color="from-slate-600 to-slate-700" />
      <StatCard title="Concluído" value={stats.completed} icon="✅" color="from-green-600 to-green-700" />
      <StatCard title="Em Progresso" value={stats.inProgress} icon="⚙️" color="from-blue-600 to-blue-700" />
      <StatCard title="Pendente" value={stats.pending} icon="⏳" color="from-yellow-600 to-yellow-700" />
      <StatCard title="Alta Prioridade" value={stats.highPriority} icon="🔴" color="from-red-600 to-red-700" />
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number
  icon: string
  color: string
}) {
  return (
    <Card className="bg-gradient-to-br border-0 border-slate-200/60">
      <CardContent className="p-4">
        <div className={`bg-gradient-to-br ${color} text-white rounded-lg p-3 mb-3`}>
          <span className="text-xl">{icon}</span>
        </div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{title}</p>
      </CardContent>
    </Card>
  )
}

