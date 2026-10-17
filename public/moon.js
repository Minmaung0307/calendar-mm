// Calendar-based illustration, not astronomical illumination.
export function moonFraction(r) {
  if (r.phase === 1) return 1;
  if (r.phase === 3) return 0;
  return Math.max(0, Math.min(1, r.phase === 0 ? r.md / 15 : (r.length - r.md) / (r.length - 15)));
}
export function drawMoon(el, r) {
  const f = moonFraction(r), waxing = r.phase < 2;
  const points = [];
  // Horizontal widths approximate a lit sphere with a curved terminator.
  for (let i=0;i<=60;i++) {
    const y=-1+2*i/60, edge=Math.sqrt(Math.max(0,1-y*y));
    points.push([waxing ? edge : -edge,y]);
  }
  for (let i=60;i>=0;i--) {
    const y=-1+2*i/60, edge=Math.sqrt(Math.max(0,1-y*y));
    points.push([(waxing ? 1 : -1)*Math.cos(Math.PI*f)*edge,y]);
  }
  const coords=points.map(([x,y])=>`${50+x*44},${50+y*44}`).join(' ');
  el.innerHTML=`<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="var(--moon-shadow)"/>${f>0?`<polygon points="${coords}" fill="#e8c487"/>`:''}<circle cx="50" cy="50" r="44" fill="none" stroke="var(--muted)" stroke-opacity=".3"/></svg>`;
  el.removeAttribute('aria-hidden');el.setAttribute('role','img');
  const label = `${r.month} ${r.phaseText} — ပြက္ခဒိန်အခြေပြု လပုံ`;
  el.setAttribute('aria-label',label);el.title=label;
}
