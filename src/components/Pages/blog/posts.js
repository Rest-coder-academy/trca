// Blog posts. Dependency-free: each post's `body` is an array of blocks
// ({ t: "p" | "h2" | "ul", c }) rendered by BlogPost.jsx — no markdown lib,
// prerender-safe. Add a new post by adding an object here (newest first).
export const posts = [
  {
    slug: "java-vs-python-full-stack",
    title: "Java vs Python for full-stack: which should you learn first?",
    description:
      "A straight answer for beginners choosing between a Java and a Python full-stack path — what each is good at, who hires for it, and how to decide.",
    date: "2026-09-02",
    author: "Rest Coder Academy",
    readMinutes: 5,
    body: [
      { t: "p", c: "If you're starting out, \"Java or Python?\" is usually the first wall you hit. The honest answer: both lead to jobs, and the language matters less than whether you can actually build and ship something. But they do pull toward different work, so here's how to choose without overthinking it." },
      { t: "h2", c: "What each is actually good at" },
      { t: "p", c: "Java is the workhorse of large, long-lived enterprise systems — banking, insurance, big product companies. It's strict, verbose, and that strictness is exactly why big teams like it: the compiler catches a lot before code ever runs. A Java full-stack path typically means Core & Advanced Java, Spring/Spring Boot, Hibernate, REST APIs, and a front end." },
      { t: "p", c: "Python is faster to write and reads almost like English, which is why it dominates data, scripting, automation, and AI, and is very strong for web too via Django. A Python full-stack path means Python, Django, REST APIs, and a modern front end. If you think you might drift toward data or AI later, Python gives you a head start." },
      { t: "h2", c: "Who's hiring for each" },
      { t: "p", c: "In most Indian cities, Java has the larger raw volume of openings — services companies and product teams run enormous Java codebases. Python roles are growing fast and skew toward startups, data, and AI-heavy teams. Neither is a dead end; both have healthy demand in 2026." },
      { t: "h2", c: "So how do you actually decide?" },
      { t: "ul", c: [
        "Want the widest set of openings and don't mind strictness? Start with Java.",
        "Prefer to move fast, or curious about data/AI down the line? Start with Python.",
        "Genuinely torn? Pick either. The concepts — APIs, databases, HTTP, a front end, deploying to production — carry across. Learning your second language later is a matter of weeks, not months.",
      ] },
      { t: "h2", c: "The thing that actually gets you hired" },
      { t: "p", c: "Whichever you pick, employers don't hire a language — they hire someone who has built and shipped real things. That's why our Java and Python full-stack courses are project-based and live: you build working software, not slides, and ship it. If you'd like help choosing based on your background and goals, talk to a counsellor — it's a five-minute conversation that saves months." },
    ],
  },
  {
    slug: "is-a-coding-course-worth-it-2026",
    title: "Is a coding course worth it in 2026? An honest look",
    description:
      "Coding courses get a bad rap for good reasons. Here's when one is genuinely worth it, when it isn't, and the questions to ask before you pay.",
    date: "2026-09-01",
    author: "Rest Coder Academy",
    readMinutes: 6,
    body: [
      { t: "p", c: "Plenty of people have paid for a coding course and gotten nothing out of it. So it's a fair question: in 2026, with free tutorials everywhere and AI that writes code, is a paid course still worth it? The honest answer is \"sometimes\" — and it depends far more on the course than on you." },
      { t: "h2", c: "When a course is NOT worth it" },
      { t: "ul", c: [
        "It's all recorded videos and theory. You can get that free on YouTube.",
        "You never build anything real — just follow along and copy exercises.",
        "There's no accountability: nobody checks whether you're attending, learning, or progressing.",
        "\"Placement\" is a vague promise with no named students or companies behind it.",
      ] },
      { t: "p", c: "If a course looks like this, save your money. Self-study plus a few real projects will beat it." },
      { t: "h2", c: "When a course IS worth it" },
      { t: "p", c: "A good course buys you three things free tutorials can't: structure, feedback, and momentum. A live cohort with a real trainer means you're building actual software, getting your work reviewed, and being kept accountable so you don't quietly drift off in week three — which is where most self-learners stall." },
      { t: "p", c: "The best ones also close the loop to a job: real placement support, and honesty about outcomes. Ask to see named graduates and where they actually work." },
      { t: "h2", c: "Does AI change the answer?" },
      { t: "p", c: "AI writes code, but it doesn't yet decide what to build, debug a broken production system, or take responsibility for shipping. Those judgment skills are exactly what get you hired — and they come from building real things with feedback, not from watching videos. If anything, AI raises the bar on \"can you actually ship?\", which is what a good, project-based course trains." },
      { t: "h2", c: "Questions to ask before you pay" },
      { t: "ul", c: [
        "Will I build and ship real projects, or just do exercises?",
        "Is it live, with a real trainer I can verify?",
        "How do you keep students accountable and on track?",
        "Can you show me named graduates and the companies they joined?",
        "What exactly does \"placement support\" mean?",
      ] },
      { t: "p", c: "That last set is how we'd want you to judge us too. Our courses are live and project-based, guardians can see a student's progress every week, and our placements page lists real graduates by name and company. If that's the kind of course you're after, come talk to us." },
    ],
  },
];

export function getPost(slug) {
  return posts.find((p) => p.slug === slug) || null;
}
