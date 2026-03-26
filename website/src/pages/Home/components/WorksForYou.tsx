import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

const dashAnimations = `
@keyframes copaw-dash-move-right {
  0% { background-position: 0 0; }
  100% { background-position: 16px 0; }
}
@keyframes copaw-dash-move-left {
  0% { background-position: 0 0; }
  100% { background-position: -16px 0; }
}
`;

const container = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: "easeOut",
      when: "beforeChildren",
      staggerChildren: 0.08,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const cards = [
  {
    key: "skills",
    icon: "/support-skills.svg",
    href: "/docs/skills",
  },
  {
    key: "control",
    icon: "/under-control.svg",
    href: "/docs/privacy",
  },
  {
    key: "apps",
    icon: "/explore-apps.svg",
    href: "/docs/apps",
  },
] as const;

export function CopawWorksForYou() {
  const { t } = useTranslation();

  return (
    <>
      <style>{dashAnimations}</style>
      <motion.section
      className="px-4 py-12 md:py-16"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      aria-labelledby="copaw-works-heading"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div variants={item}>
          <h2
            id="copaw-works-heading"
            className="font-newsreader font-semibold text-[1.8rem] leading-[1.2] text-(--color-text) sm:text-[2rem] md:text-4xl"
          >
            {t("worksForYou.title")}
          </h2>
          <p className="font-inter mt-2 max-w-[34ch] text-[13px] leading-relaxed text-(--color-text-tertiary) sm:max-w-none md:text-[1rem]">
            {t("worksForYou.sub")}
          </p>
        </motion.div>

        <div className="relative mt-8 py-8 md:mt-12 md:py-12">
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-px w-screen -translate-x-1/2"
            style={{
              background:
                "repeating-linear-gradient(to right, rgba(255,157,77,0.45) 0 8px, transparent 8px 16px)",
              backgroundSize: "16px 100%",
              animation: "copaw-dash-move-right 1s linear infinite",
            }}
          />
          <motion.div
            className="grid gap-0 divide-y divide-[#f1e5dc] md:grid-cols-3 md:gap-10 md:divide-y-0"
            variants={item}
          >
            {cards.map((card) => (
              <article
                key={card.key}
                className="flex flex-col py-6 first:pt-0 last:pb-0 md:py-0"
              >
                <img
                  src={card.icon}
                  alt=""
                  aria-hidden
                  className="h-20 w-20 object-contain opacity-80 md:h-23 md:w-23"
                />
                <h3 className="font-newsreader mt-3 text-[1.65rem] leading-[1.1] text-(--color-text) sm:text-[1.8rem] md:mt-4 md:text-[1.8rem]">
                  {t(`worksForYou.cards.${card.key}.title`)}
                </h3>
                <p className="font-inter mt-2 text-[13px] leading-[1.65] text-(--color-text-secondary) md:text-base">
                  {t(`worksForYou.cards.${card.key}.desc`)}
                </p>
                <a
                  href={card.href}
                  className="font-inter mt-4 inline-flex w-fit items-center gap-2 text-[0.95rem] text-(--color-text) transition hover:text-orange-400! md:mt-5 md:text-base"
                >
                  {t("worksForYou.learnMore")}
                  <span aria-hidden>→</span>
                </a>
              </article>
            ))}
          </motion.div>
          <div
            className="pointer-events-none absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2"
            style={{
              background:
                "repeating-linear-gradient(to right, rgba(255,157,77,0.45) 0 8px, transparent 8px 16px)",
              backgroundSize: "16px 100%",
              animation: "copaw-dash-move-left 1s linear infinite",
            }}
          />
        </div>
      </div>
    </motion.section>
    </>
  );
}
