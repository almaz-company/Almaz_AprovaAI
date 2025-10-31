export type Status = "pendente" | "em_progresso" | "concluido"
export type Priority = "alta" | "média" | "baixa"

export interface KanbanTask {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  assignee: string
  dueDate: Date
  storyPoints: number
  tags: string[]
  comments: number
  attachments: number
}

