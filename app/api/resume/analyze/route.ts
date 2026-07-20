import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";
import { RESUME_MAX_SIZE_BYTES } from "@/lib/resume-config";
import { analyzeResumeText, extractResumeText, generateResumeInterviewQuestions, saveUploadedResume, sanitizeResumeText } from "@/lib/resume";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await db.collection("resumeAnalysis").where("userId", "==", user.id).get();
  const latestDocument = snapshot.docs
    .map((document) => ({ id: document.id, ...(document.data() as Record<string, unknown>) }))
    .sort((left, right) => String((right as { uploadedAt?: string }).uploadedAt ?? "").localeCompare(String((left as { uploadedAt?: string }).uploadedAt ?? "")))[0];

  return Response.json({ success: true, resume: latestDocument ?? null });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file || typeof file !== "object" || typeof (file as File).arrayBuffer !== "function") {
      return Response.json({ success: false, error: "Please attach a PDF resume." }, { status: 400 });
    }

    const resumeFile = file as File;
    const isPdf =
      resumeFile.type === "application/pdf" ||
      resumeFile.name?.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return Response.json({ success: false, error: "Only PDF resumes are supported." }, { status: 400 });
    }

    if (resumeFile.size > RESUME_MAX_SIZE_BYTES) {
      return Response.json({ success: false, error: "Resume must be 10 MB or smaller." }, { status: 400 });
    }

    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const extractedText = sanitizeResumeText(await extractResumeText(buffer));
    const analysis = await analyzeResumeText(extractedText);
    const questions = await generateResumeInterviewQuestions(analysis, {
      amount: 6,
      type: "Technical",
      difficulty: "Medium",
    });
    const resumeUrl = await saveUploadedResume(buffer, user.id);

    const document = await db.collection("resumeAnalysis").add({
      userId: user.id,
      resumeUrl,
      extractedText,
      analysis,
      uploadedAt: new Date().toISOString(),
    });

    return Response.json({ success: true, analysis, questions, resumeUrl, documentId: document.id });
  } catch (error) {
    console.error("Resume analysis failed", error);
    return Response.json({ success: false, error: "Unable to analyze the resume right now." }, { status: 500 });
  }
}
