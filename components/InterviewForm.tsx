"use client";

import { FormEvent, useState } from "react";
import { BriefcaseBusiness, ChevronDown, Code2, Layers3, LoaderCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const interviewLevels = ["Intern", "Junior", "Mid", "Senior"] as const;
const interviewTypes = ["Technical", "HR", "Behavioral", "Mixed", "Project Discussion", "Resume Deep Dive"] as const;
const companies = ["General", "Google", "Amazon", "Microsoft", "Meta", "Netflix", "Apple", "Adobe", "Oracle", "Atlassian", "Uber", "Airbnb", "Flipkart", "TCS", "Infosys", "Accenture"] as const;

export default function InterviewForm() {
  const router = useRouter();
  const [role, setRole] = useState("");
  const [level, setLevel] = useState<(typeof interviewLevels)[number]>("Junior");
  const [techstack, setTechstack] = useState("");
  const [type, setType] = useState<(typeof interviewTypes)[number]>("Technical");
  const [company, setCompany] = useState<(typeof companies)[number]>("General");
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);

  const generateInterview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!role.trim() || !techstack.trim()) {
      toast.error("Enter both a job role and technology stack.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, level, techstack, type, amount, company }),
      });

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          response.status === 401
            ? "Your session has expired. Please sign in again."
            : "The interview service is temporarily unavailable. Please try again."
        );
      }

      const data: { success: boolean; interviewId?: string; error?: string } = await response.json();

      if (!response.ok || !data.success || !data.interviewId) {
        throw new Error(data.error || "Failed to generate interview.");
      }

      router.push(`/interview/${data.interviewId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate interview.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="relative overflow-hidden rounded-[28px] border border-primary-100/15 bg-dark-300/55 p-1 shadow-2xl shadow-dark-100/40 backdrop-blur-xl"
      onSubmit={generateInterview}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-primary-200/10 to-transparent" />

      <div className="relative rounded-[24px] border border-white/5 bg-dark-100/65 p-5 sm:p-8 lg:p-10">
        <div className="mb-8 flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-200 text-dark-100 shadow-lg shadow-primary-200/20">
              <Sparkles size={21} aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">Interview blueprint</h2>
              <p className="mt-1 text-sm text-light-400">Personalize the focus, then let PrepWise create your questions.</p>
            </div>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1.5 text-xs font-medium text-primary-100">
            <span className="size-1.5 rounded-full bg-success-100 shadow-[0_0_10px_3px_rgba(73,222,80,0.35)]" />
            AI tailored
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="group flex flex-col gap-2.5 md:col-span-2" htmlFor="role">
            <span className="flex items-center gap-2 text-sm font-medium text-primary-100"><BriefcaseBusiness size={16} aria-hidden="true" /> Target role</span>
            <input id="role" className="h-13 w-full rounded-2xl border border-white/10 bg-dark-200/80 px-4 text-white outline-none transition placeholder:text-light-600 hover:border-primary-100/30 focus:border-primary-200 focus:ring-4 focus:ring-primary-200/10" value={role} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Frontend Developer" required />
          </label>

          <label className="flex flex-col gap-2.5" htmlFor="level">
            <span className="flex items-center gap-2 text-sm font-medium text-primary-100"><Layers3 size={16} aria-hidden="true" /> Experience level</span>
            <span className="relative">
              <select id="level" className="h-13 w-full appearance-none rounded-2xl border border-white/10 bg-dark-200/80 px-4 pr-10 text-white outline-none transition hover:border-primary-100/30 focus:border-primary-200 focus:ring-4 focus:ring-primary-200/10" value={level} onChange={(event) => setLevel(event.target.value as typeof level)}>
                {interviewLevels.map((option) => <option key={option}>{option}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-light-400" size={18} aria-hidden="true" />
            </span>
          </label>

          <label className="flex flex-col gap-2.5" htmlFor="type">
            <span className="flex items-center gap-2 text-sm font-medium text-primary-100"><Sparkles size={16} aria-hidden="true" /> Interview style</span>
            <span className="relative">
              <select id="type" className="h-13 w-full appearance-none rounded-2xl border border-white/10 bg-dark-200/80 px-4 pr-10 text-white outline-none transition hover:border-primary-100/30 focus:border-primary-200 focus:ring-4 focus:ring-primary-200/10" value={type} onChange={(event) => setType(event.target.value as typeof type)}>
                {interviewTypes.map((option) => <option key={option}>{option}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-light-400" size={18} aria-hidden="true" />
            </span>
          </label>

          <label className="flex flex-col gap-2.5" htmlFor="company">
            <span className="flex items-center gap-2 text-sm font-medium text-primary-100"><BriefcaseBusiness size={16} aria-hidden="true" /> Company mode</span>
            <span className="relative">
              <select id="company" className="h-13 w-full appearance-none rounded-2xl border border-white/10 bg-dark-200/80 px-4 pr-10 text-white outline-none transition hover:border-primary-100/30 focus:border-primary-200 focus:ring-4 focus:ring-primary-200/10" value={company} onChange={(event) => setCompany(event.target.value as typeof company)}>
                {companies.map((option) => <option key={option}>{option}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-light-400" size={18} aria-hidden="true" />
            </span>
            <span className="text-xs text-light-400">Applies company-specific interview behavior and question patterns.</span>
          </label>

          <label className="flex flex-col gap-2.5 md:col-span-2" htmlFor="techstack">
            <span className="flex items-center gap-2 text-sm font-medium text-primary-100"><Code2 size={16} aria-hidden="true" /> Technologies to cover</span>
            <input id="techstack" className="h-13 w-full rounded-2xl border border-white/10 bg-dark-200/80 px-4 text-white outline-none transition placeholder:text-light-600 hover:border-primary-100/30 focus:border-primary-200 focus:ring-4 focus:ring-primary-200/10" value={techstack} onChange={(event) => setTechstack(event.target.value)} placeholder="React, Next.js, Firebase" required />
            <span className="text-xs text-light-400">Separate technologies with commas so your questions stay focused.</span>
          </label>

          <fieldset className="md:col-span-2">
            <legend className="mb-3 text-sm font-medium text-primary-100">How many questions?</legend>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {[5, 10, 15, 20].map((option) => (
                <button key={option} type="button" onClick={() => setAmount(option)} className={`rounded-2xl border px-3 py-3 text-sm font-semibold transition ${amount === option ? "border-primary-200 bg-primary-200 text-dark-100 shadow-lg shadow-primary-200/20" : "border-white/10 bg-dark-200/70 text-light-100 hover:border-primary-100/35 hover:bg-dark-200"}`} aria-pressed={amount === option}>
                  {option} questions
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="mt-9 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-6 text-light-400">Questions are generated specifically for your selected role, experience, and tools.</p>
          <button type="submit" disabled={loading} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-primary-200 px-6 font-bold text-dark-100 transition hover:bg-primary-100 focus:outline-none focus:ring-4 focus:ring-primary-200/25 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? <><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Crafting interview…</> : <><Sparkles size={18} aria-hidden="true" /> Generate interview</>}
          </button>
        </div>
      </div>
    </form>
  );
}
