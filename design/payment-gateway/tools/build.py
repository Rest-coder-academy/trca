# -*- coding: utf-8 -*-
"""RCA payment gateway — design decisions.
Palette and type transcribed from trca/src/styles/colors.css + fonts.css."""
import json

NAVY="#03084C"; BLUE="#146389"; ORANGE="#ff9800"; INK="#333333"; MUTED="#4a4a4a"
GREY="#aebac0"; BG="#f8fafb"; WHITE="#ffffff"; LINE="#e3e7ec"; FAINT="#8a94a1"
GREEN="#1a7f4b"; RED="#c0392b"
F="Montserrat, system-ui, sans-serif"
FEE = 35000

HEAD = """<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap">
  <style>body{margin:0;-webkit-font-smoothing:antialiased}a{color:%s;text-decoration:none}</style>
</helmet>
""" % BLUE
FOOT = "</x-dc>\n</body>\n</html>\n"
def write(n,b): open(n,"w").write(HEAD+b+FOOT); print(f"   {n:22} {len(b):>6}")

def rup(n): return "₹" + format(n, ",d")

def icon(d,s=20,c=MUTED,w=1.7):
    return (f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="{c}" '
            f'stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" '
            f'style="display:block;flex-shrink:0">{d}</svg>')
I_CHECK='<path d="M20 6 9 17l-5-5"/>'; I_LOCK='<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'
I_BACK='<path d="m15 18-6-6 6-6"/>'; I_TAG='<path d="M20 12.5 12.5 20 3 10.5V3h7.5z"/><circle cx="7.5" cy="7.5" r="1.2"/>'
I_WARN='<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17.5v.01"/>'
I_PHONE='<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18.5h2"/>'

def phone(inner, h=760):
    return (f'<div style="width:390px;min-height:{h}px;background:{BG};color:{INK};'
            f'display:flex;flex-direction:column;font-family:{F};overflow:hidden">{inner}</div>')

def framed(inner):
    return (f'<div style="border:1px solid {LINE};border-radius:16px;overflow:hidden;width:390px;'
            f'flex-shrink:0;box-shadow:0 8px 28px rgba(3,8,76,.10)">{inner}</div>')

def cap(t,n):
    return (f'<div style="display:flex;flex-direction:column;gap:5px;width:390px;padding-top:14px">'
            f'<div style="font-family:{F};font-size:11px;font-weight:700;letter-spacing:.08em;'
            f'text-transform:uppercase;color:{ORANGE}">{t}</div>'
            f'<div style="font-family:{F};font-size:13px;line-height:20px;color:{MUTED}">{n}</div></div>')

def col(inner,t,n,h=760): return f'<div style="display:flex;flex-direction:column">{framed(phone(inner,h))}{cap(t,n)}</div>'

def board(kicker,title,sub,content,pad=48,gap=32):
    return (f'<div style="display:flex;flex-direction:column;gap:{gap}px;padding:{pad}px;background:{WHITE};'
            f'font-family:{F};min-height:100%">'
            f'<div style="display:flex;flex-direction:column;gap:8px;max-width:820px">'
            f'<div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:{ORANGE}">{kicker}</div>'
            f'<div style="font-size:30px;line-height:38px;font-weight:800;color:{NAVY};letter-spacing:-.01em">{title}</div>'
            f'<div style="font-size:15px;line-height:24px;color:{MUTED}">{sub}</div></div>{content}</div>')

def notes(items,w=330):
    return (f'<div style="display:flex;flex-direction:column;gap:18px;max-width:{w}px;padding-top:2px">'
            + "".join(f'<div><div style="font-size:11px;font-weight:700;letter-spacing:.08em;'
                      f'text-transform:uppercase;color:{ORANGE}">{h}</div>'
                      f'<div style="font-size:13.5px;line-height:21px;color:{MUTED};margin-top:5px">{p}</div></div>'
                      for h,p in items) + '</div>')

