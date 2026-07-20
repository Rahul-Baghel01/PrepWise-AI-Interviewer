import dayjs from "dayjs";
import Image from "next/image";
import Link from "next/link";

import { Button } from "./ui/button";
import { getFeedbackByInterviewId } from "@/lib/actions/general.action";

const InterviewCard = async ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  coverImage,
  questionCount,
  estimatedDuration,
  difficulty,
}: InterviewCardProps) => {
  const feedback = userId && interviewId
    ? await getFeedbackByInterviewId({ interviewId, userId })
    : null;
  const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format("MMM D, YYYY");
  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  const count = questionCount ?? 10;
  const duration = estimatedDuration ?? `${Math.max(15, count * 2)} min`;

  return (
    <article className="group relative flex min-h-[370px] w-full max-w-[370px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-dark-300/60 p-1 shadow-xl shadow-dark-100/30 transition duration-300 hover:-translate-y-1 hover:border-primary-200/40 hover:shadow-primary-200/10 max-lg:max-w-none">
      <div className="relative flex min-h-full flex-1 flex-col overflow-hidden rounded-[22px] bg-gradient-to-b from-[#1A1C20] to-[#08090D] p-5">
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-primary-200/10 to-transparent" />
        <div className="relative flex items-start justify-between gap-3">
          <Image src={coverImage || "/covers/adobe.png"} alt="" width={64} height={64} className="size-16 rounded-2xl border border-white/10 bg-dark-200 object-cover shadow-lg" />
          <div className="flex flex-col items-end gap-2">
            <span className="rounded-full bg-light-600 px-2.5 py-1 text-xs font-semibold text-primary-100">{normalizedType}</span>
            {difficulty && <span className="rounded-full border border-primary-200/25 bg-primary-200/10 px-2.5 py-1 text-xs font-semibold text-primary-100">{difficulty}</span>}
          </div>
        </div>

        <div className="relative mt-5">
          <h3 className="text-xl font-semibold capitalize text-white">{role} Interview</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-light-400">{feedback?.finalAssessment || "A focused practice session tailored to build confidence for your next interview."}</p>
        </div>

        <div className="relative mt-5 flex flex-wrap gap-2">
          {techstack.slice(0, 3).map((technology) => <span key={technology} className="rounded-full border border-white/10 bg-dark-200/70 px-2.5 py-1 text-xs text-light-100">{technology}</span>)}
        </div>

        <div className="relative mt-auto grid grid-cols-2 gap-3 border-t border-white/10 pt-5 text-sm text-light-400">
          <div><p className="text-xs uppercase tracking-wider text-light-600">Questions</p><p className="mt-1 font-semibold text-light-100">{count}</p></div>
          <div><p className="text-xs uppercase tracking-wider text-light-600">Duration</p><p className="mt-1 font-semibold text-light-100">{duration}</p></div>
        </div>

        <div className="relative mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-light-400">{feedback ? `Feedback · ${formattedDate}` : formattedDate}</p>
          <Button asChild className="btn-primary !min-h-9 !px-4 !text-xs">
            <Link href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}>{feedback ? "Feedback" : "Open"}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
};

export default InterviewCard;
