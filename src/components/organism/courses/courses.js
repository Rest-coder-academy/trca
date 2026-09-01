// `courseId` is the stable slug the enrolment endpoints key on (must match the
// server price map in shared/enroll.js for paid courses). `slug` is the
// frontend route slug for this course's page (/courses/:slug) — independent
// of courseId, no need to match it. `paid: true` routes "Enroll Now" through
// Razorpay checkout; otherwise it opens the free "register interest" form.
// For the "Next batch" tag to show, a batch added in /admin/batches must use
// the EXACT same `name`.
export let courses = [
  {
    id: "0",
    courseId: "fde",
    slug: "forward-deployed-engineering",
    name: "Forward Deployed Engineering",
    badge: "FDE · New",
    audience:
      "Become an engineer who ships in production — the program a former Head of Engineering used to train his own team.",
    paid: true,
    price: 50000,
    trainer: "Nikshep Kulli",
    syllabus1: [
      "Engineer's foundations — Git, PRs, code review",
      "Full-stack build — React/Next.js, APIs, Postgres",
      "Ship it — AWS/Cloudflare, staging vs prod, IaC",
      "CI/CD & testing — pipelines, gated deploys",
    ],
    syllabus2: [
      "Real integrations — payments, webhooks, APIs",
      "AI-assisted engineering",
      "Production ownership — monitoring, data integrity",
      "Capstone — build & deploy a real product",
    ],
  },
  {
    id: "1",
    courseId: "java-fs",
    slug: "java-full-stack",
    name: "Java Full Stack",
    audience: "For Freshers & Working Professionals",
    paid: false,
    backend: ["Core Java", "Advance Java", "Springs", "Hibernate", "Microservices", "Rest Api"],
    frontend: ["HTML", "CSS", "Javascript", "Tailwind CSS", "", "", ""],
  },
  {
    id: "2",
    courseId: "python-fs",
    slug: "python-full-stack",
    name: "Python Full Stack",
    audience: "For Freshers & Working Professionals",
    paid: false,
    backend: ["Python", "Advance Python", "Django", "Microservices", "Rest Api"],
    frontend: ["HTML", "CSS", "Javascript", "Tailwind CSS", "", "", ""],
  },
  {
    id: "3",
    courseId: "mern",
    slug: "mern-stack",
    name: "MERN Stack",
    audience: "For Freshers & Working Professionals",
    paid: false,
    backend: ["MongoDB", "ExpressJs", "NodeJs", "Microservices", "Rest Api"],
    frontend: ["HTML", "CSS", "Javascript", "Typescript", "Tailwind CSS", "Reactjs", "Nextjs"],
  },
];