def bar(title, back=True):
    return (f'<div style="display:flex;align-items:center;gap:10px;height:56px;padding:0 16px;'
            f'background:{NAVY}">{icon(I_BACK,20,WHITE) if back else ""}'
            f'<span style="font-family:{F};font-size:15px;font-weight:700;color:{WHITE}">{title}</span></div>')

def field(label, value, hint=None, strong=False):
    return (f'<div style="display:flex;flex-direction:column;gap:6px">'
            f'<div style="font-size:11.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:{FAINT}">{label}</div>'
            f'<div style="height:48px;border:1px solid {LINE};border-radius:8px;background:{WHITE};'
            f'display:flex;align-items:center;padding:0 14px;font-size:15px;'
            f'font-weight:{600 if strong else 400};color:{INK if strong else MUTED}">{value}</div>'
            + (f'<div style="font-size:11.5px;color:{FAINT}">{hint}</div>' if hint else "") + '</div>')

# ---------- 1. course card (the entry) ----------
def screen_course(show_price=True):
    price = (f'<div style="display:flex;align-items:baseline;gap:8px;margin-top:14px">'
             f'<span style="font-size:26px;font-weight:800;color:{NAVY}">{rup(FEE)}</span>'
             f'<span style="font-size:13px;color:{MUTED}">course fee</span></div>'
             if show_price else
             f'<div style="margin-top:14px;font-size:14px;font-weight:600;color:{BLUE}">'
             f'Fee shared on the counselling call</div>')
    return phone(
      bar("Java Full Stack")
      + f'<div style="padding:20px 16px 0">'
        f'<div style="background:{WHITE};border:1px solid {LINE};border-radius:14px;padding:18px">'
        f'<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:{ORANGE}">Next batch</div>'
        f'<div style="font-size:19px;font-weight:700;color:{NAVY};margin-top:6px">Java Full Stack</div>'
        f'<div style="font-size:13px;color:{MUTED};margin-top:3px">For freshers &amp; working professionals</div>'
        + "".join(f'<div style="display:flex;gap:9px;align-items:center;margin-top:{10 if i==0 else 7}px">'
                  f'{icon(I_CHECK,15,BLUE,2.2)}<span style="font-size:13.5px;color:{MUTED}">{x}</span></div>'
                  for i,x in enumerate(["4 months · offline, Bengaluru","Starts Wed 24 May, 10:00 AM","Trainer: Uday Pawar S"]))
        + price
        + f'<div style="height:52px;border-radius:8px;background:{ORANGE};display:flex;align-items:center;'
          f'justify-content:center;margin-top:18px;font-size:15px;font-weight:700;color:{WHITE}">Book your seat</div>'
        f'<div style="text-align:center;font-size:12px;color:{FAINT};margin-top:10px">'
        f'Or talk to a counsellor first</div>'
        f'</div></div>', h=560)

