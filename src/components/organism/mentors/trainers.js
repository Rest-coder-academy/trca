// No trainers are bundled into the site. The "Our Trainers" section is driven
// entirely by /admin/trainers (D1), so what the academy enters in the portal is
// exactly what shows — and if nothing has been entered (or the API is briefly
// unreachable), the section simply doesn't render. This keeps the site and the
// admin portal always in sync and honours "if it isn't entered, we don't show it".
//
// Photos and certificates the academy references (e.g. /trainers/uday.png,
// /trainers/uday-certificate.pdf) are served from public/trainers/.
export const trainers = [];
