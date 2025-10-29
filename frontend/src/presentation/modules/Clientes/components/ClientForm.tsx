"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertCircle, Loader2, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { checkSlugAvailable, createClient, updateClient } from "@/lib/clients";
import { toast } from "sonner";
import { FileUploadZone } from "@/src/presentation/modules/upload/components/FileUploadZone";
import { uploadToStorage, saveFileMetadata, UploadedInfo } from "@/lib/storage";

type ClientType = {
  id?: string;
  company_name: string;
  email: string;
  services: string[];
  notes?: string;
  logo_url?: string;
  slug: string;
};

type ClientFormProps = {
  client?: ClientType | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveRedirect?: boolean;
};


export default function ClientForm({
  client,
  isOpen,
  onClose,
  onSaveRedirect = false,
}: ClientFormProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<ClientType>({
    company_name: "",
    email: "",
    services: [],
    notes: "",
    logo_url: "",
    slug: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugError, setSlugError] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<{ url?: string; name?: string } | null>(null);

  useEffect(() => {
    if (client) {
      setFormData({
        id: client.id,
        company_name: client.company_name,
        email: client.email,
        services: client.services || [],
        notes: client.notes,
        logo_url: client.logo_url,
        slug: client.slug,
      });
    } else {
      setFormData({
        company_name: "",
        email: "",
        services: [],
        notes: "",
        logo_url: "",
        slug: "",
      });
    }
    setError("");
    setSlugError("");
    setSlugAvailable(null);
  }, [client, isOpen]);

  const generateSlug = (companyName: string) =>
    companyName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const checkSlugUniqueness = async (slug: string) => {
    if (!slug || !user) return;
    try {
      setSlugChecking(true);
      const available = await checkSlugAvailable(user.id, slug, client?.id);
      if (!available) {
        setSlugError("Este slug já está em uso. Escolha outro.");
        setSlugAvailable(false);
      } else {
        setSlugError("");
        setSlugAvailable(true);
      }
    } catch (e: any) {
      setSlugError(e?.message || "Erro ao verificar slug");
      setSlugAvailable(false);
    } finally {
      setSlugChecking(false);
    }
  };

  useEffect(() => {
    if (formData.slug) {
      const timer = setTimeout(() => checkSlugUniqueness(formData.slug), 400);
      return () => clearTimeout(timer);
    } else {
      setSlugError("");
      setSlugAvailable(null);
    }
  }, [formData.slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Faça login para salvar o cliente");
      return;
    }
    if (slugError) {
      setError("Corrija o erro do slug antes de salvar.");
      return;
    }
    try {
      setIsSubmitting(true);
      const payload = {
        company_name: formData.company_name,
        email: formData.email,
        services: formData.services,
        notes: formData.notes,
        logo_url: formData.logo_url,
        slug: formData.slug,
      } as const;

      if (client?.id) {
        await updateClient(client.id, payload);
        toast.success("Cliente atualizado");
      } else {
        await createClient(user.id, payload);
        toast.success("Cliente criado");
      }

      if (onSaveRedirect && formData.slug) {
        router.push(`/clientes/${formData.slug}`);
      } else {
        onClose();
      }
    } catch (e: any) {
      toast.error("Erro ao salvar cliente", { description: e?.message || String(e) });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      if (!user) {
        toast.error("Faça login para enviar a logo");
        return;
      }
      setLogoUploading(true);
      const logosBucket = process.env.NEXT_PUBLIC_SUPABASE_LOGOS_BUCKET || "logos";
      const info: UploadedInfo = await uploadToStorage(file, user.id, { bucket: logosBucket });
      await saveFileMetadata(info, user.id);

      if (!info.publicUrl) {
        toast.error("Bucket de logos não é público", {
          description: "Torne o bucket 'logos' público ou ajuste as policies.",
        });
        setLogoUploading(false);
        return;
      }

      setLogoPreview({ url: info.publicUrl, name: file.name });
      setFormData((prev) => ({ ...prev, logo_url: info.publicUrl }));
      toast.success("Logo enviada com sucesso");
    } catch (e: any) {
      toast.error("Erro ao enviar logo", { description: e?.message || String(e) });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData((prev) => ({ ...prev, logo_url: "" }));
  };

  const handleServiceToggle = (serviceValue: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceValue)
        ? prev.services.filter((s) => s !== serviceValue)
        : [...prev.services, serviceValue],
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#0a2540]">
            {client ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* Informações Básicas */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company_name">Nome da Empresa *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      company_name: e.target.value,
                      slug: generateSlug(e.target.value),
                    })
                  }
                  required
                  placeholder="Ex: Empresa XYZ"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="slug" className="flex items-center gap-2">
                Slug (URL do Portal)
                {slugChecking && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                {!slugChecking && slugAvailable && <CheckCircle className="w-4 h-4 text-green-500" />}
                {!slugChecking && slugAvailable === false && <XCircle className="w-4 h-4 text-red-500" />}
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="empresa-xyz"
              />
              {slugError && <p className="text-sm text-red-600 mt-1">{slugError}</p>}
            </div>
          </section>

          {/* Logo do Cliente */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Logo do Cliente</h3>
            <FileUploadZone
              onFileUpload={handleLogoUpload}
              onRemoveFile={handleRemoveLogo}
              uploadedFile={logoPreview || (formData.logo_url ? { url: formData.logo_url, name: "logo" } : undefined)}
              uploading={logoUploading}
            />
          </section>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || slugChecking} className="bg-[#053665] hover:bg-[#052244]">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : client ? (
                "Salvar Alterações"
              ) : (
                "Criar Cliente"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
