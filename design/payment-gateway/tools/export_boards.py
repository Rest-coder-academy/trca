import subprocess, os, re, base64
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; CWD=os.getcwd()
os.makedirs("svg", exist_ok=True)
B=[("Main","01-enrol-flow",2140,1180),("Coupon","02-referral-attribution",1900,1320),
   ("Variants","03-open-questions",1900,1870),("Spec","04-build-notes",1500,840)]
R="""
<script src="./exporter.js"></script>
<script>(async()=>{await document.fonts.ready;await new Promise(r=>setTimeout(r,700));
const root=document.querySelector('x-dc > div');const svg=window.__exportSVG(root,%d,%d);
const d=document.createElement('div');d.id='R';d.textContent=btoa(unescape(encodeURIComponent(svg)));
document.body.appendChild(d);})();</script>
"""
for s,o,w,h in B:
    open("_h.html","w").write(open(f"{s}.dc.html").read().replace("</body>",R%(w,h)+"</body>"))
    dom=subprocess.run([C,"--headless","--disable-gpu","--hide-scrollbars","--virtual-time-budget=12000",
        f"--window-size={w},{h}","--dump-dom",f"file://{CWD}/_h.html"],capture_output=True,text=True).stdout
    m=re.search(r'<div id="R">([A-Za-z0-9+/=]+)</div>',dom)
    if not m: print("  FAILED",s); continue
    t=base64.b64decode(m.group(1)).decode("utf-8"); open(f"svg/{o}.svg","w").write(t)
    print(f"  svg/{o}.svg  {len(t)} bytes  {t.count('<text')} text")
os.remove("_h.html")
