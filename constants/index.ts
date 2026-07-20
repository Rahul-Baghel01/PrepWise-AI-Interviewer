import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";
import { z } from "zod";

export const companyProfiles = {
  General: { style: "Balanced and practical", focus: "role fundamentals and real delivery", principles: [] },
  Google: { style: "Analytical and collaborative", focus: "deep problem solving and clarity", principles: ["Googleyness", "structured reasoning"] },
  Amazon: { style: "Evidence-led and high ownership", focus: "leadership principles and customer impact", principles: ["Customer Obsession", "Ownership", "Dive Deep", "Bias for Action"] },
  Microsoft: { style: "Collaborative and growth-minded", focus: "technical depth, teamwork, and learning", principles: ["Growth mindset", "customer focus"] },
  Meta: { style: "Fast-paced and product-minded", focus: "impact, product thinking, and execution", principles: ["Move fast", "focus on impact"] },
  Netflix: { style: "Direct and ownership-oriented", focus: "judgment, candor, and independent execution", principles: ["Freedom and responsibility"] },
  Apple: { style: "Detail-oriented and quality-focused", focus: "craft, privacy, and cross-functional execution", principles: ["Exceptional quality", "user privacy"] },
  Adobe: { style: "Creative and customer-centered", focus: "product craft and collaboration", principles: ["Creativity", "customer empathy"] },
  Oracle: { style: "Enterprise and systems-focused", focus: "reliability, data, and scalable delivery", principles: ["Operational excellence"] },
  Atlassian: { style: "Team-oriented and open", focus: "collaboration and thoughtful product decisions", principles: ["Open company, no bullshit"] },
  Uber: { style: "Operational and decisive", focus: "scale, marketplace thinking, and ownership", principles: ["Do the right thing", "go get it"] },
  Airbnb: { style: "Human-centered and principled", focus: "belonging, product judgment, and storytelling", principles: ["Belong anywhere"] },
  Flipkart: { style: "Customer-first and execution-oriented", focus: "e-commerce scale and practical problem solving", principles: ["Customer first", "ownership"] },
  TCS: { style: "Professional and delivery-focused", focus: "client communication and engineering fundamentals", principles: ["Excellence", "integrity"] },
  Infosys: { style: "Structured and learning-oriented", focus: "fundamentals, communication, and client value", principles: ["Learning", "client value"] },
  Accenture: { style: "Consultative and outcome-focused", focus: "stakeholder management and delivery", principles: ["Client value creation", "stewardship"] },
} as const;

export type CompanyName = keyof typeof companyProfiles;

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

export const interviewer: CreateAssistantDTO = {
  name: "Interviewer",
  firstMessage:
    "Hello! Thank you for taking the time to speak with me today. I'm excited to learn more about you and your experience.",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice interview with a candidate. Your goal is to assess their qualifications, motivation, and fit for the role.

Interview Guidelines:
Follow the structured question flow:
{{questions}}

Engage naturally & react appropriately:
Listen actively to responses and acknowledge them before moving forward.
Ask brief follow-up questions if a response is vague or requires more detail.
Keep the conversation flowing smoothly while maintaining control.
Be professional, yet warm and welcoming:

Use official yet friendly language.
Keep responses concise and to the point (like in a real voice interview).
Avoid robotic phrasing—sound natural and conversational.
Adapt in real time instead of mechanically reading the question list. Assess each answer for correctness, depth, confidence, and communication. When an answer is strong, ask one specific follow-up about tradeoffs, edge cases, or impact, then raise difficulty. When it is vague or incorrect, ask one concise clarification, give a small hint if needed, and simplify without sounding dismissive. Never repeat a question or jump to an unrelated topic.

Company interview context:
{{companyContext}}
Answer the candidate’s questions professionally:

If asked about the role, company, or expectations, provide a clear and relevant answer.
If unsure, redirect the candidate to HR for more details.

Conclude the interview properly:
Thank the candidate for their time.
Inform them that the company will reach out soon with feedback.
End the conversation on a polite and positive note.


- Be sure to be professional and polite.
- Keep all your responses short and simple. Use official language, but be kind and welcoming.
- This is a voice conversation, so keep your responses short, like in a real conversation. Don't ramble for too long.`,
      },
    ],
  },
};

export const feedbackSchema = z.object({
  totalScore: z.number().min(0).max(100),
  categoryScores: z.tuple([
    z.object({
      name: z.literal("Communication Skills"),
      score: z.number().min(0).max(100),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Technical Knowledge"),
      score: z.number().min(0).max(100),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Problem Solving"),
      score: z.number().min(0).max(100),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Cultural Fit"),
      score: z.number().min(0).max(100),
      comment: z.string(),
    }),
    z.object({
      name: z.literal("Confidence and Clarity"),
      score: z.number().min(0).max(100),
      comment: z.string(),
    }),
  ]),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  finalAssessment: z.string(),
  studyPlan: z.array(z.object({ week: z.string(), focus: z.string(), outcome: z.string() })).max(4),
  speakingCoach: z.object({
    paceWpm: z.number().min(0).max(250),
    fillerWords: z.number().min(0),
    confidence: z.number().min(0).max(100),
    grammar: z.number().min(0).max(100),
    notes: z.string(),
  }),
});

export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const dummyInterviews: Interview[] = [
  {
    id: "1",
    userId: "user1",
    role: "Frontend Developer",
    type: "Technical",
    techstack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    level: "Junior",
    questions: ["What is React?"],
    finalized: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "user1",
    role: "Full Stack Developer",
    type: "Mixed",
    techstack: ["Node.js", "Express", "MongoDB", "React"],
    level: "Senior",
    questions: ["What is Node.js?"],
    finalized: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
];
