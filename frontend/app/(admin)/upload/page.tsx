/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, FormEvent, Suspense } from "react";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Calendar,
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
import { Badge } from "@/components/ui/badge";

import { FileUploadZone } from "@/src/presentation/modules/upload/components/FileUploadZone";
import { useAuth } from "@/lib/auth-context";
import {
  uploadToStorage,
  saveFileMetadata,
  type UploadedInfo,
} from "@/lib/storage";
import { toast } from "sonner";
import { listClients } from "@/lib/clients";
import { supabase } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";

function UploadPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const [clients, setClients] = useState<
    { id: string; company_name: string }[]
  >([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    url?: string;
    name?: string;
  } | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [postId, setPostId] = useState<string | null>(null);
  const [postStatus, setPostStatus] = useState<string>("pendente");

  // Libera upload quando estiver em revisão ou aprovado
  const isUploadUnlocked = ["em_revisao", "aprovado"].includes(postStatus);
  const stepTitle = isUploadUnlocked
    ? "Etapa 2: Conteúdo Final"
    : "Etapa 1: Aprovação de Tema";
  const submitLabel = isUploadUnlocked
    ? "Salvar Conteúdo Final"
    : "Enviar Tema para Aprovação";

  useEffect(() => {
    async function loadClients() {
      if (!user?.id) return;
      try {
        const data = await listClients(user.id);
        setClients(
          (data || []).map((c: any) => ({
            id: c.id,
            company_name: c.company_name,
          }))
        );
      } catch (e: any) {
        toast.error("Erro ao carregar clientes", {
          description: e?.message || String(e),
        });
      }
    }
    loadClients();
  }, [user?.id]);

  useEffect(() => {
    const id = searchParams?.get("postId");
    if (id) setPostId(id);
  }, [searchParams]);

  useEffect(() => {
    async function loadPost() {
      if (!postId) return;
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id", postId)
          .single();
        if (error) throw error;
        if (data) {
          setFormData({
            title: data.title || "",
            tema: data.tema || "",
            especificacao: data.especificacao || "",
            tipo_conteudo: data.tipo_conteudo || "",
            social_network: data.social_network || "",
            publish_date: data.publish_date
              ? new Date(data.publish_date).toISOString().slice(0, 16)
              : "",
            priority: data.priority || "media",
            client_id: data.client_id || "",
          });
          setPostStatus(data.status || "pendente");
        }
      } catch (e: any) {
        toast.error("Erro ao carregar post", {
          description: e?.message || String(e),
        });
      }
    }
    loadPost();
  }, [postId]);

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
        toast.error("Faça login para enviar o tema");
        return;
      }
      setSubmitting(true);
      if (postId) {
        const updatePayload: any = {
          title: formData.title,
          tema: formData.tema,
          especificacao: formData.especificacao,
          tipo_conteudo: formData.tipo_conteudo,
          social_network: formData.social_network,
          publish_date: new Date(formData.publish_date),
          priority: formData.priority,
          client_id: formData.client_id || null,
        };
        const { error: updError } = await supabase
          .from("posts")
          .update(updatePayload)
          .eq("id", postId);
        if (updError) throw updError;

        if (uploadedFileId) {
          const { error: linkError } = await supabase
            .from("files")
            .update({ post_id: postId })
            .eq("id", uploadedFileId);
          if (linkError) throw linkError;
        }

        toast.success(
          "Post atualizado com sucesso! Redirecionando para Posts..."
        );
        router.push("/posts");
        return;
      }

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
        status: "pendente",
      };
      const { data: post, error: postError } = await supabase
        .from("posts")
        .insert(payload)
        .select("id")
        .single();
      if (postError) throw postError;

      if (uploadedFileId) {
        const { error: linkError } = await supabase
          .from("files")
          .update({ post_id: post.id })
          .eq("id", uploadedFileId);
        if (linkError) throw linkError;
      }

      toast.success("Post criado com sucesso! Redirecionando para Posts...");
      router.push("/posts");
      return;
    } catch (err: any) {
      toast.error("Erro ao salvar tema", {
        description: err?.message || String(err),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      if (!isUploadUnlocked) {
        toast.error("Aguarde aprovação do conteúdo para enviar mídia");
        return;
      }
      if (!user) {
        toast.error("Faça login para enviar arquivos");
        return;
      }
      setUploading(true);
      const info: UploadedInfo = await uploadToStorage(file, user.id);
      const saved = await saveFileMetadata(info, user.id);
      setUploadedFile({ url: info.signedUrl || undefined, name: file.name });
      setUploadedFileId(saved.id);

      if (postId) {
        const { error: linkError } = await supabase
          .from("files")
          .update({ post_id: postId })
          .eq("id", saved.id);
        if (linkError) throw linkError;
      }

      // Dispara processamento via next-video quando for um arquivo de vídeo
      if (file.type?.startsWith("video")) {
        const videoUrl = info.signedUrl || info.publicUrl;
        if (videoUrl) {
          try {
            const res = await fetch(`/api/video`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: videoUrl }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(
                data?.error || "Falha ao processar vídeo com next-video"
              );
            }
            toast.success("Vídeo em processamento (next-video)");
          } catch (e: any) {
            toast.error("Não foi possível iniciar o processamento do vídeo", {
              description: e?.message || String(e),
            });
          }
        }
      }

      toast.success("Arquivo salvo com sucesso");
    } catch (err: any) {
      toast.error("Erro ao enviar arquivo", {
        description: err?.message || String(err),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setUploadedFileId(null);
  };

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {stepTitle}
                </h1>
                <p className="text-slate-600 text-sm">
                  Defina o tema e as informações básicas para aprovação.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {postId && (
                <Badge
                  className={
                    isUploadUnlocked
                      ? "bg-green-100 text-green-800"
                      : "bg-amber-100 text-amber-800"
                  }
                >
                  {postStatus.replace("_", " ")}
                </Badge>
              )}
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
                    {submitLabel}
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

          {/* Conteúdo */}
          <div className="grid gap-8 lg:grid-cols-1">
            {/* Coluna principal */}
            <div className="lg:col-span-1 space-y-6">
              {/* Upload de Mídia (apenas Etapa 2) */}
              {isUploadUnlocked && (
                <Card className="bg-white/90 shadow-md border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      Upload de Mídia
                    </CardTitle>
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
              )}

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
                      placeholder="Detalhe os requisitos do conteúdo"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
              {/* Detalhes de Publicação */}
              <Card className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <CardHeader className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <CardTitle className="flex items-center gap-2 text-[#1B4B7C] text-lg font-semibold tracking-tight">
                    <Calendar className="w-5 h-5 text-[#1B4B7C]" />
                    Detalhes de Publicação
                  </CardTitle>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                    Campos obrigatórios marcados com *
                  </span>
                </CardHeader>

                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  {/* Canal */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Canal <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.social_network}
                      onValueChange={(v) =>
                        handleInputChange("social_network", v)
                      }
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 focus:ring-2 focus:ring-[#1B4B7C]/20 focus:border-[#1B4B7C]/50 transition-all">
                        <SelectValue placeholder="Selecionar canal" />
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

                  {/* Tipo de conteúdo */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tipo de Conteúdo <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.tipo_conteudo}
                      onValueChange={(v) =>
                        handleInputChange("tipo_conteudo", v)
                      }
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 focus:ring-2 focus:ring-[#1B4B7C]/20 focus:border-[#1B4B7C]/50 transition-all">
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

                  {/*  
                  
                  */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Data e Hora da Publicação{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="datetime-local"
                      value={formData.publish_date}
                      onChange={(e) =>
                        handleInputChange("publish_date", e.target.value)
                      }
                      required
                      className="rounded-xl border-slate-200 focus:ring-2 focus:ring-[#1B4B7C]/20 focus:border-[#1B4B7C]/50 transition-all"
                    />
                  </div>

                  {/* Prioridade */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Prioridade
                    </label>
                    <Select
                      value={formData.priority}
                      onValueChange={(v) => handleInputChange("priority", v)}
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 focus:ring-2 focus:ring-[#1B4B7C]/20 focus:border-[#1B4B7C]/50 transition-all">
                        <SelectValue placeholder="Selecionar prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="media">Média</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cliente */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Cliente
                    </label>
                    <Select
                      value={formData.client_id || "none"}
                      onValueChange={(v) =>
                        handleInputChange("client_id", v === "none" ? "" : v)
                      }
                    >
                      <SelectTrigger className="rounded-xl border-slate-200 focus:ring-2 focus:ring-[#1B4B7C]/20 focus:border-[#1B4B7C]/50 transition-all">
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
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={null}>
      <UploadPageContent />
    </Suspense>
  );
}
