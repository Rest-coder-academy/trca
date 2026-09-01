// Fallback trainer data — rendered when /api/trainers is empty or unreachable, so
// the "Our Trainers" section always shows the real trainer. Trainers are managed
// live at /admin/trainers (D1); this bundled copy is the safety net.
//
// Field names match the /api/trainers response exactly (snake_case) so a card
// renders identically whether it comes from D1 or from here.
//
// Only verifiable facts are seeded below. Experience / expertise / bio are left
// blank on purpose — fill them in from the admin portal so the credibility shown
// is real, never invented.
export const trainers = [
  {
    id: "uday",
    name: "Uday Pawar S",
    title: "Full-Stack Trainer",
    photo_url: "/trainers/uday.png",
    experience: "",
    expertise: "",
    bio: "",
    linkedin_url: "https://www.linkedin.com/in/uday-pawar-s-835920164",
    github_url: "",
    instagram_url: "https://www.instagram.com/_udaypawar_",
    facebook_url: "https://www.facebook.com/share/1B6z1EPq7d/",
    website_url: "",
    certificate_url: "/trainers/uday-certificate.pdf",
  },
];