# ---------- 2. checkout ----------
def screen_checkout(amount, label, coupon_applied=True):
    coupon = (
      f'<div style="border:1px solid {GREEN};border-radius:8px;background:#f1f9f4;padding:12px 14px;'
      f'display:flex;align-items:center;gap:10px">{icon(I_TAG,18,GREEN,2)}'
      f'<div style="flex-grow:1"><div style="font-size:14px;font-weight:700;color:{GREEN}">KULLI applied</div>'
      f'<div style="font-size:11.5px;color:{MUTED};margin-top:1px">Referral code recognised</div></div>'
      f'{icon(I_CHECK,17,GREEN,2.4)}</div>'
      if coupon_applied else
      f'<div style="display:flex;gap:8px">'
      f'<div style="flex-grow:1;height:48px;border:1px solid {LINE};border-radius:8px;background:{WHITE};'
      f'display:flex;align-items:center;padding:0 14px;font-size:14px;color:{FAINT}">Referral code</div>'
      f'<div style="width:88px;height:48px;border:1px solid {BLUE};border-radius:8px;display:flex;'
      f'align-items:center;justify-content:center;font-size:14px;font-weight:700;color:{BLUE}">Apply</div></div>')
    return phone(
      bar("Book your seat")
      + f'<div style="display:flex;flex-direction:column;gap:16px;padding:18px 16px 0">'
      + field("Full name","Priya R", strong=True)
      + field("Mobile","+91 98450 12345", strong=True)
      + field("Email","priya.r@gmail.com", strong=True)
      + f'<div style="display:flex;flex-direction:column;gap:6px">'
        f'<div style="font-size:11.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:{FAINT}">Referral code</div>'
        f'{coupon}</div>'
      + f'<div style="background:{WHITE};border:1px solid {LINE};border-radius:12px;padding:16px">'
        f'<div style="display:flex;justify-content:space-between;align-items:baseline">'
        f'<span style="font-size:14px;color:{MUTED}">{label}</span>'
        f'<span style="font-size:22px;font-weight:800;color:{NAVY}">{rup(amount)}</span></div>'
        + (f'<div style="height:1px;background:{LINE};margin:12px 0"></div>'
           f'<div style="display:flex;justify-content:space-between;font-size:13px;color:{MUTED}">'
           f'<span>Balance, payable at the centre</span><span>{rup(FEE-amount)}</span></div>' if amount<FEE else "")
        + '</div>'
      + '</div>'
      + f'<div style="margin-top:auto;padding:16px;background:{WHITE};border-top:1px solid {LINE}">'
        f'<div style="height:52px;border-radius:8px;background:{ORANGE};display:flex;align-items:center;'
        f'justify-content:center;gap:9px;font-size:15px;font-weight:700;color:{WHITE}">'
        f'{icon(I_LOCK,18,WHITE,2)}Pay {rup(amount)} securely</div>'
        f'<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-top:10px">'
        f'{icon(I_LOCK,13,FAINT,2)}<span style="font-size:11.5px;color:{FAINT}">Secured by Razorpay · UPI, cards, net banking</span></div>'
        f'</div>')

# ---------- 3. confirmation ----------
def screen_done(amount):
    return phone(
      bar("Rest Coder Academy", back=False)
      + f'<div style="padding:32px 20px 0;display:flex;flex-direction:column;align-items:center;text-align:center">'
        f'<div style="width:64px;height:64px;border-radius:999px;background:{GREEN};display:flex;'
        f'align-items:center;justify-content:center">{icon(I_CHECK,30,WHITE,3)}</div>'
        f'<div style="font-size:22px;font-weight:800;color:{NAVY};margin-top:18px">Your seat is booked</div>'
        f'<div style="font-size:14px;line-height:22px;color:{MUTED};margin-top:8px;max-width:34ch">'
        f'{rup(amount)} received. A receipt is on its way to your email and WhatsApp.</div></div>'
      + f'<div style="margin:24px 16px 0;background:{WHITE};border:1px solid {LINE};border-radius:12px;padding:18px">'
        f'<div style="font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:{FAINT}">What happens next</div>'
        + "".join(f'<div style="display:flex;gap:12px;margin-top:14px">'
                  f'<div style="width:26px;height:26px;border-radius:999px;background:{NAVY};color:{WHITE};'
                  f'font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0">{i+1}</div>'
                  f'<div><div style="font-size:14px;font-weight:700;color:{NAVY}">{h}</div>'
                  f'<div style="font-size:13px;line-height:20px;color:{MUTED};margin-top:2px">{p}</div></div></div>'
                  for i,(h,p) in enumerate([
            ("We call you within a day","Uday confirms your batch and answers anything left."),
            ("Join the batch WhatsApp group","Timings, address and material land there."),
            ("Class starts Wed 24 May","10:00 AM at the Bengaluru centre.")]))
        + '</div>'
      + f'<div style="margin:18px 16px 0;display:flex;align-items:center;gap:10px;background:{WHITE};'
        f'border:1px solid {LINE};border-radius:12px;padding:14px">{icon(I_PHONE,20,BLUE)}'
        f'<div><div style="font-size:13px;color:{MUTED}">Any questions?</div>'
        f'<div style="font-size:14px;font-weight:700;color:{NAVY}">8073762257</div></div></div>', h=700)

