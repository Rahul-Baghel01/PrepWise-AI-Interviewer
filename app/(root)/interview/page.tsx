import InterviewForm from "@/components/InterviewForm";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <h2>Please sign in to generate an interview.</h2>
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-10 pb-8 sm:gap-12">
      <header className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1.5 text-sm font-medium text-primary-100">
          <span aria-hidden="true">✦</span>
          Your next best interview starts here
        </div>
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Build an interview that feels <span className="bg-gradient-to-r from-primary-100 via-primary-200 to-light-100 bg-clip-text text-transparent">made for you.</span>
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-light-400 sm:text-lg">
          Give PrepWise a little context and get a focused, practical interview in seconds.
        </p>
      </header>

      <InterviewForm />
    </section>
  );
};

export default Page;
