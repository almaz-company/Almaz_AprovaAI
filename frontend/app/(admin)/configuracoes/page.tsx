/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase/client";
import { uploadToStorage, type UploadedInfo } from "@/lib/storage";
import { toast } from "sonner";

export default function ConfiguracoesPage() {
  const { user, loading } = useAuth();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(
    (user?.user_metadata as any)?.avatar_url || ""
  );

  const name =
    (user?.user_metadata as any)?.name ||
    (user?.user_metadata as any)?.full_name ||
    "Usuário";
  const email = user?.email ?? "-";
  const id = user?.id ?? "-";
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleString("pt-BR")
    : "-";

  // Função de upload de avatar
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!user?.id) {
        toast.error("Faça login para alterar a foto de perfil.");
        return;
      }

      // Validações básicas: tipo e tamanho (até ~5MB)
      if (!file.type.startsWith("image/")) {
        toast.error("Selecione um arquivo de imagem válido.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Imagem muito grande. Limite de 5MB.");
        return;
      }

      setUploading(true);

      // Novo fluxo: usa bucket existente (uploads) com prefixo avatars/
      const bucket = process.env.NEXT_PUBLIC_SUPABASE_PROFILE_BUCKET || "";
      let info: UploadedInfo;
      try {
        info = await uploadToStorage(file, user.id, {
          bucket,
          pathPrefix: "avatars",
        });
      } catch (e) {
        const msg = (e as any)?.message || String(e);
        if (String(msg).toLowerCase().includes("bucket not found")) {
          toast.error("Bucket não encontrado", {
            description: `Crie o bucket "${bucket}" no Supabase Storage ou ajuste NEXT_PUBLIC_SUPABASE_BUCKET.`,
          });
          return;
        }
        throw e;
      }

      const publicOrSigned = info.publicUrl || info.signedUrl || "";

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicOrSigned },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicOrSigned);
      toast.success("Foto de perfil atualizada com sucesso!");
      return;

      
    } catch (error: any) {
      console.error(error);
      toast.error("Falha ao enviar a foto. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 p-8">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Cabeçalho */}
        <div className="text-center md:text-left space-y-1">
          <h1 className="text-3xl font-bold text-[#053665] tracking-tight">
            Configurações
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Gerencie seu perfil e preferências de conta.
          </p>
        </div>

        {/* Seção: Perfil */}
        <Card className="bg-white/90 border border-slate-200 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2 border-b border-slate-100">
            <CardTitle className="flex items-center gap-2 text-[#053665] font-semibold text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#053665]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.121 17.804A4 4 0 006 21h12a4 4 0 00.879-3.196M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Perfil
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-8 p-6">
            {/* Upload de Foto */}
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-full object-cover border border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9A3.75 3.75 0 1112 5.25 3.75 3.75 0 0115.75 9zM4.5 20.25a7.5 7.5 0 0115 0v.75H4.5v-.75z"
                      />
                    </svg>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 bg-[#053665] hover:bg-[#042B52] text-white rounded-full p-2 shadow-md transition-all duration-200"
                  title="Alterar foto"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536M9 11l6.768-6.768a2 2 0 112.828 2.828L11.828 13.83a2 2 0 01-.878.515l-4.242 1.06a.5.5 0 01-.606-.606l1.06-4.242a2 2 0 01.515-.878z"
                    />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </div>

              <div className="space-y-1">
                <h3 className="font-medium text-slate-800">{name}</h3>
                <p className="text-sm text-slate-500">{email}</p>
                {uploading && (
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    Enviando...
                  </p>
                )}
              </div>
            </div>

            {/* Informações */}
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-600 font-medium">
                  ID do Usuário
                </Label>
                <Input
                  value={id}
                  readOnly
                  className="rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-slate-600 font-medium">
                  Criado em
                </Label>
                <Input
                  value={createdAt}
                  readOnly
                  className="rounded-xl border border-slate-200 bg-slate-50 text-slate-700"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rodapé */}
        <div className="text-center text-xs text-slate-400 pt-4">
          © {new Date().getFullYear()} AlmazDigital — Todos os direitos
          reservados.
        </div>
      </div>
    </div>
  );
}

