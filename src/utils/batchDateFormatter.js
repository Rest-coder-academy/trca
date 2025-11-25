const formatFriendlyDate = d => {
  const date = new Date(d);
  if (isNaN(date)) throw new Error("Invalid date value");
  const p = new Intl.DateTimeFormat("en-US",{weekday:"short",day:"numeric",month:"short",year:"numeric",timeZone:"UTC"}).formatToParts(date);
  const day = +p.find(x=>x.type==="day").value;
  const ordinal = n => ["th","st","nd","rd"][(n%100-20)%10]||["th","st","nd","rd"][n%100]||"th";
  return `${day}${ordinal(day)} ${p.find(x=>x.type==="month").value} ${p.find(x=>x.type==="year").value} ${p.find(x=>x.type==="weekday").value}`;
};

// Example:
console.log(formatFriendlyDate("2025-01-24T00:00:00.000Z"));
// Output: 24th Jan 2025 Fri


export {formatFriendlyDate}