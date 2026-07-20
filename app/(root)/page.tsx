import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import FeaturedInterviewCard from "@/components/FeaturedInterviewCard";
import InterviewCard from "@/components/InterviewCard";
import { featuredInterviews } from "@/constants/featured-interviews";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [userInterviews, communityInterviews] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
  ]);
  const hasCommunityInterviews = communityInterviews.length > 0;
  const featuredSelection = [...featuredInterviews]
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">Practice real interview questions and get instant feedback.</p>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="btn-primary max-sm:w-full">
              <Link href="/interview">Create a custom interview</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 bg-dark-200/60 text-light-100 hover:bg-dark-200 max-sm:w-full">
              <Link href="/resume">Upload resume</Link>
            </Button>
          </div>
        </div>

        <Image src="/robot.png" alt="PrepWise AI assistant" width={400} height={400} className="max-sm:hidden" priority />
      </section>

      <section className="flex flex-col gap-6 mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><h2>Your Interviews</h2><p className="mt-2 text-light-400">Return to an interview or review your latest feedback.</p></div>
          {userInterviews.length > 0 && <span className="rounded-full border border-white/10 bg-dark-200 px-3 py-1 text-sm text-light-400">{userInterviews.length} created</span>}
        </div>

        <div className="interviews-section">
          {userInterviews.length > 0 ? userInterviews.map((interview) => (
            <InterviewCard key={interview.id} userId={user.id} interviewId={interview.id} role={interview.role} type={interview.type} techstack={interview.techstack} createdAt={interview.createdAt} coverImage={interview.coverImage} questionCount={interview.questions.length} />
          )) : (
            <div className="w-full rounded-3xl border border-dashed border-white/10 bg-dark-300/30 p-8 text-center"><p>You haven&apos;t created an interview yet. Pick a template below or build one from scratch.</p></div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2"><Sparkles size={20} className="text-primary-200" aria-hidden="true" /><h2>Take Interviews</h2></div>
            <p className="mt-2 text-light-400">{hasCommunityInterviews ? "Practice interviews shared by the PrepWise community." : "Fresh practice sessions, selected for you on every visit."}</p>
          </div>
          {!hasCommunityInterviews && <span className="rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1 text-sm font-medium text-primary-100">Featured library</span>}
        </div>

        <div className="interviews-section">
          {hasCommunityInterviews ? communityInterviews.map((interview) => (
            <InterviewCard key={interview.id} userId={user.id} interviewId={interview.id} role={interview.role} type={interview.type} techstack={interview.techstack} createdAt={interview.createdAt} coverImage={interview.coverImage} questionCount={interview.questions.length} />
          )) : featuredSelection.map((interview) => <FeaturedInterviewCard key={interview.id} interview={interview} />)}
        </div>
      </section>
    </>
  );
}

export default Home;
