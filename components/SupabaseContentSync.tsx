"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

function getLocalContents() {
  try {
    return JSON.parse(localStorage.getItem("jasky_contents") || "[]");
  } catch {
    return [];
  }
}

function mapContent(item: any, oldItem: any) {
  const videos = Array.isArray(item.jasky_online_videos)
    ? item.jasky_online_videos
        .sort((a: any, b: any) => Number(a.position || 0) - Number(b.position || 0))
        .map((video: any, index: number) => ({
          id: video.id || `${item.id}-video-${index + 1}`,
          title: video.filename || `Video ${index + 1}`,
          url: video.video_url,
          videoUrl: video.video_url,
          mediaDataUrl: video.video_url,
          fileUrl: video.video_url,
          filename: video.filename || `video-${index + 1}.mp4`,
          name: video.filename || `video-${index + 1}.mp4`,
          size: video.file_size || 0,
          type: video.mime_type || "video/mp4",
          order: video.position || index + 1,
        }))
    : [];

  const firstVideo = videos[0];

  return {
    id: item.id,
    title: item.title,
    description: item.description || "",
    thumbnailDataUrl: item.thumbnail_url || "",
    thumbnailUrl: item.thumbnail_url || "",
    thumbnail_url: item.thumbnail_url || "",
    videoUrl: firstVideo?.videoUrl || "",
    mediaUrl: firstVideo?.videoUrl || "",
    fileUrl: firstVideo?.videoUrl || "",
    mediaDataUrl: firstVideo?.videoUrl || "",
    filename: firstVideo?.filename || "",
    mediaName: firstVideo?.filename || "",
    isVip: Boolean(item.is_vip),
    vip: Boolean(item.is_vip),
    vipKey: item.vip_key || "",
    keyVip: item.vip_key || "",
    expiredAt: item.expired_at || "",
    downloadEnabled: item.download_enabled !== false,
    commentsEnabled: item.comments_enabled !== false,
    createdAt: item.created_at || new Date().toISOString(),
    videos,
    content_videos: videos,

    // INI YANG PENTING: jangan hapus data interaksi lokal
    views: oldItem?.views || 0,
    likes: oldItem?.likes || 0,
    unlikes: oldItem?.unlikes || 0,
    ratings: Array.isArray(oldItem?.ratings) ? oldItem.ratings : [],
    comments: Array.isArray(oldItem?.comments) ? oldItem.comments : [],
  };
}

export default function SupabaseContentSync() {
  useEffect(() => {
    let alive = true;

    async function load() {
      const oldContents = getLocalContents();
      const oldById = new Map(oldContents.map((item: any) => [item.id, item]));

      const { data, error } = await supabase
        .from("jasky_online_contents")
        .select("*, jasky_online_videos(*)")
        .order("created_at", { ascending: false });

      if (!alive || error || !data) return;

      const next = data.map((item: any) => mapContent(item, oldById.get(item.id)));

      localStorage.setItem("jasky_contents", JSON.stringify(next));
      window.dispatchEvent(new Event("jasky-sync"));
    }

    load();

    const channel = supabase
      .channel("jasky-online-content-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "jasky_online_contents" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "jasky_online_videos" }, load)
      .subscribe();

    const interval = window.setInterval(load, 15000);

    return () => {
      alive = false;
      window.clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
