"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Image as ImageIcon, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ====================== Tipagem ======================
type UploadedFile = {
  url?: string;
  name?: string;
};

type FormData = {
  title?: string;
  tema?: string;
  content?: string;
  social_network?: string;
  tipo_conteudo?: string;
  priority?: string;
  publish_date?: string | Date;
};

type PostPreviewProps = {
  formData: FormData;
  uploadedFile?: UploadedFile | null;
};

// ====================== Helpers ======================
const isVideoFile = (url?: string) => {
  if (!url) return false;
  return /\.(mp4|mov|avi|mkv|webm)$/i.test(url);
};

const isImageFile = (url?: string) => {
  if (!url) return false;
  return /\.(jpeg|jpg|gif|png)$/i.test(url);
};

const getNetworkColor = (network?: string) => {
  const colors: Record<string, string> = {
    instagram: "bg-pink-100 text-pink-800",
    facebook: "bg-blue-100 text-blue-800",
    linkedin: "bg-indigo-100 text-indigo-800",
    tiktok: "bg-slate-900 text-white",
    youtube: "bg-red-100 text-red-800",
  };
  return colors[network ?? ""] || "bg-slate-100 text-slate-800";
};

// ====================== Componente ======================
export function PostPreview({ formData, uploadedFile }: PostPreviewProps) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0 sticky top-6">
      <CardHeader className="border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-900">
          <Eye className="w-5 h-5 text-[#053665]" />
          Pré-visualização
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {/* ======= Mídia ======= */}
        <div className="aspect-square bg-slate-900 rounded-xl overflow-hidden mb-4 flex items-center justify-center">
          {uploadedFile?.url ? (
            isVideoFile(uploadedFile.url) ? (
              <video
                src={uploadedFile.url}
                controls
                className="w-full h-full object-cover"
              />
            ) : isImageFile(uploadedFile.url) ? (
              <img
                src={uploadedFile.url}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <FileText className="w-12 h-12" />
                <p className="text-sm">{uploadedFile.name}</p>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <ImageIcon className="w-12 h-12" />
              <p className="text-sm">Nenhuma mídia selecionada</p>
            </div>
          )}
        </div>

        {/* ======= Informações do Post ======= */}
        <div className="space-y-3">
          {formData.title && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Título</p>
              <p className="font-semibold text-slate-900">{formData.title}</p>
            </div>
          )}

          {formData.tema && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Tema</p>
              <p className="text-sm text-slate-700">{formData.tema}</p>
            </div>
          )}

          {formData.content && (
            <div>
              <p className="text-xs text-slate-500 mb-1">Legenda</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {formData.content}
              </p>
            </div>
          )}

          {/* ======= Badges ======= */}
          <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-200">
            {formData.social_network && (
              <Badge className={getNetworkColor(formData.social_network)}>
                {formData.social_network}
              </Badge>
            )}

            {formData.tipo_conteudo && (
              <Badge variant="outline" className="border-slate-300">
                {formData.tipo_conteudo}
              </Badge>
            )}

            {formData.priority && (
              <Badge variant="outline" className="border-slate-300">
                {formData.priority}
              </Badge>
            )}
          </div>

          {/* ======= Data de Publicação ======= */}
          {formData.publish_date && (
            <div className="pt-3 border-t border-slate-200">
              <p className="text-xs text-slate-500 mb-1">
                Publicação programada
              </p>
              <p className="text-sm font-medium text-slate-900">
                {format(new Date(formData.publish_date), "dd/MM/yyyy 'às' HH:mm", {
                  locale: ptBR,
                })}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
