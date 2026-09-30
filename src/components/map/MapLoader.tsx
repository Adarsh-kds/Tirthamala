"use client";
import dynamic from "next/dynamic";
import { t } from "@/lib/i18n";

const SiteMap = dynamic(() => import("./SiteMap"), {
  ssr: false,
  loading: () => (
    <div
      className="flex h-full min-h-[360px] items-center justify-center text-sm"
      style={{ color: "var(--text-soft)" }}
    >
      {t("map.loading")}
    </div>
  ),
});
export default SiteMap;
