"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

type ClientType = {
  id: string;
  status?: string;
  created_date?: string;
  updated_date?: string;
};

type ClientStatsProps = {
  clients: ClientType[];
  loading: boolean;
};

export default function ClientStats({ clients, loading }: ClientStatsProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

const getLastUpdate = () => {
  if (!clients || clients.length === 0) return "Nunca";

  // Filtra clientes com alguma data válida
  const validClients = clients.filter((c) => {
    const date = c.updated_date || c.created_date;
    return date && !isNaN(new Date(date).getTime());
  });

  if (validClients.length === 0) return "Nunca";

  // Encontra o cliente com data mais recente
  const mostRecentClient = validClients.reduce((latest, client) => {
    const clientDate = new Date(client.updated_date || client.created_date!);
    const latestDate = new Date(latest.updated_date || latest.created_date!);
    return clientDate > latestDate ? client : latest;
  });

  const lastUpdateDate = new Date(
    mostRecentClient.updated_date || mostRecentClient.created_date!
  );

  // Garante que a data seja válida
  if (isNaN(lastUpdateDate.getTime())) return "Nunca";

  return formatDistanceToNow(lastUpdateDate, {
    addSuffix: true,
    locale: ptBR,
    includeSeconds: true,
  });
};


  // === Estado de carregamento ===
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card
            key={i}
            className="bg-white/90 backdrop-blur-sm shadow-lg border-0"
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // === Estatísticas gerais ===
  const stats = {
    total: clients.length,
  };

  const statsCards = [
    {
      title: "Clientes Ativos",
      value: stats.total,
      icon: Building2,
      bgColor: "bg-[#053665]",
      bgLight: "bg-[#053665]/10",
      textColor: "text-[#053665]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsCards.map((stat, index) => (
        <Card
          key={index}
          className="
            relative overflow-hidden rounded-2xl backdrop-blur-xl
            bg-gradient-to-br from-white/95 to-slate-50/90
            border border-slate-200/50
            shadow-md hover:shadow-xl hover:-translate-y-1
            transition-all duration-300 group
          "
        >
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-center">
              {/* Texto */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-[#0a2540] leading-tight group-hover:scale-[1.03] transition-transform duration-300">
                  {stat.value}
                </p>
              </div>

              {/* Ícone */}
              <div
                className={`
                  p-3 rounded-2xl ${stat.bgLight}
                  flex items-center justify-center
                  group-hover:scale-110 transition-transform duration-300 shadow-inner
                `}
              >
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>

            {/* Linha divisória */}
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-slate-200/60 to-transparent mt-3" />

            {/* Aura decorativa */}
            <div
              className={`
                absolute -top-6 -right-6 w-20 h-20 rounded-full ${stat.bgLight}
                blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
              `}
            />
          </CardContent>
        </Card>
      ))}

    
    </div>
  );
}
