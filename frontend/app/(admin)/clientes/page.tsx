/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { PlusCircle, Search, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ClientForm from "@/src/presentation/modules/Clientes/components/ClientForm";
import ClientTable from "@/src/presentation/modules/Clientes/components/ClientTable";
import ClientStats from "@/src/presentation/modules/Clientes/components/ClientStats";
import { useAuth } from "@/lib/auth-context";
import { listClients } from "@/lib/clients";
import { toast } from "sonner";

type ClientType = {
  id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  logo_url?: string;
  status?: string;
  industry?: string;
  slug?: string;
};

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientType | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    industry: "all",
  });

  useEffect(() => {
    loadClients();
  }, [user?.id]);

  const loadClients = async () => {
    try {
      setLoading(true);
      if (!user) {
        setClients([]);
        setLoading(false);
        return;
      }
      const data = (await listClients(user.id)) as ClientType[];
      setClients(data ?? []);
    } catch (e: any) {
      toast.error("Erro ao carregar clientes", {
        description: e?.message || String(e),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client: ClientType) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setEditingClient(null);
    setShowForm(false);
    loadClients();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const filteredClients = clients.filter((client) => {
    const search = filters.search.toLowerCase();
    const searchMatch =
      client.company_name.toLowerCase().includes(search) ||
      client.contact_name?.toLowerCase().includes(search) ||
      client.email?.toLowerCase().includes(search);

    const statusMatch =
      filters.status === "all" || client.status === filters.status;
    const industryMatch =
      filters.industry === "all" || client.industry === filters.industry;

    return searchMatch && statusMatch && industryMatch;
  });

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Gerenciamento de Clientes
            </h1>
            <p className="text-slate-600">
              Cadastre e gerencie informações dos seus clientes
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingClient(null);
              setShowForm(true);
            }}
            className="bg-[#0a2540] hover:bg-[#132c50] text-white shadow-md gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Estatísticas */}
        <ClientStats clients={clients} loading={loading} />

        {/* Filtros */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por empresa, contato ou email..."
                  className="pl-9"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>

             

             
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0a2540]" />
              Lista de Clientes ({filteredClients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ClientTable
              clients={filteredClients}
              loading={loading}
              onEdit={handleEdit}
              onDelete={loadClients}
              onViewProfile={(id: string) =>
                console.log("Abrir perfil do cliente:", id)
              }
            />
          </CardContent>
        </Card>

        {/* Modal de formulário */}
        {showForm && (
          <ClientForm
          //@ts-ignore
            client={editingClient}
            isOpen={showForm}
            onClose={handleFormClose}
            onSaveRedirect={false}
          />
        )}
      </div>
    </div>
  );
}