# ================= boards =================================================
write("Main.dc.html", board(
  "RCA payment gateway · the flow",
  "Three screens, one job: turn an enquiry into a paid seat.",
  "Built on Rest Coder Academy's own palette and Montserrat. The enquiry form already collects "
  "name, mobile and email — this extends that form rather than asking for it twice. "
  "Amount shown as ₹35,000 (the SOW figure); the deposit variant is on the next board.",
  f'<div style="display:flex;gap:36px;align-items:flex-start;flex-wrap:wrap">'
  + col(screen_course(True), "1 · Course card", "One batch, one price, one button. &ldquo;Book your seat&rdquo; beats &ldquo;Pay now&rdquo; — it names what you get, not what you lose.", 560)
  + col(screen_checkout(FEE, "Course fee"), "2 · Checkout", "Details pre-filled from the enquiry. The referral code sits in the form, not behind a link — see the next board for why that matters.")
  + col(screen_done(FEE), "3 · Confirmation", "Money just left their hands for a 4-month commitment. Three concrete next steps and a phone number do more than a thank-you.", 700)
  + notes([
      ("Mobile only, deliberately", "Their audience is freshers and working professionals in Bengaluru on Android. The desktop layout is the same column centred — nothing new to design."),
      ("Razorpay hosted, not embedded", "Same pattern already built for Kulli Stores. No card data touches RCA's servers and no PCI scope. The trade is a redirect, which the confirmation screen absorbs."),
      ("&ldquo;Or talk to a counsellor first&rdquo;", "The enquiry funnel is what works today. Payment is added beside it, not in front of it — removing that link would trade a working funnel for an untested one."),
      ("Receipt on WhatsApp", "Their audience lives there, and the batch group is already the delivery channel. Email alone gets missed."),
  ])
  + '</div>'))

def compare(rows):
    return (f'<div style="border:1px solid {LINE};border-radius:12px;overflow:hidden;max-width:900px">'
            + "".join(f'<div style="display:flex;gap:18px;padding:14px 18px;'
                      f'{"background:"+WHITE if i%2==0 else "background:"+BG};'
                      f'border-bottom:1px solid {LINE}">'
                      f'<div style="width:190px;flex-shrink:0;font-size:13.5px;font-weight:700;color:{NAVY}">{k}</div>'
                      f'<div style="font-size:13.5px;line-height:21px;color:{MUTED}">{v}</div></div>'
                      for i,(k,v) in enumerate(rows)) + '</div>')

