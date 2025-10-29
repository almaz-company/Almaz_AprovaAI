"use client"

import { supabase } from "@/lib/supabase/client"

export type Client = {
  id?: string
  user_id?: string
  company_name: string
  email?: string
  services?: string[]
  notes?: string
  logo_url?: string
  slug: string
}

export async function listClients(userId: string) {
  const { data, error } = await supabase
    .from("clients")
    .select("id, company_name, email, logo_url, slug")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

export async function checkSlugAvailable(userId: string, slug: string, excludeId?: string) {
  let query = supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("slug", slug)
  if (excludeId) query = query.neq("id", excludeId)
  const { count, error } = await query
  if (error) throw error
  return (count ?? 0) === 0
}

export async function createClient(userId: string, client: Client) {
  const payload = { ...client, user_id: userId }
  const { data, error } = await supabase.from("clients").insert(payload).select("id").single()
  if (error) throw error
  return data.id as string
}

export async function updateClient(id: string, client: Partial<Client>) {
  const { error } = await supabase.from("clients").update({ ...client, updated_at: new Date().toISOString() }).eq("id", id)
  if (error) throw error
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from("clients").delete().eq("id", id)
  if (error) throw error
}
