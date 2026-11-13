import "./style.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

const WA = "5567992801572";
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- WhatsApp links ---------- */
const waUrl = (msg) => `https://wa.me/${WA}?text=${encodeURIComponent(msg)}`;
$$("[data-ask]").forEach((a) => {
  a.href = waUrl(`Olá, João! Vim pelo site e quero saber sobre ${a.dataset.ask}.`);
  a.target = "_blank";
  a.rel = "noopener";
});

/* ---------- Intent form ---------- */
const form = $("[data-intent]");
if (form) {
  const pill = $(".intent__pill", form);
  const radios = $$('input[name="objetivo"]', form);
  const movePill = () => {
    const i = radios.findIndex((r) => r.checked);
    pill.style.transform = `translateX(${i * 100}%)`;
  };
  radios.forEach((r) => r.addEventListener("change", movePill));
  movePill();
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const obj = radios.find((r) => r.checked).value;
    const bairro = form.bairro.value.trim();
    const onde = bairro ? ` na região do ${bairro}` : " em Campo Grande";
    const frases = {
      comprar: `Olá, João! Vim pelo site e quero comprar um imóvel${onde}. Pode me ajudar com a simulação?`,
      alugar: `Olá, João! Vim pelo site e procuro um imóvel para alugar${onde}.`,
      vender: `Olá, João! Vim pelo site e quero vender meu imóvel${onde}. Gostaria da avaliação grátis.`,
    };
    window.open(waUrl(frases[obj]), "_blank", "noopener");
  });
}

/* ---------- Nav + FAB ---------- */
const nav = $("[data-nav]");
const fab = $("[data-fab]");
let lastY = 0;
const onScroll = (y) => {
  nav.classList.toggle("is-solid", y > 60);
  nav.classList.toggle("is-hidden", y > lastY && y > window.innerHeight * 0.9);
  fab.classList.toggle("is-on", y > window.innerHeight * 0.7);
  lastY = y;
};

/* ---------- Smooth scroll ---------- */
let lenis;
if (!reduce) {
  lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
  lenis.on("scroll", (e) => {
    ScrollTrigger.update();
    onScroll(e.scroll);
  });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  $$('a[href^="#"]').forEach((a) =>
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const t = $(id);
      if (!t) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: id === "#topo" ? 0 : -10, duration: 1.4 });
    })
  );
} else {
  window.addEventListener("scroll", () => onScroll(window.scrollY), { passive: true });
}

/* ---------- Split helpers ---------- */
const splitChars = (el) => {
  const text = el.textContent;
  el.textContent = "";
  return [...text].map((c) => {
    const s = document.createElement("span");
    s.className = "ch";
    s.textContent = c;
    el.appendChild(s);
    return s;
  });
};
const splitWords = (el) => {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  return words.map((w, i) => {
    const mask = document.createElement("span");
    mask.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em;margin-bottom:-.08em";
    const inner = document.createElement("span");
    inner.style.display = "inline-block";
    inner.textContent = w;
    mask.appendChild(inner);
    el.appendChild(mask);
    if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    return inner;
  });
};

/* ---------- HERO ---------- */
const bg = $("[data-hero-bg]");
const fg = $("[data-hero-fg]");
const word = $("[data-hero-word]");
const chars = $$("[data-split]", word).flatMap(splitChars);
const heroCopy = $$("[data-hero-copy]");

const ready = Promise.all(
  [bg, fg].map((img) => (img.complete ? Promise.resolve() : new Promise((r) => { img.onload = r; img.onerror = r; })))
);
const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();

if (reduce) {
  onScroll(0);
} else {
  gsap.set(chars, { yPercent: 115 });
  gsap.set(bg, { scale: 1.16, filter: "brightness(.55) saturate(.8)" });
  gsap.set(fg, { scale: 1.1, yPercent: 3, filter: "brightness(.55) saturate(.8)" });
  gsap.set(heroCopy, { opacity: 0, y: 40 });
  gsap.set(nav, { opacity: 0, y: -20 });

  Promise.all([ready, fontsReady]).then(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.to(bg, { scale: 1, filter: "brightness(1) saturate(1)", duration: 2.6 }, 0)
      .to(fg, { scale: 1, yPercent: 0, filter: "brightness(1) saturate(1)", duration: 2.4 }, 0.05)
      // as letras sobem de trás do telhado
      .to(chars, { yPercent: 0, duration: 1.7, stagger: { each: 0.045, from: "center" } }, 0.55)
      .to(nav, { opacity: 1, y: 0, duration: 1.2 }, 1.1)
      .to(heroCopy, { opacity: 1, y: 0, duration: 1.4, stagger: 0.12 }, 1.2);

    // parallax em camadas ao rolar
    const st = { trigger: ".hero", start: "top top", end: "bottom top", scrub: true };
    gsap.to(bg, { yPercent: 14, ease: "none", scrollTrigger: st });
    gsap.to(word, { yPercent: -55, ease: "none", scrollTrigger: st });
    gsap.to(fg, { yPercent: 4, scale: 1.06, ease: "none", scrollTrigger: st });
    if (window.matchMedia("(min-width: 1101px)").matches) {
      gsap.to(".hero__content", { y: -80, opacity: 0, ease: "none", scrollTrigger: { ...st, end: "60% top" } });
    }
  });
}