write("Coupon.dc.html", board(
  "RCA payment gateway · the decision that pays us",
  "The referral field is not a coupon. It is the invoice.",
  "OPERATIONS.md is explicit: <em>&ldquo;the KULLI code count at checkout is the billing source of truth&rdquo;</em>, "
  "on a deal of 1&ndash;3% of ₹35,000, online payments only. Every design choice around that field has a rupee value.",
  f'<div style="display:flex;flex-direction:column;gap:30px">'
  + f'<div style="border:1px solid {RED};border-radius:14px;background:#fdf3f2;padding:22px;max-width:900px">'
    f'<div style="display:flex;gap:10px;align-items:flex-start">{icon(I_WARN,20,RED,2)}'
    f'<div><div style="font-size:18px;line-height:26px;font-weight:800;color:{INK}">'
    f'The default checkout pattern — &ldquo;Have a coupon?&rdquo; behind a link — quietly zeroes the rev-share.</div>'
    f'<div style="font-size:14px;line-height:22px;color:{MUTED};margin-top:9px;max-width:86ch">'
    f'A student who came through Kulli &amp; Co and never opens that link pays RCA in full and counts as organic. '
    f'The money is collected, the attribution is not, and nothing anywhere reports an error. '
    f'At 1&ndash;3% of ₹35,000 that is ₹350&ndash;1,050 lost per student, silently.</div></div></div></div>'
  + f'<div style="display:flex;gap:36px;align-items:flex-start;flex-wrap:wrap">'
  + col(screen_checkout(FEE,"Course fee",True), "Arrived via ?ref=KULLI", "Code pre-filled and confirmed in green before they reach the pay button. Nothing to remember, nothing to type, nothing to skip.")
  + col(screen_checkout(FEE,"Course fee",False), "Arrived directly", "Field still visible and empty — never collapsed behind a link. A student told &ldquo;mention Kulli&rdquo; can act on it.")
  + notes([
      ("The link does the work", "Every Kulli &amp; Co touchpoint links to <code style=\"font-size:12.5px\">rca.in/enrol?ref=KULLI</code>. The field is a fallback for word of mouth, not the mechanism."),
      ("Show it, don't hide it", "Always rendered, never behind a disclosure. One extra visible field costs a little conversion; a missed code costs the whole fee's share."),
      ("Confirm it visibly", "Green state before payment. A code that silently fails to apply is worse than no field — it looks handled and isn't."),
      ("Persist it", "Store the ref on first landing, not just on the enrol page. Students browse the course pages before they pay."),
      ("Reconcile monthly", "Razorpay's notes field carries the code into the payment record, so the count is queryable rather than counted by hand for #51's dashboard."),
  ], 340)
  + '</div></div>'))

write("Variants.dc.html", board(
  "RCA payment gateway · the two open questions",
  "Both answers are a config change, not a redesign.",
  "Nik has been asked whether the online payment is the full fee or a deposit, and whether prices go public. "
  "The layout was built so neither answer costs a rework — here is what each looks like.",
  f'<div style="display:flex;flex-direction:column;gap:34px">'
  + f'<div><div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:{ORANGE};margin-bottom:14px">Question 1 — full fee or deposit</div>'
    f'<div style="display:flex;gap:36px;flex-wrap:wrap">'
  + col(screen_checkout(FEE,"Course fee"), "Full ₹35,000 online", "Everything the student pays is online, so 100% of the fee is inside the rev-share base. Highest friction on a cold page — but they arrive here after a counselling call, not cold.")
  + col(screen_checkout(5000,"Seat booking"), "₹5,000 deposit", "Far easier to say yes to. But ₹30,000 then moves at the centre, in cash or transfer, <strong>outside the online base the rev-share is measured on</strong>.")
  + notes([
      ("The commercial answer", "Rev-share is online-payments-only. A deposit model puts 86% of every fee outside the thing we are paid on. Whatever is best for RCA's conversion, this is the number to decide it with — not a UX preference."),
      ("If it is a deposit", "Then the balance should also be payable online, from the same link, or the rev-share is structurally capped at 14%."),
      ("Layout cost of either", "One line. The balance row appears when the amount is under the fee; nothing else moves."),
  ], 320)
    + '</div></div>'
  + f'<div><div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:{ORANGE};margin-bottom:14px">Question 2 — do prices go public</div>'
    f'<div style="display:flex;gap:36px;flex-wrap:wrap">'
  + col(screen_course(True), "Price shown", "Filters out people who were never going to pay ₹35,000, so the counsellor's calls get better. Also lets a student pay without a call at all.", 560)
  + col(screen_course(False), "Price withheld", "Protects the counselling motion that currently converts, and keeps the fee negotiable. Costs you the self-serve path entirely — nobody pays a price they have not seen.", 560)
  + notes([
      ("They are the same component", "One boolean. The button, batch details and layout are identical either way."),
      ("A middle option", "Show the price only on the enrol page reached from the call, not on the public course card. Self-serve stays off, attribution still works, and the fee stays private."),
  ], 320)
    + '</div></div></div>'))

