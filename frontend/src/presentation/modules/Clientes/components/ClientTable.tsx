/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Edit, Trash2, Building2, MoreHorizontal, Eye } from "lucide-react";
import { deleteClient } from "@/lib/clients";
import { toast } from "sonner";

type ClientType = {
  id: string;
  company_name: string;
  email?: string;
  logo_url?: string;
  slug?: string;
};

type ClientTableProps = {
  clients: ClientType[];
  loading: boolean;
  onEdit: (client: ClientType) => void;
  onDelete: () => void;
  onViewProfile: (id: string) => void;
};

export default function ClientTable({
  clients,
  loading,
  onEdit,
  onDelete,
  onViewProfile,
}: ClientTableProps) {
  const handleDelete = async (clientId: string) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita."
      )
    ) {
      try {
        await deleteClient(clientId);
        toast.success("Cliente excluído");
        onDelete();
      } catch (error) {
        const e: any = error;
        toast.error("Erro ao excluir cliente", { description: e?.message || String(e) });
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Nenhum cliente encontrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="text-left p-3 text-sm font-semibold text-slate-700">Cliente</th>
            <th className="text-left p-3 text-sm font-semibold text-slate-700">Preview</th>
            <th className="text-right p-3 text-sm font-semibold text-slate-700">Ações</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {client.logo_url ? (
                      <img src={client.logo_url} alt={client.company_name} className="w-full h-full object-contain" />
                    ) : (
                      <Building2 className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{client.company_name}</p>
                    <p className="text-xs text-slate-500">{client.email}</p>
                  </div>
                </div>
              </td>
              <td className="p-3">
                {client.slug ? (
                  <a
                    href={`/preview/${client.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Abrir link público
                  </a>
                ) : (
                  <span className="text-slate-400 text-sm">—</span>
                )}
              </td>
              <td className="p-3 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewProfile(client.id)}>
                      <Eye className="w-4 h-4 mr-2" /> Ver Perfil
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(client)}>
                      <Edit className="w-4 h-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(client.id)} className="text-red-600 focus:bg-red-50 focus:text-red-700">
                      <Trash2 className="w-4 h-4 mr-2" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
