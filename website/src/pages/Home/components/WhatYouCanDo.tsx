import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

type UseCaseKey =
  | "social"
  | "creative"
  | "productivity"
  | "research"
  | "assistant";

const CATEGORIES: Array<{
  key: UseCaseKey;
}> = [
  { key: "social" },
  { key: "creative" },
  { key: "productivity" },
  { key: "research" },
  { key: "assistant" },
];

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
    transition: { duration: 0.35, ease: "easeOut" },
  },
};

export function CopawWhatYouCanDo() {
  const { t } = useTranslation();
  const [activeKey, setActiveKey] = useState<UseCaseKey>("social");

  const activeDescription = useMemo(
    () => t(`usecases.${activeKey}.1`),
    [activeKey, t],
  );

  return (
    <motion.section
      className="px-4 py-10 md:py-16"
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      aria-labelledby="copaw-usecase-heading"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div className="text-center" variants={item}>
          <h2
            id="copaw-usecase-heading"
            className="font-newsreader text-4xl font-semibold leading-[1.2] text-(--color-text) md:text-4xl]"
          >
            {t("usecases.title")}
          </h2>
          <p className="font-inter mx-auto mt-3 max-w-2xl px-1 text-[13px] leading-relaxed text-(--color-text-tertiary) sm:text-sm md:px-0 md:text-[1rem]">
            {t("usecases.sub")}
          </p>
        </motion.div>

        <div className="mt-7 grid gap-5 md:mt-15 md:grid-cols-[minmax(260px,1fr)_minmax(0,1.6fr)] md:items-start md:gap-6">
          <div className="p-1.5 md:p-3">
            {CATEGORIES.map(({ key }) => {
              const active = key === activeKey;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveKey(key)}
                  className="relative w-full py-4 text-left transition md:py-5"
                >
                  <span
                    className="absolute bottom-0 left-10 right-0 h-px bg-[#FDE8D7] md:left-11"
                    aria-hidden
                  />

                  <div className="relative z-10 flex items-start gap-2.5 px-1.5 md:gap-3 md:px-2">
                    {active ? (
                      <motion.img
                        layoutId="copaw-usecase-active-logo"
                        src="/copaw-logo.svg"
                        alt=""
                        aria-hidden
                        className="mt-1 h-6 w-6 shrink-0 object-contain md:mt-0.5 md:h-7 md:w-7"
                        transition={{
                          type: "spring",
                          stiffness: 360,
                          damping: 34,
                        }}
                      />
                    ) : (
                      <span className="mt-1 h-6 w-6 shrink-0 md:mt-0.5 md:h-7 md:w-7" aria-hidden />
                    )}
                    <div className="min-w-0 flex-1">
                      <div
                        className={`font-newsreader text-[1.85rem] leading-[1.05] sm:text-[1.95rem] md:text-[28px] ${
                          active ? "text-(--color-text)" : "text-(--color-text-tertiary)"
                        }`}
                      >
                        {t(`usecases.category.${key}`)}
                      </div>
                      {active ? (
                        <p
                          key={`${key}-desc`}
                          className="font-inter mt-2 pr-1 leading-[1.55] text-(--color-text-tertiary) text-sm"
                        >
                          {activeDescription}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-t-xl bg-[#f7a157] px-4 pt-4 shadow-[0_10px_24px_rgba(109,63,27,0.14)] sm:px-6 sm:pt-6 md:rounded-none md:px-10 md:pt-10">
            <img
              src="/copaw-console.png"
              alt="CoPaw console preview"
              className="block h-55 w-full rounded-t-xl object-cover object-top shadow-[0px_6px_56px_0px_rgba(38,33,29,0.24)] sm:h-75 md:h-full md:rounded-t-2xl"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
