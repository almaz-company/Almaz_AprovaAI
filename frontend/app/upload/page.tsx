"use client";

import React, { useState,FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { PostPreview } from "@/src/presentation/modules/upload/components/PostPreview"
import { FileUploadZone } from "@/src/presentation/modules/upload/components/FileUploadZone"
import { useAuth } from "@/lib/auth-context"
import { uploadToStorage, saveFileMetadata, type UploadedInfo } from "@/lib/storage"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"

export default function UploadPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    tema: "",
    especificacao: "",
    tipo_conteudo: "",
    social_network: "",
    publish_date: "",
    priority: "media",
    client_id: "",
  });

  const [clients, setClients] = useState<{ id: string; company_name: string }[]>([
    { id: "1", company_name: "Cliente Exemplo" },
  ]);

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ url?: string; name?: string } | null>(null)
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.tema ||
      !formData.especificacao ||
      !formData.tipo_conteudo ||
      !formData.social_network ||
      !formData.publish_date
    ) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }
    try {
      if (!user) {
        toast.error("Faça login para enviar o tema")
        return
      }
      setSubmitting(true)
      const payload = {
        user_id: user.id,
        title: formData.title,
        tema: formData.tema,
        especificacao: formData.especificacao,
        tipo_conteudo: formData.tipo_conteudo,
        social_network: formData.social_network,
        publish_date: new Date(formData.publish_date),
        priority: formData.priority,
        client_id: formData.client_id || null,
        status: 'pendente',
      }
      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert(payload)
        .select('id')
        .single()
      if (postError) throw postError

      if (uploadedFileId) {
        const { error: linkError } = await supabase
          .from('files')
          .update({ post_id: post.id })
          .eq('id', uploadedFileId)
        if (linkError) throw linkError
      }

      toast.success('Tema enviado!')
      setSuccess(true)
    } catch (err: any) {
      toast.error('Erro ao salvar tema', { description: err?.message || String(err) })
    } finally {
      setSubmitting(false)
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      if (!user) {
        toast.error("Faça login para enviar arquivos")
        return
      }
      setUploading(true)
      const info: UploadedInfo = await uploadToStorage(file, user.id)
      const saved = await saveFileMetadata(info, user.id)
      setUploadedFile({ url: info.signedUrl || undefined, name: file.name })
      setUploadedFileId(saved.id)
      toast.success("Arquivo enviado com sucesso")
    } catch (err: any) {
      toast.error("Erro ao enviar arquivo", { description: err?.message || String(err) })
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setUploadedFileId(null)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Tema enviado com sucesso!
            </h3>
            <p className="text-slate-600 mb-4">
              O tema foi enviado e está aguardando aprovação.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="hover:bg-white/80 rounded-full w-10 h-10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Etapa 1: Aprovação de Tema
                </h1>
                <p className="text-slate-600 text-sm">
                  Defina o tema e as informações básicas para aprovação
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline">Cancelar</Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-[#053665] hover:bg-[#052244] text-white min-w-40 shadow-md"
              >
                {submitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Enviando...
                  </div>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Enviar Tema para Aprovação
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Etapas */}
          <div className="flex items-center justify-center mb-8 gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-blue-800">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                1
              </div>
              <span className="font-medium">Tema</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-400">
              <div className="w-6 h-6 rounded-full bg-slate-300 text-white flex items-center justify-center text-sm font-bold">
                2
              </div>
              <span className="font-medium">Conteúdo Final</span>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Coluna esquerda */}
            <div className="lg:col-span-3 space-y-6">
              {/* Upload de Mídia */}
              <Card className="bg-white/90 shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">Upload de Mídia</CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUploadZone
                    onFileUpload={handleFileUpload}
                    onRemoveFile={handleRemoveFile}
                    uploadedFile={uploadedFile || undefined}
                    uploading={uploading}
                  />
                </CardContent>
              </Card>
              {/* Informações do Tema */}
              <Card className="bg-white/90 shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5 text-[#053665]" />
                    Informações do Tema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Título da Postagem *
                    </label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Ex: Lançamento da Nova Coleção de Inverno"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tema *
                    </label>
                    <Input
                      value={formData.tema}
                      onChange={(e) =>
                        handleInputChange("tema", e.target.value)
                      }
                      placeholder="Assunto central do conteúdo"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Especificação do Conteúdo *
                    </label>
                    <Textarea
                      value={formData.especificacao}
                      onChange={(e) =>
                        handleInputChange("especificacao", e.target.value)
                      }
                      placeholder="Breve descrição sobre a abordagem ou objetivo do post..."
                      rows={4}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Detalhes de Publicação */}
              <Card className="bg-white/90 shadow-md border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="w-5 h-5 text-[#053665]" />
                    Detalhes de Publicação
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Canal *
                    </label>
                    <Select
                      value={formData.social_network}
                      onValueChange={(v) =>
                        handleInputChange("social_network", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Tipo de Conteúdo *
                    </label>
                    <Select
                      value={formData.tipo_conteudo}
                      onValueChange={(v) =>
                        handleInputChange("tipo_conteudo", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Texto">Texto</SelectItem>
                        <SelectItem value="Imagem">Imagem</SelectItem>
                        <SelectItem value="Stories">Stories</SelectItem>
                        <SelectItem value="Reels">Reels</SelectItem>
                        <SelectItem value="Vídeo">Vídeo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Data e Hora da Publicação *
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.publish_date}
                      onChange={(e) =>
                        handleInputChange("publish_date", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Prioridade
                    </label>
                    <Select
                      value={formData.priority}
                      onValueChange={(v) => handleInputChange("priority", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Cliente
                    </label>
                    <Select
                      value={formData.client_id || "none"}
                      onValueChange={(v) =>
                        handleInputChange("client_id", v === "none" ? "" : v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {clients.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Coluna direita - Pré-visualização */}
            <div className="lg:col-span-2">
              <div className="sticky top-6">
                <PostPreview formData={formData} uploadedFile={uploadedFile || null} />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
