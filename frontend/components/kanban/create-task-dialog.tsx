"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { KanbanTask } from "@/types/kanban"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated: (task: Omit<KanbanTask, "id">) => void
  assignees: string[]
}

export default function CreateTaskDialog({ open, onOpenChange, onTaskCreated, assignees }: CreateTaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("média")
  const [storyPoints, setStoryPoints] = useState("5")
  const [assignee, setAssignee] = useState("")
  const [tags, setTags] = useState("")

  function handleCreate() {
    if (!title.trim() || !assignee) return

    onTaskCreated({
      title,
      description,
      status: "pendente",
      priority: priority as any,
      storyPoints: Number.parseInt(storyPoints),
      assignee,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      comments: 0,
      attachments: 0,
    })

    setTitle("")
    setDescription("")
    setPriority("média")
    setStoryPoints("5")
    setAssignee("")
    setTags("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Tarefa</DialogTitle>
          <DialogDescription>Crie uma nova tarefa para seu projeto</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm mb-1 block">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da tarefa..."
            />
          </div>
          <div>
            <label className="text-sm mb-1 block">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrever a tarefa..."
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm mb-1 block">Prioridade</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="média">Média</SelectItem>
                  <SelectItem value="baixa">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm mb-1 block">Story Points</label>
              <Select value={storyPoints} onValueChange={setStoryPoints}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="13">13</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm mb-1 block">Responsável</label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm mb-1 block">Tags (separadas por vírgula)</label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="backend, frontend, ui..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim() || !assignee}>
              Criar Tarefa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

