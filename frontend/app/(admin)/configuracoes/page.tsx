"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/src/presentation/modules/Dashboard/layout/Sidebar/context/ThemeContext";

export default function ConfiguracoesPage() {
  const { user, loading } = useAuth();
  const { theme, effectiveTheme, toggleTheme, followSystem, setFollowSystem, setTheme } = useTheme();

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

        {/* Aparência */}
        <Card className="bg-white/90 border-0 shadow-md">
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">Seguir tema do sistema</div>
                <div className="text-sm text-slate-500">Automaticamente alterna entre claro/escuro conforme o sistema operacional.</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">{followSystem ? "ativado" : "desativado"}</Badge>
                <Switch checked={followSystem} onCheckedChange={setFollowSystem} />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">Modo escuro</div>
                <div className="text-sm text-slate-500">Use um tema escuro em toda a interface. {followSystem && "(controlado pelo sistema)"}</div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize">{theme} ({effectiveTheme})</Badge>
                <Switch
                  checked={effectiveTheme === "dark"}
                  disabled={followSystem}
                  onCheckedChange={(checked) => {
                    if (followSystem) setFollowSystem(false);
                    setTheme(checked ? "dark" : "light");
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
