import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface DemoVideoItem {
  id: string;
  title: string;
  url: string;
}

interface FeatureDemoGalleryProps {
  videos?: string[];
}

const DEFAULT_DEMO_VIDEO_URLS = [
  "https://cloud.video.taobao.com/vod/tvAkpWXYP_x-B-tAW2yvfacHdyhjeJmNcF0NkKYlPtg.mp4",
] as const;
const EN_DEMO_VIDEO_URLS = [
  "https://cloud.video.taobao.com/vod/-_5Lk45s5_PAFzN2Ms5SyYqnYcMxz58QnpBSmR498Ac.mp4",
] as const;
export function FeatureDemoGallery({ videos }: FeatureDemoGalleryProps) {
  const { t, i18n } = useTranslation();
  const localizedDefaultUrls =
    i18n.resolvedLanguage === "zh" ? DEFAULT_DEMO_VIDEO_URLS : EN_DEMO_VIDEO_URLS;
  const videoUrls = videos ?? localizedDefaultUrls;
  const demoVideos = useMemo<DemoVideoItem[]>(
    () =>
      videoUrls.map((url, idx) => ({
        id: `demo-${idx + 1}`,
        title: t(`docs.demoVideo${idx + 1}`),
        url,
      })),
    [t, videoUrls],
  );
  const [activeVideoId, setActiveVideoId] = useState(demoVideos[0]?.id ?? "");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shouldAutoPlayRef = useRef(false);

  const activeVideo = useMemo(
    () => demoVideos.find((item) => item.id === activeVideoId) ?? demoVideos[0],
    [activeVideoId, demoVideos],
  );

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    void videoRef.current.requestFullscreen?.();
  };

  const handleSwitchVideo = (nextVideoId: string) => {
    if (nextVideoId === activeVideoId) return;
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    shouldAutoPlayRef.current = true;
    setActiveVideoId(nextVideoId);
  };

  useEffect(() => {
    if (!shouldAutoPlayRef.current) return;
    shouldAutoPlayRef.current = false;
    void videoRef.current?.play().catch(() => {
      // Ignore autoplay failure; user can press play manually.
    });
  }, [activeVideoId]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    shouldAutoPlayRef.current = true;
  }, [i18n.resolvedLanguage]);

  if (demoVideos.length === 0) return null;

  return (
    <section className="feature-demo-gallery mt-6 rounded-xl border border-border bg-(--surface) p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {demoVideos.map((item, idx) => {
            const isActive = item.id === activeVideo?.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSwitchVideo(item.id)}
                className={[
                  "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "border-(--color-primary) bg-(--color-fill-secondary) text-(--color-text)"
                    : "border-border text-(--text-muted) hover:bg-(--bg) hover:text-(--color-text)",
                ].join(" ")}
                aria-pressed={isActive}
              >
                {idx + 1}. {item.title}
              </button>
            );
          })}
        </div>
      </div>

      {activeVideo && (
        <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center">
          <div className="mb-3 flex w-full items-center justify-between gap-2">
            <h3 className="m-0 text-base font-semibold md:text-lg">
              {activeVideo.title}
            </h3>
            <button
              type="button"
              onClick={handleFullscreen}
              className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-sm text-(--color-text) hover:bg-(--bg)"
            >
              <Maximize2 size={14} aria-hidden />
              {t("docs.fullscreen")}
            </button>
          </div>
          <video
            key={`${i18n.resolvedLanguage}-${activeVideo.id}`}
            ref={videoRef}
            src={activeVideo.url}
            controls
            className="aspect-video !h-auto !w-full !max-w-none !max-h-none rounded-xl bg-black object-contain shadow-sm"
          >
            {t("docs.videoNotSupported")}
          </video>
        </div>
      )}
    </section>
  );
}
