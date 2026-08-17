export const PROFILE_LIMITS = {
  firstNameMin: 2,
  firstNameMax: 50,
  lastNameMin: 2,
  lastNameMax: 50,
  titleMax: 100,
  bioMax: 500,
  skillMax: 50,
  maxSkills: 20,
} as const;

export const RECOMMENDED_SKILLS: { category: string; skills: string[] }[] = [
  {
    category: "Frontend",
    skills: ["React", "Vue.js", "Angular", "Next.js", "TypeScript", "Tailwind CSS", "HTML/CSS", "JavaScript"],
  },
  {
    category: "Backend",
    skills: ["Node.js", "Python", "Java", "C#", "Go", "PHP", "Ruby", "REST APIs", "GraphQL"],
  },
  {
    category: "Database",
    skills: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Prisma", "SQL", "Firebase"],
  },
  {
    category: "DevOps & Cloud",
    skills: ["Docker", "Kubernetes", "AWS", "Azure", "GCP", "CI/CD", "GitHub Actions", "Terraform", "Linux"],
  },
  {
    category: "Mobile",
    skills: ["React Native", "Flutter", "Swift", "Kotlin", "Android", "iOS"],
  },
  {
    category: "AI & Data",
    skills: ["Machine Learning", "Python (Data Science)", "TensorFlow", "PyTorch", "SQL Analytics", "Power BI", "Tableau"],
  },
  {
    category: "Design & UX",
    skills: ["UI/UX Design", "Figma", "Adobe XD", "Sketch", "Prototyping", "User Research", "Wireframing", "Graphic Design"],
  },
  {
    category: "Project Management",
    skills: ["Scrum", "Agile", "Kanban", "Jira", "Product Management", "Roadmapping", "Stakeholder Management"],
  },
  {
    category: "Soft Skills",
    skills: ["Leadership", "Communication", "Problem Solving", "Teamwork", "Critical Thinking", "Time Management", "Mentoring", "Presentation"],
  },
  {
    category: "Security",
    skills: ["Cybersecurity", "Penetration Testing", "OWASP", "Authentication", "Encryption", "Network Security"],
  },
];

export const AVATAR_LIMITS = {
  /** Maximum avatar file size in bytes (5 MB). */
  maxFileSize: 5 * 1024 * 1024,
  /** Allowed MIME types for avatar uploads. */
  acceptedTypes: ["image/jpeg", "image/png", "image/webp"] as const,
} as const;
