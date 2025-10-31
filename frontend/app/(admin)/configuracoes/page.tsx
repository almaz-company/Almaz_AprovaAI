"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
// Removido: controles de tema (dark/light) na página de configurações

export default function ConfiguracoesPage() {
  const { user, loading } = useAuth();

  const name = (user?.user_metadata as any)?.name || (user?.user_metadata as any)?.full_name || "Usuário";
  const email = user?.email ?? "-";
  const id = user?.id ?? "-";
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleString("pt-BR") : "-";

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
          <p className="text-slate-600 text-sm">Gerencie seu perfil e preferências de aparência.</p>
        </div>

        {/* Perfil */}
        <Card className="bg-white/90 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Nome</Label>
                <Input value={loading ? "Carregando..." : name} readOnly />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={loading ? "Carregando..." : email} readOnly />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>ID do Usuário</Label>
                <Input value={id} readOnly />
              </div>
              <div>
                <Label>Criado em</Label>
                <Input value={createdAt} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aparência removida: tema fixo, sem alternância dark/light nesta página. */}
      </div>
    </div>
  );
}
