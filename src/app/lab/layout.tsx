import { LabShell } from "@/components/lab/LabShell";
import type { Metadata } from "next";

// 導線のない試作画面。検索エンジンには載せない
export const metadata: Metadata = {
  title: "Lab | Pokemon Sleep Cooking Planner",
  robots: { index: false, follow: false },
};

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return <LabShell>{children}</LabShell>;
}
