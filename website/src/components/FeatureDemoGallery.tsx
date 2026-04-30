import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export interface DemoVideoItem {
  id: string;
  title: string;
  url: string;
  docsLinkUrl: string;
}

interface FeatureDemoGalleryProps {
  videos?: DemoVideoConfig[];
}

interface DemoVideoConfig {
  key: string;
  zhUrl: string;
  enUrl: string;
  title: string;
  docsLinkUrl: string;
}

const DEFAULT_DEMO_VIDEOS: DemoVideoConfig[] = [
  {
    key: "skill",
    zhUrl: "https://cloud.video.taobao.com/vod/1YQcdwTHy8BPw2ZDimp57qcHdyhjeJmNcF0NkKYlPtg.mp4",
    enUrl: "https://cloud.video.taobao.com/vod/msPkfBF7ss7g3sds_79utoqnYcMxz58QnpBSmR498Ac.mp4",
    title: "智能体技能的按需调用",
    docsLinkUrl: "https://qwenpaw.agentscope.io/docs/commands#Skill-%E8%81%8A%E5%A4%A9%E5%91%BD%E4%BB%A4",
  },
  {
    key: "doctor",
    zhUrl: "https://cloud.video.taobao.com/vod/CniIeapTXrFL9Mgt6askQ1cJASGl9tHX01Zb9E9z2qk.mp4",
    enUrl: "https://cloud.video.taobao.com/vod/JoYL8YwV0HXjQFuPCzDN2gaSxmSdudvc5rPWph4N_6s.mp4",
    title: "一键全面系统诊断",
    docsLinkUrl: "https://qwenpaw.agentscope.io/docs/cli#qwenpaw-doctor",
  },
];

export function FeatureDemoGallery({ videos }: FeatureDemoGalleryProps) {
  const { t, i18n } = useTranslation();
  const isZh = (i18n.resolvedLanguage ?? "").startsWith("zh");
  const videoConfigs = videos ?? DEFAULT_DEMO_VIDEOS;
  const demoVideos = useMemo<DemoVideoItem[]>(
    () =>
      videoConfigs.map((item) => ({
        id: item.key,
        title: item.title,
        url: isZh ? item.zhUrl : item.enUrl,
        docsLinkUrl: item.docsLinkUrl,
      })),
    [isZh, videoConfigs],
  );
  const [activeVideoId, setActiveVideoId] = useState(demoVideos[0]?.id ?? "");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const shouldAutoPlayRef = useRef(false);

  const activeVideo = useMemo(
    () => demoVideos.find((item) => item.id === activeVideoId) ?? demoVideos[0],
    [activeVideoId, demoVideos],
  );

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
    <section>
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
                  "rounded-sm border px-3 py-2 text-left text-sm transition-colors",
                  isActive
                    ? "bg-(--color-fill-secondary) text-(--color-text)"
                    : "border-border text-(--text-muted) hover:bg-(--color-fill-secondary) hover:text-(--color-text)",
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
        <div className="mx-auto flex max-w-6xl flex-col items-center">
          <div className="mb-3 flex w-full items-center justify-between gap-2">
            <h3 className="m-0 text-base font-semibold md:text-lg">
              {activeVideo.title}
            </h3>
            <a
              href={activeVideo.docsLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm text-(--color-text) !no-underline hover:bg-(--bg) hover:!no-underline"
            >
              {t("docs.textVersion")}
            </a>
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
