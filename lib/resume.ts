import { mkdir, writeFile } from "fs/promises";
import path from "path";

import OpenAI from "openai";
import pdf from "pdf-parse";

const fallbackTopics = ["React", "Node.js", "TypeScript", "Firebase", "Next.js", "AWS", "Docker", "SQL", "REST APIs"];

export async function extractResumeText(buffer: Buffer) {
  try {
    const data = await pdf(buffer);
    return sanitizeResumeText(data.text || "");
  } catch (error) {
    console.error("Resume text extraction failed", error);
    return "";
  }
}

export function sanitizeResumeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[\u0000-\u001f]/g, "")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((line, index, lines) => line !== lines[index - 1])
    .filter((line) => !/^page\s*\d+([\s/\-]+\d+)?$/i.test(line))
    .filter((line) => !/^(copyright|confidential|resume)$/i.test(line))
    .join("\n");
}

export async function saveUploadedResume(buffer: Buffer, userId: string) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `resume-${userId}-${Date.now()}.pdf`;
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}

function normalizeAnalysis(analysis: Partial<ResumeAnalysis>): ResumeAnalysis {
  return {
    name: analysis.name || "",
    summary: analysis.summary || "",
    skills: analysis.skills || [],
    languages: analysis.languages || [],
    frameworks: analysis.frameworks || [],
    databases: analysis.databases || [],
    cloud: analysis.cloud || [],
    tools: analysis.tools || [],
    experience: analysis.experience || [],
    projects: analysis.projects || [],
    education: analysis.education || [],
    certifications: analysis.certifications || [],
    achievements: analysis.achievements || [],
    strengths: analysis.strengths || [],
  };
}

function buildFallbackAnalysis(resumeText: string): ResumeAnalysis {
  const lowerText = resumeText.toLowerCase();
  const detectedSkills = fallbackTopics.filter((topic) => lowerText.includes(topic.toLowerCase()));

  return normalizeAnalysis({
    name: "",
    summary: "Resume review completed using the extracted content and keyword matching.",
    skills: detectedSkills.length > 0 ? detectedSkills : ["Problem solving", "Communication"],
    languages: lowerText.includes("typescript") || lowerText.includes("javascript") ? ["TypeScript", "JavaScript"] : ["TypeScript"],
    frameworks: lowerText.includes("react") ? ["React"] : ["Next.js"],
    databases: lowerText.includes("firebase") ? ["Firestore"] : ["SQL"],
    cloud: lowerText.includes("aws") ? ["AWS"] : [],
    tools: lowerText.includes("docker") ? ["Docker"] : ["Git"],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    strengths: ["Adaptability", "Practical delivery"],
  });
}

export async function analyzeResumeText(resumeText: string): Promise<ResumeAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackAnalysis(resumeText);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a senior recruiting analyst. Read the resume and return ONLY valid JSON matching the requested schema. Keep lists concise and factual. Use empty strings or arrays when information is not present.`,
        },
        {
          role: "user",
          content: `Analyze this resume. Return ONLY valid JSON with this structure:\n{\n  "name":"",\n  "summary":"",\n  "skills":[],\n  "languages":[],\n  "frameworks":[],\n  "databases":[],\n  "cloud":[],\n  "tools":[],\n  "experience":[{\"company\":\"\",\"role\":\"\",\"duration\":\"\",\"description\":\"\"}],\n  "projects":[{\"name\":\"\",\"techStack\":[],\"description\":\"\"}],\n  "education":[{\"degree\":\"\",\"college\":\"\",\"year\":\"\"}],\n  "certifications":[],\n  "achievements":[],\n  "strengths":[]\n}\n\nResume text:\n${resumeText}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const payload = JSON.parse(content);
    return normalizeAnalysis(payload);
  } catch {
    return buildFallbackAnalysis(resumeText);
  }
}

export async function generateResumeInterviewQuestions(analysis: ResumeAnalysis, options: { amount: number; type: string; difficulty: string }) {
  const prompt = buildResumeInterviewPrompt(analysis, options);

  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackQuestions(analysis, options.amount);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are a senior technical interviewer. Create only resume-specific questions and avoid generic interview questions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";
    return content
      .split(/\n+/)
      .map((item) => item.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, options.amount);
  } catch {
    return buildFallbackQuestions(analysis, options.amount);
  }
}

function buildResumeInterviewPrompt(analysis: ResumeAnalysis, options: { amount: number; type: string; difficulty: string }) {
  const skillSummary = [analysis.skills, analysis.languages, analysis.frameworks, analysis.databases, analysis.tools]
    .flat()
    .slice(0, 10)
    .join(", ");

  const projectSummary = analysis.projects
    .slice(0, 3)
    .map((project) => `${project.name}: ${project.description}`)
    .join(" | ");

  return `You are a Senior Technical Interviewer. Ask only resume-specific questions for this candidate. Do not ask unrelated questions. Refer to their experience naturally, and increase the difficulty gradually from easy to hard. Do not repeat topics. Include brief follow-up prompts where relevant. Interview type: ${options.type}. Difficulty: ${options.difficulty}. Candidate skills: ${skillSummary || "general software delivery"}. Candidate projects: ${projectSummary || "professional experience"}. Return exactly ${options.amount} questions, one per line, without numbering or bullets.`;
}

function buildFallbackQuestions(analysis: ResumeAnalysis, amount: number) {
  const templates = [
    `I noticed your resume highlights ${analysis.skills[0] || "your core skills"}. Walk me through how you applied that in practice.`,
    `Tell me about one project where you used ${analysis.frameworks[0] || analysis.tools[0] || "modern tooling"}. What tradeoffs did you make?`,
    `Explain how you approached architecture or collaboration in your recent work.`,
    `Describe a challenge that came up in your project and how you resolved it.`,
    `What would you improve in your current approach if you had more time?`,
  ];

  return Array.from({ length: amount }, (_, index) => templates[index % templates.length]).slice(0, amount);
}

export function buildResumeContext(analysis: ResumeAnalysis | null | undefined) {
  if (!analysis) return "No resume details provided.";

  return [
    `Candidate: ${analysis.name || "Resume-based candidate"}`,
    `Summary: ${analysis.summary || "Resume analysis available"}`,
    `Skills: ${analysis.skills.join(", ") || "General engineering"}`,
    `Projects: ${analysis.projects.map((project) => project.name).join(", ") || "Recent work"}`,
    `Experience: ${analysis.experience.map((item) => `${item.role} at ${item.company}`).join("; ") || "Professional background available"}`,
    `Achievements: ${analysis.achievements.join("; ") || "Not specified"}`,
  ].join("\n");
}
