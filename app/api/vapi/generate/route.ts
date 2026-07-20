import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";
import { cookies } from "next/headers";
import { z } from "zod";

import { auth, db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { companyProfiles, type CompanyName } from "@/constants";

const requestSchema = z.object({
  role: z.string().trim().min(2).max(100),
  level: z.enum(["Intern", "Junior", "Mid", "Senior"]),
  techstack: z.string().trim().min(2).max(500),
  type: z.enum(["Technical", "HR", "Behavioral", "Mixed", "Project Discussion", "Resume Deep Dive"]),
  amount: z.coerce.number().int().min(5).max(20),
  resumeContext: z.string().optional(),
  company: z.enum(["General", "Google", "Amazon", "Microsoft", "Meta", "Netflix", "Apple", "Adobe", "Oracle", "Atlassian", "Uber", "Airbnb", "Flipkart", "TCS", "Infosys", "Accenture"]).default("General"),
});

function questionSchema(amount: number) {
  return z.object({
    questions: z.array(z.string().trim().min(1)).length(amount),
  });
}

export async function POST(request: Request) {
  try {
    const payload = requestSchema.parse(await request.json());
    const session = (await cookies()).get("session")?.value;

    if (!session) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { uid } = await auth.verifySessionCookie(session, true);
    const techstack = payload.techstack
      .split(",")
      .map((technology) => technology.trim())
      .filter(Boolean);

    if (techstack.length === 0) {
      return Response.json(
        { success: false, error: "Provide at least one technology." },
        { status: 400 }
      );
    }

    const companyProfile = companyProfiles[payload.company as CompanyName];
    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: questionSchema(payload.amount),
      prompt: `Create exactly ${payload.amount} concise, practical ${payload.type} interview questions for a ${payload.level} ${payload.role}. The candidate's technology stack is ${techstack.join(", ")}. Interview company: ${payload.company}. Style: ${companyProfile.style}. Focus: ${companyProfile.focus}. Principles: ${companyProfile.principles.join(", ") || "none"}. ${payload.resumeContext ? `Use the following resume context to make the questions specific and personal: ${payload.resumeContext}` : ""} Order the seed questions from accessible to challenging. Return questions only. Do not include answers, introductions, numbering, or duplicate questions.`,
    });

    const interview = {
      role: payload.role,
      level: payload.level,
      type: payload.type,
      techstack,
      questions: object.questions,
      userId: uid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
      company: payload.company,
      companyProfile,
    };

    const document = await db.collection("interviews").add(interview);

    return Response.json({ success: true, interviewId: document.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { success: false, error: "Please provide valid interview details." },
        { status: 400 }
      );
    }

    return Response.json(
      { success: false, error: "Unable to generate the interview. Please try again." },
      { status: 500 }
    );
  }
}
