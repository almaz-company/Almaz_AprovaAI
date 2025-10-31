"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ApexOptions } from "apexcharts";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase/client";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export function ConversionFunnel() {
  const { user } = useAuth();
  const [seriesData, setSeriesData] = useState<number[]>([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState<boolean>(false);

  const labels = useMemo(() => [
    "Pendentes",
    "Em Revisão",
    "Aprovados",
    "Com Mídia",
    "Rejeitados",
  ], []);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // Pendentes
      const pendQ = supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "pendente");
      // Em análise (em_revisao)
      const analiseQ = supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "em_revisao");
      // Aprovadas
      const aprovQ = supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "aprovado");
      // Rejeitadas
      const rejQ = supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "rejeitado");
      // Finalizadas: posts com pelo menos 1 arquivo vinculado
      const filesQ = supabase
        .from("files")
        .select("post_id")
        .eq("user_id", user.id)
        .not("post_id", "is", null);

      const [pendR, analiseR, aprovR, rejR, filesR] = await Promise.all([
        pendQ,
        analiseQ,
        aprovQ,
        rejQ,
        filesQ,
      ]);

      const pend = (pendR as any)?.count ?? 0;
      const analise = (analiseR as any)?.count ?? 0;
      const aprov = (aprovR as any)?.count ?? 0;
      const reje = (rejR as any)?.count ?? 0;
      const uniqFinal = new Set((filesR as any)?.data?.map((r: any) => r.post_id).filter(Boolean)).size;

      setSeriesData([pend, analise, aprov, uniqFinal, reje]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  // Realtime sync: posts/files changes atualizam o funil
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`funnel-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts', filter: `user_id=eq.${user.id}` },
        () => { load(); }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'files', filter: `user_id=eq.${user.id}` },
        () => { load(); }
      )
      .subscribe();

    return () => { try { supabase.removeChannel(channel); } catch { /* ignore */ } };
  }, [user?.id, load]);

  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: { show: false },
      fontFamily: "Inter, sans-serif",
    },
    plotOptions: {
      bar: {
        borderRadius: 8,
        horizontal: true,
        distributed: true,
        barHeight: "75%",
        isFunnel: true as unknown as boolean, // compat TS: propriedade específica do apex
      },
    },
    colors: ["#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#10B981"],
    dataLabels: {
      enabled: true,
      formatter: function (_val, opt) {
        return (opt?.w as any)?.globals?.labels?.[opt?.dataPointIndex ?? 0] ?? "";
      },
      dropShadow: { enabled: false },
      style: { fontSize: "13px", fontWeight: 600, colors: ["#fff"] },
    },
    xaxis: {
      categories: labels,
      labels: {
        formatter: (value: string | number) => `${Number(value).toLocaleString("pt-BR")}`,
        style: { colors: "#64748B", fontSize: "12px" },
      },
    },
    yaxis: { labels: { show: false } },
    tooltip: {
      theme: "light",
      y: {
        formatter: (value: number) => `${value.toLocaleString("pt-BR")} propostas`,
        title: { formatter: () => "" },
      },
    },
    legend: { show: false },
    grid: { show: false },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Funil de Conversão</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactApexChart
          options={options}
          series={[{ name: "Funil de Conversão", data: seriesData }]}
          type="bar"
          height={350}
        />
        {loading && <div className="text-xs text-slate-500 mt-2">Atualizando...</div>}
      </CardContent>
    </Card>
  );
}
