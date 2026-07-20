"use client";

import Image from "next/image";
import { Clock3, LoaderCircle, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { FeaturedInterview } from "@/constants/featured-interviews";

const difficultyStyles = {
  Beginner: "border-success-100/30 bg-success-100/10 text-success-100",
  Intermediate: "border-primary-200/30 bg-primary-200/10 text-primary-100",
  Advanced: "border-destructive-100/30 bg-destructive-100/10 text-destructive-100",
};

const badgeStyles = {
  Featured: "bg-primary-200 text-dark-100",
  Trending: "bg-[#ffc857] text-dark-100",
  Popular: "bg-success-100 text-dark-100",
  New: "bg-light-600 text-primary-100",
};

export default function FeaturedInterviewCard({ interview }: { interview: FeaturedInterview }) {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const startInterview = async () => {
    setIsStarting(true);

    try {
      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: interview.role,
          level: interview.level,
          techstack: interview.techstack.join(", "),
          type: interview.type,
          amount: interview.questionCount,
        }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error("The interview service is temporarily unavailable. Please try again.");
      }

      const data: { success: boolean; interviewId?: string; error?: string } = await response.json();
      if (!response.ok || !data.success || !data.interviewId) {
        throw new Error(data.error || "Unable to start this interview.");
      }

      router.push(`/interview/${data.interviewId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start this interview.");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <article className="group relative flex min-h-[390px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-dark-300/60 p-1 shadow-xl shadow-dark-100/30 transition duration-300 hover:-translate-y-1 hover:border-primary-200/40 hover:shadow-primary-200/10">
      <div className="relative flex min-h-full flex-1 flex-col overflow-hidden rounded-[22px] bg-gradient-to-b from-[#1A1C20] to-[#08090D] p-5">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary-200/10 to-transparent" />
        <div className="relative flex items-start justify-between gap-3">
          <Image src={interview.coverImage} alt="" width={64} height={64} className="size-16 rounded-2xl border border-white/10 bg-dark-200 object-cover shadow-lg" />
          <div className="flex gap-2">
            <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${badgeStyles[interview.badge]}`}>{interview.badge}</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${difficultyStyles[interview.difficulty]}`}>{interview.difficulty}</span>
          </div>
        </div>

        <div className="relative mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-light-400">{interview.type} interview</p>
          <h3 className="mt-2 text-xl font-semibold text-white">{interview.title}</h3>
          <p className="mt-2 text-sm text-primary-100">{interview.role} · {interview.level}</p>
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-light-400">{interview.description}</p>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {interview.techstack.slice(0, 3).map((technology) => <span key={technology} className="rounded-full border border-white/10 bg-dark-200/70 px-2.5 py-1 text-xs text-light-100">{technology}</span>)}
        </div>

        <div className="relative mt-auto flex items-center justify-between border-t border-white/10 pt-5 text-sm text-light-400">
          <span className="inline-flex items-center gap-1.5"><Clock3 size={15} aria-hidden="true" /> {interview.estimatedDuration}</span>
          <span>{interview.questionCount} questions</span>
        </div>

        <button type="button" onClick={startInterview} disabled={isStarting} className="relative mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary-200 px-4 text-sm font-bold text-dark-100 transition hover:bg-primary-100 focus:outline-none focus:ring-4 focus:ring-primary-200/25 disabled:cursor-not-allowed disabled:opacity-70">
          {isStarting ? <><LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> Building your interview…</> : <><Play size={16} fill="currentColor" aria-hidden="true" /> Start interview</>}
        </button>
      </div>
    </article>
  );
}
