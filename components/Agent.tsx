"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AudioLines, LoaderCircle, Mic, PhoneOff, Sparkles, Volume2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const Agent = ({ userName, userId, interviewId, feedbackId, questions, company, companyProfile }: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isCreatingFeedback, setIsCreatingFeedback] = useState(false);
  const feedbackStarted = useRef(false);

  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const role = message.role === "assistant" ? "assistant" : "user";
        setMessages((currentMessages) => [...currentMessages, { role, content: message.transcript }]);
      }
    };
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    const onError = () => {
      setCallStatus(CallStatus.INACTIVE);
      setIsCreatingFeedback(false);
      toast.error("The interview call could not be started.");
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (callStatus !== CallStatus.FINISHED || feedbackStarted.current) return;

    if (!interviewId || !userId || messages.length === 0) {
      toast.error("No interview transcript was captured.");
      setCallStatus(CallStatus.INACTIVE);
      return;
    }

    feedbackStarted.current = true;
    setIsCreatingFeedback(true);
    void createFeedback({ interviewId, transcript: messages, feedbackId }).then((result) => {
      if (result.success) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        feedbackStarted.current = false;
        setIsCreatingFeedback(false);
        setCallStatus(CallStatus.INACTIVE);
        toast.error("Feedback could not be generated. Please try ending the call again.");
      }
    });
  }, [callStatus, feedbackId, interviewId, messages, router, userId]);

  const handleCall = async () => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    if (!assistantId) {
      toast.error("Vapi is not configured.");
      return;
    }

    feedbackStarted.current = false;
    setMessages([]);
    setIsCreatingFeedback(false);
    setCallStatus(CallStatus.CONNECTING);

    try {
      await vapi.start(assistantId, {
        variableValues: {
          questions: (questions ?? []).map((question) => `- ${question}`).join("\n"),
          companyContext: `${company || "General"}: ${companyProfile?.style || "Balanced and practical"}. Focus on ${companyProfile?.focus || "role fundamentals"}. Principles: ${companyProfile?.principles?.join(", ") || "none"}.`,
        },
      });
    } catch {
      setCallStatus(CallStatus.INACTIVE);
      toast.error("The interview call could not be started.");
    }
  };

  const handleDisconnect = () => vapi.stop();
  const status = isCreatingFeedback
    ? "Generating your feedback…"
    : callStatus === CallStatus.CONNECTING
      ? "Connecting to your interviewer…"
      : isSpeaking
        ? "Your interviewer is speaking"
        : callStatus === CallStatus.ACTIVE
          ? "Listening to your answer"
          : "Ready when you are";
  const recentMessages = messages.slice(-3);

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-primary-100/15 bg-dark-300/60 p-1 shadow-2xl shadow-dark-100/40 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(202,197,254,0.14),transparent_42%)]" />
      <div className="relative rounded-[24px] border border-white/5 bg-dark-100/70 px-4 py-7 sm:px-8 sm:py-10">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary-100">
            <span className={cn("size-1.5 rounded-full", callStatus === CallStatus.ACTIVE ? "bg-success-100 shadow-[0_0_10px_3px_rgba(73,222,80,0.35)]" : "bg-primary-200")} />
            LIVE AI INTERVIEW
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Your practice room</h2>
          <p className="mt-2 text-sm text-light-400">{company && company !== "General" ? `${company} interview mode adapts to your answers in real time.` : "Stay present. Your transcript and feedback are handled for you."}</p>
        </div>

        <div className="mx-auto mt-9 grid max-w-4xl gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="rounded-3xl border border-primary-200/20 bg-gradient-to-b from-[#171532] to-[#08090D] p-6 text-center shadow-lg shadow-primary-200/5">
            <div className="relative mx-auto flex size-28 items-center justify-center">
              {isSpeaking && <><span className="absolute inset-0 animate-ping rounded-full border border-primary-200/50" /><span className="absolute -inset-3 animate-pulse rounded-full border border-primary-200/20" /></>}
              <div className="relative flex size-22 items-center justify-center rounded-full bg-gradient-to-l from-white to-primary-200 shadow-xl shadow-primary-200/20">
                <Image src="/ai-avatar.png" alt="AI interviewer" width={65} height={54} className="object-cover" priority />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-center gap-2"><Volume2 size={16} className="text-primary-200" aria-hidden="true" /><h3 className="text-lg font-semibold text-white">AI Interviewer</h3></div>
            <p className="mt-1 text-sm text-light-400">Guiding your session</p>
          </div>

          <div className="flex items-center justify-center" aria-hidden="true">
            <div className="flex h-18 items-center gap-1.5 rounded-full border border-white/10 bg-dark-200/80 px-5">
              {[20, 34, 52, 32, 60, 42, 24].map((height, index) => (
                <span key={height} className={cn("w-1.5 rounded-full bg-primary-200 transition-all duration-300", (isSpeaking || callStatus === CallStatus.ACTIVE) ? "animate-pulse" : "opacity-35")} style={{ height: `${height}%`, animationDelay: `${index * 90}ms` }} />
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-dark-200/55 p-6 text-center">
            <div className="relative mx-auto flex size-28 items-center justify-center rounded-full border border-white/10 bg-dark-100">
              <Image src="/user-avatar.png" alt={`${userName}'s profile`} width={539} height={539} className="size-22 rounded-full object-cover" />
              {callStatus === CallStatus.ACTIVE && !isSpeaking && <span className="absolute -bottom-1 -right-1 flex size-8 items-center justify-center rounded-full border-4 border-dark-200 bg-success-100 text-dark-100"><Mic size={14} aria-hidden="true" /></span>}
            </div>
            <h3 className="mt-5 text-lg font-semibold text-white">{userName}</h3>
            <p className="mt-1 text-sm text-light-400">Candidate</p>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-3" aria-live="polite">
          <div className="flex items-center gap-2 text-sm font-medium text-primary-100">
            {(callStatus === CallStatus.CONNECTING || isCreatingFeedback) ? <LoaderCircle className="animate-spin" size={17} aria-hidden="true" /> : <AudioLines size={17} aria-hidden="true" />}
            {status}
          </div>
          <p className="text-center text-sm text-light-400">{questions?.length ?? 0} tailored questions are ready for this session.</p>
        </div>

        <div className="mx-auto mt-8 max-w-3xl rounded-3xl border border-white/10 bg-dark-200/45 p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-primary-100">Live transcript</h3><span className="text-xs text-light-400">Updates as you speak</span></div>
          {recentMessages.length > 0 ? (
            <div className="space-y-3" aria-live="polite">
              {recentMessages.map((message, index) => (
                <div key={`${message.content}-${index}`} className={cn("animate-in fade-in slide-in-from-bottom-1 rounded-2xl px-4 py-3 text-sm leading-6", message.role === "assistant" ? "bg-primary-200/10 text-primary-100" : "bg-dark-100/80 text-light-100")}>
                  <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-light-400">{message.role === "assistant" ? "AI" : "You"}</span>{message.content}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/10 px-4 text-center"><Sparkles size={18} className="text-primary-200" aria-hidden="true" /><p className="text-sm text-light-400">Your conversation will appear here when the call begins.</p></div>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          {callStatus !== CallStatus.ACTIVE ? (
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-200 px-6 font-bold text-dark-100 transition hover:bg-primary-100 focus:outline-none focus:ring-4 focus:ring-primary-200/25 disabled:cursor-not-allowed disabled:opacity-70" onClick={handleCall} disabled={callStatus === CallStatus.CONNECTING || isCreatingFeedback}>
              {callStatus === CallStatus.CONNECTING ? <><LoaderCircle className="animate-spin" size={18} aria-hidden="true" /> Connecting…</> : <><Mic size={18} aria-hidden="true" /> Start interview</>}
            </button>
          ) : (
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-destructive-100 px-6 font-bold text-white transition hover:bg-destructive-200 focus:outline-none focus:ring-4 focus:ring-destructive-100/25" onClick={handleDisconnect}>
              <PhoneOff size={18} aria-hidden="true" /> Finish interview
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default Agent;
