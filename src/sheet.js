// Ficha do imóvel: card que se expande, no espírito dos cards da App Store.
export function initSheet({ LISTINGS, waUrl, gsap, getLenis, reduce }) {
  const sheet = document.querySelector("[data-sheet]");
  if (!sheet) return;
  const panel = sheet.querySelector(".sheet__panel");
  const backdrop = sheet.querySelector(".sheet__backdrop");
  const media = sheet.querySelector(".sheet__media");
  const q = (k) => sheet.querySelector(`[data-s="${k}"]`);
  const byId = Object.fromEntries(LISTINGS.map((l) => [l.id, l]));
  const isMobile = () => window.matchMedia("(max-width: 760px)").matches;

  let current = null;
  let lastFocus = null;
  let busy = false;
  let closing = false;
  let openTl = null;

  const fill = (l) => {
    const img = q("img");
    img.src = l.img;
    img.alt = l.alt;
    const tag = q("tag");
    tag.textContent = l.tag;
    tag.className = `card__tag card__tag--${l.kind}`;
    q("sub").textContent = l.sub;
    q("title").textContent = l.title;
    q("lead").textContent = l.lead;
    q("specs").innerHTML = l.specs
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
      .join("");
    q("highlights").innerHTML = l.highlights
      .map((h) => `<li><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-check"/></svg>${h}</li>`)
      .join("");
    q("visit").href = waUrl(`Olá, João! Vi o imóvel "${l.title}" no site e quero agendar uma visita.`);
    q("ask").href = waUrl(`Olá, João! Vi o imóvel "${l.title}" no site e tenho uma dúvida.`);
    const i = LISTINGS.indexOf(l);
    const next = LISTINGS[(i + 1) % LISTINGS.length];
    const nb = q("next");
    nb.querySelector("strong").textContent = next.title;
    nb.dataset.target = next.id;
    panel.scrollTop = 0;
  };

  const cardImg = (id) => document.querySelector(`.card[data-id="${id}"] .card__img`);

  // clip-path a partir do retângulo do card (efeito "o card vira a ficha")
  const clipFrom = (id) => {
    const el = cardImg(id);
    if (!el) return null;
    const c = el.getBoundingClientRect();
    if (c.bottom < 0 || c.top > innerHeight || c.right < 0 || c.left > innerWidth) return null;
    const p = panel.getBoundingClientRect();
    const t = Math.max(0, c.top - p.top);
    const l = Math.max(0, c.left - p.left);
    const r = Math.max(0, p.right - c.right);
    const b = Math.max(0, p.bottom - c.bottom);
    return `inset(${t}px ${r}px ${b}px ${l}px round 18px)`;
  };

  const inEls = () => sheet.querySelectorAll(".sheet__in");

  const open = (id, { fromHash = false } = {}) => {
    const l = byId[id];
    if (!l || busy) return;
    current = id;
    lastFocus = document.activeElement;
    fill(l);
    sheet.hidden = false;
    document.documentElement.classList.add("sheet-open");
    getLenis()?.stop();
    if (!fromHash) history.replaceState(null, "", `#imovel-${id}`);
    sheet.querySelector(".sheet__close").focus({ preventScroll: true });

    if (reduce) return;
    busy = true;
    gsap.killTweensOf([panel, backdrop, media, ...inEls()]);
    gsap.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    const tl = (openTl = gsap.timeline({ onComplete: () => { busy = false; gsap.set(panel, { clearProps: "clipPath,transform" }); } }));
    const clip = !isMobile() && clipFrom(id);
    if (clip) {
      tl.fromTo(panel, { clipPath: clip }, { clipPath: "inset(0px 0px 0px 0px round 32px)", duration: 0.85, ease: "expo.inOut" }, 0);
      tl.fromTo(media.querySelector("img"), { scale: 1.25 }, { scale: 1, duration: 1.1, ease: "expo.out" }, 0.1);
    } else {
      tl.fromTo(panel, { yPercent: isMobile() ? 100 : 8, opacity: isMobile() ? 1 : 0 }, { yPercent: 0, opacity: 1, duration: 0.7, ease: "expo.out" }, 0);
    }
    tl.fromTo(inEls(), { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out", stagger: 0.06 }, clip ? 0.45 : 0.2);
  };

  const finishClose = () => {
    sheet.hidden = true;
    document.documentElement.classList.remove("sheet-open");
    gsap.set([panel, backdrop, ...inEls()], { clearProps: "all" });
    getLenis()?.start();
    history.replaceState(null, "", location.pathname + location.search);
    lastFocus?.focus?.({ preventScroll: true });
    current = null;
    busy = false;
    closing = false;
  };

  const close = () => {
    if (!current || closing) return;
    // fechar sempre vence: interrompe a abertura ou a troca em andamento
    openTl?.kill();
    gsap.killTweensOf([panel, backdrop, ...inEls()]);
    if (reduce) return finishClose();
    busy = true;
    closing = true;
    const clip = !isMobile() && clipFrom(current);
    const tl = gsap.timeline({ onComplete: finishClose });
    tl.to(inEls(), { opacity: 0, duration: 0.2 }, 0);
    if (clip) {
      tl.fromTo(panel, { clipPath: "inset(0px 0px 0px 0px round 32px)" }, { clipPath: clip, duration: 0.6, ease: "expo.inOut" }, 0.05);
    } else {
      tl.to(panel, { yPercent: isMobile() ? 100 : 6, opacity: isMobile() ? 1 : 0, duration: 0.45, ease: "power3.in" }, 0);
    }
    tl.to(backdrop, { opacity: 0, duration: 0.45 }, 0.15);
  };

  const swap = (id) => {
    if (busy) return;
    busy = true;
    gsap.to(panel, {
      opacity: 0, y: 20, duration: 0.25, ease: "power2.in",
      onComplete: () => {
        current = id;
        fill(byId[id]);
        history.replaceState(null, "", `#imovel-${id}`);
        gsap.fromTo(panel, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "expo.out", onComplete: () => { busy = false; } });
      },
    });
  };

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open]");
    if (t) { e.preventDefault(); open(t.dataset.open); return; }
    if (e.target.closest("[data-close]") && current) { e.preventDefault(); close(); }
  });
  q("next").addEventListener("click", () => swap(q("next").dataset.target));
  document.addEventListener("keydown", (e) => {
    if (!current) return;
    if (e.key === "Escape") close();
    if (e.key === "Tab") {
      const f = [...panel.querySelectorAll("a[href], button")].filter((x) => x.offsetParent);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // abre direto por link compartilhado: /#imovel-santa-emilia
  const fromHash = (delay) => {
    const m = location.hash.match(/^#imovel-(.+)$/);
    if (m && byId[m[1]] && current !== m[1]) setTimeout(() => open(m[1], { fromHash: true }), delay);
  };
  fromHash(600);
  window.addEventListener("hashchange", () => fromHash(0));
}
