"use client"

import { supabase } from "@/lib/supabase/client"

export type UploadedInfo = {
  bucket: string
  path: string
  name: string
  size: number
  contentType: string | null
  signedUrl?: string
  publicUrl?: string
}

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "uploads"

type UploadOptions = { pathPrefix?: string; bucket?: string }
export async function uploadToStorage(file: File, userId: string, opts: UploadOptions = {}): Promise<UploadedInfo> {
  const ext = file.name.split(".").pop() || "bin"
  const safeName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_")
  const prefix = opts.pathPrefix ? `${opts.pathPrefix.replace(/\/+$/,'')}/` : ""
  const path = `${prefix}${userId}/${Date.now()}_${safeName}`
  const bucket = opts.bucket || BUCKET

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) throw uploadError

  // Try to create a short-lived signed URL for preview if bucket is private
  let signedUrl: string | undefined
  const { data: signed } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60)
  signedUrl = signed?.signedUrl
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)

  return {
    bucket,
    path,
    name: file.name,
    size: file.size,
    contentType: file.type || null,
    signedUrl,
    publicUrl: pub?.publicUrl,
  }
}

export async function saveFileMetadata(info: UploadedInfo, userId: string): Promise<{ id: string }> {
  const { data, error } = await supabase.from("files").insert({
    user_id: userId,
    bucket: info.bucket,
    path: info.path,
    name: info.name,
    size: info.size,
    content_type: info.contentType,
  }).select("id").single()
  if (error) throw error
  return { id: data.id as string }
}