/* ---------- Marquee ---------- */
const mq = $("[data-marquee]");
if (mq) {
  const track = $(".marquee__track", mq);
  mq.appendChild(track.cloneNode(true)).setAttribute("aria-hidden", "true");
  if (!reduce) {
    const tracks = $$(".marquee__track", mq);
    const loop = gsap.to(tracks, { xPercent: -100, duration: 28, ease: "none", repeat: -1 });
    let dir = 1;
    ScrollTrigger.create({
      onUpdate: (self) => {
        const d = self.direction;
        if (d !== dir) { dir = d; gsap.to(loop, { timeScale: d, duration: 0.6 }); }
        const v = Math.min(Math.abs(self.getVelocity()) / 800, 3);
        gsap.to(loop, { timeScale: d * (1 + v), duration: 0.2, overwrite: true, onComplete: () => gsap.to(loop, { timeScale: d, duration: 0.8 }) });
      },
    });
  }
}

/* ---------- Section titles: words rise ---------- */
if (!reduce) {
  $$(".display, .cta__title, .about__quote").forEach((el) => {
    const w = splitWords(el);
    gsap.from(w, {
      yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.06,
      scrollTrigger: { trigger: el, start: "top 85%" },
    });
  });
}

const mm = gsap.matchMedia();

/* ---------- Listings: horizontal pinned scroll ---------- */
mm.add("(min-width: 901px) and (prefers-reduced-motion: no-preference)", () => {
  const pin = $("[data-listings]");
  const track = $("[data-track]");
  const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
  const tween = gsap.to(track, {
    x: () => -dist(),
    ease: "none",
    scrollTrigger: {
      trigger: pin, start: "top top", end: () => `+=${dist()}`,
      pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1,
    },
  });
  gsap.to("[data-progress]", { scaleX: 1, ease: "none", scrollTrigger: { trigger: pin, start: "top top", end: () => `+=${dist()}`, scrub: true } });
  $$(".card__img img", track).forEach((img) => {
    gsap.fromTo(img, { xPercent: -6 }, {
      xPercent: 6, ease: "none",
      scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: "left right", end: "right left", scrub: true },
    });
  });
  gsap.from($$(".card", track), {
    y: 80, opacity: 0, duration: 1.2, ease: "expo.out", stagger: 0.08,
    scrollTrigger: { trigger: pin, start: "top 75%" },
  });
});

/* ---------- Steps rail ---------- */
if (!reduce) {
  const steps = $("[data-steps]");
  gsap.to("[data-rail]", { scaleY: 1, ease: "none", scrollTrigger: { trigger: steps, start: "top 60%", end: "bottom 60%", scrub: true } });
  $$(".step", steps).forEach((s) => {
    ScrollTrigger.create({ trigger: s, start: "top 62%", end: "bottom 62%", onToggle: (self) => self.isActive && s.classList.add("is-on"), onLeaveBack: () => s.classList.remove("is-on") });
    gsap.from(s.querySelector("div"), { x: 40, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: s, start: "top 80%" } });
  });
} else {
  $$(".step").forEach((s) => s.classList.add("is-on"));
}

/* ---------- Services: imagem que segue o cursor ---------- */
mm.add("(min-width: 901px) and (hover: hover) and (prefers-reduced-motion: no-preference)", () => {
  const box = $("[data-svc-float]");
  const img = $("img", box);
  const wrap = box.parentElement;
  const xTo = gsap.quickTo(box, "x", { duration: 0.6, ease: "power3" });
  const yTo = gsap.quickTo(box, "y", { duration: 0.6, ease: "power3" });
  const rTo = gsap.quickTo(box, "rotate", { duration: 0.8, ease: "power3" });
  let px = 0;
  const move = (e) => {
    const r = wrap.getBoundingClientRect();
    const x = e.clientX - r.left - 140;
    xTo(x); yTo(e.clientY - r.top - 175);
    rTo(gsap.utils.clamp(-10, 10, (e.clientX - px) * 0.4)); px = e.clientX;
  };
  const rows = $$(".svc__row");
  const enter = (row) => () => {
    img.src = row.dataset.img;
    gsap.to(box, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" });
  };
  const leave = () => gsap.to(box, { opacity: 0, scale: 0.7, duration: 0.4, ease: "power3.out" });
  rows.forEach((row) => { row.addEventListener("mouseenter", enter(row)); row.addEventListener("mouseleave", leave); });
  wrap.addEventListener("mousemove", move);
  return () => wrap.removeEventListener("mousemove", move);
});

/* ---------- About: parallax + contadores ---------- */
if (!reduce) {
  gsap.fromTo("[data-parallax] img", { yPercent: -8 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: "[data-parallax]", start: "top bottom", end: "bottom top", scrub: true } });
  $$("[data-count]").forEach((el) => {
    const end = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 1.8, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 90%" },
      onUpdate: () => { el.textContent = o.v.toFixed(dec).replace(".", ","); },
    });
  });
  gsap.from(".quote", { y: 50, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.1, scrollTrigger: { trigger: "[data-quotes]", start: "top 80%" } });
  gsap.fromTo("[data-cta-word]", { xPercent: 4 }, { xPercent: -30, ease: "none", scrollTrigger: { trigger: ".cta", start: "top bottom", end: "bottom top", scrub: true } });
}

window.addEventListener("load", () => ScrollTrigger.refresh());