write("Spec.dc.html", board(
  "RCA payment gateway · build notes",
  "What this needs from the existing app.",
  "Not a rebuild. The site already has the form, the fields and a backend — this adds a payment step beside them.",
  f'<div style="display:flex;gap:40px;flex-wrap:wrap;align-items:flex-start">'
  + f'<div style="flex:1 1 560px">'
  + compare([
      ("Already there", "<code style=\"font-size:12.5px\">EnquiryForm.jsx</code> collects fullname, mobile, email, experience — the same fields a checkout needs. Reuse the atoms (<code style=\"font-size:12.5px\">InputBoxComponent</code>, <code style=\"font-size:12.5px\">ButtonComponent</code>) rather than introducing a second form language."),
      ("Backend", "<code style=\"font-size:12.5px\">trcabe.onrender.com</code> already takes enquiries. An order endpoint sits beside it: create Razorpay order, verify the signature server-side, store the ref code."),
      ("Never trust the client", "The amount must come from the server, not a form field. A price posted from the browser is a price the browser can change."),
      ("Verify the signature", "Razorpay's webhook signature check server-side is what makes a payment real. Redirect alone can be forged."),
      ("Carry the ref code", "Put it in Razorpay <code style=\"font-size:12.5px\">notes</code> on order creation. That is what makes #51's rev-share dashboard a query rather than a manual count."),
      ("Idempotency", "A student who double-taps must not create two orders. Key on enquiry id + batch."),
      ("Failure path", "Not designed here, and it needs to be: card declined, UPI timeout, browser closed mid-payment. On a ₹35,000 payment this is the screen that decides whether they retry or ring a competitor."),
      ("Receipt", "Razorpay sends its own. The WhatsApp confirmation is RCA's, and it is the one their audience will actually read."),
  ])
  + '</div>'
  + notes([
      ("What I did not decide", "The fee is ₹35,000 from the SOW in <code style=\"font-size:12.5px\">OPERATIONS.md</code>. Everything else commercial — deposit vs full, public pricing, refund window — is Nik's and is asked on the previous board."),
      ("Not designed yet", "Payment failure and retry, refund/cancellation copy, and the desktop layout (same column, centred). Say the word and they are quick."),
      ("Refunds", "A seat-booking deposit implies a refund policy. If there is one, it belongs on the checkout screen above the pay button, not in a terms link."),
  ], 340)
  + '</div>'))

CANVAS = {
 "pages":[{"id":"page-1","name":"Flow"},{"id":"page-2","name":"Decisions"},{"id":"page-3","name":"Build notes"}],
 "artboards":[
  {"file":"Main.dc.html",    "page":"page-1","x":0,"y":0,"w":2140,"h":1180,"title":"The enrol flow"},
  {"file":"Coupon.dc.html",  "page":"page-2","x":0,"y":0,"w":1900,"h":1320,"title":"The referral field — attribution"},
  {"file":"Variants.dc.html","page":"page-2","x":2020,"y":0,"w":1900,"h":1870,"title":"The two open questions"},
  {"file":"Spec.dc.html",    "page":"page-3","x":0,"y":0,"w":1500,"h":840,"title":"Build notes"}],
 "annotations":[
  {"id":"rca-open","page":"page-2","x":3980,"y":0,"w":300,
   "text":"Waiting on Nik\n\n1. Full ₹35,000 online, or a deposit?\n2. Do prices go public on the site?\n\nBoth already asked. Neither blocks the design — the layout takes either answer as a config change.\n\nThe fee itself (₹35,000) came from the SOW line in kulli-and-co/docs/OPERATIONS.md, so that one did not need asking."}],
 "launch":{"view":"canvas","page":"page-1"}
}
json.dump(CANVAS, open("canvas.json","w"), indent=2)
print("   canvas.json")
