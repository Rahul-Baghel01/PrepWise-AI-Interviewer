import ResumeUploadFlow from "@/components/ResumeUploadFlow";
import { getCurrentUser } from "@/lib/actions/auth.action";

export const dynamic = "force-dynamic";

const ResumePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center text-light-400">
        Please sign in to upload a resume.
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 pb-8">
      <header className="flex flex-col gap-3 text-center sm:text-left">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1.5 text-sm font-medium text-primary-100">
          <span aria-hidden="true">✦</span>
          Resume-based interview generation
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">Upload your résumé and generate a tailored interview.</h1>
        <p className="max-w-3xl text-base leading-7 text-light-400 sm:text-lg">
          PrepWise reads your experience, extracts the details that matter, and builds questions around the work you have actually done.
        </p>
      </header>

      <ResumeUploadFlow userId={user.id} />
    </section>
  );
};

export default ResumePage;
