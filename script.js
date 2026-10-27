/* ==========================================================
   CONFIG: edit this block only. Leave blank anything unverified.
   ========================================================== */
const CONFIG = {
  LAUNCHED: false,       // set true once ALL details are verified (hides yellow "verify" markers)
  PHONE: "",             // e.g. "+35391XXXXXX": enables "Call the Practice" buttons
  EMAIL: "",             // verified practice email
  FORM_ENDPOINT: ""      // e.g. "https://formspree.io/f/yourFormId". Blank = demo mode, nothing is sent
};

(function () {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  if (CONFIG.LAUNCHED) document.body.classList.add("launched");
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Phone / email wiring ---------- */
  if (CONFIG.PHONE) {
    const tel = "tel:" + CONFIG.PHONE.replace(/[^\d+]/g, "");
    $$("[data-call]").forEach(a => (a.href = tel));
    $$("[data-phone-text]").forEach(s => {
      s.innerHTML = "";
      const a = document.createElement("a");
      a.href = tel; a.textContent = CONFIG.PHONE; s.appendChild(a);
      s.classList.remove("placeholder");
    });
  }
  if (CONFIG.EMAIL) {
    $$("[data-email-text]").forEach(s => {
      s.innerHTML = "";
      const a = document.createElement("a");
      a.href = "mailto:" + CONFIG.EMAIL; a.textContent = CONFIG.EMAIL; s.appendChild(a);
      s.classList.remove("placeholder");
    });
  }

  /* ---------- Mobile menu ---------- */
  const toggle = $(".nav-toggle");
  const nav = $("#primary-nav");
  function setMenu(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); toggle.focus(); }
  });
  window.addEventListener("resize", () => { if (innerWidth > 980) setMenu(false); });

  /* ---------- Active nav link on scroll ---------- */
  const links = $$(".primary-nav ul a");
  const map = new Map(links.map(a => [a.getAttribute("href").slice(1), a]));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          links.forEach(l => l.classList.remove("active"));
          const l = map.get(en.target.id);
          if (l) l.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["about", "services", "patient-info", "contact"].forEach(id => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Hide mobile CTA when the form is on screen ---------- */
  const cta = $(".mobile-cta");
  const contact = $("#contact");
  if (cta && contact && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => cta.classList.toggle("hidden", en.isIntersecting), { threshold: 0.15 }).observe(contact);
  }

  /* ---------- Highlight today's opening hours ---------- */
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const today = new Date().toLocaleDateString("en-IE", { weekday: "short", timeZone: "Europe/Dublin" }).slice(0, 3).toLowerCase();
  const row = $(`[data-hours="${days.includes(today) ? today : days[new Date().getDay()]}"]`);
  if (row) row.closest("tr").classList.add("today");

  /* ---------- Legal dialogs ---------- */
  $$("[data-dialog]").forEach(a => a.addEventListener("click", e => {
    e.preventDefault();
    const d = $("#dlg-" + a.dataset.dialog);
    if (d && d.showModal) d.showModal();
  }));

  /* ---------- Form ---------- */
  const form = $("#contact-form");
  const status = $("#form-status");
  const dateInput = $("#date", form);
  dateInput.min = new Date().toISOString().split("T")[0];

  const rules = {
    name: v => (v.trim().length < 2 ? "Please enter your full name." : ""),
    email: v => !v.trim() ? "Please enter your email address."
      : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "Enter a valid email address, like name@example.com." : "",
    phone: v => v.trim() && !/^[+\d][\d\s()-]{6,18}$/.test(v.trim()) ? "Enter a valid phone number, or leave this blank." : "",
    date: v => v && v < dateInput.min ? "Choose today or a future date." : "",
    message: v => v.trim().length < 10 ? "Please write at least 10 characters so we know how to help." : ""
  };

  function check(field) {
    const input = form.elements[field];
    const msg = rules[field](input.value);
    const wrap = input.closest(".field");
    wrap.classList.toggle("invalid", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    $("#" + field + "-err").textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach(f => {
    form.elements[f].addEventListener("blur", () => check(f));
    form.elements[f].addEventListener("input", () => { if (form.elements[f].closest(".field").classList.contains("invalid")) check(f); });
  });

  function show(type, title, text) {
    status.hidden = false;
    status.className = "form-status" + (type === "err" ? " err" : "");
    status.innerHTML = "";
    const s = document.createElement("strong"); s.textContent = title;
    const p = document.createElement("span"); p.textContent = text;
    status.append(s, p);
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    status.hidden = true;
    const results = Object.keys(rules).map(check);
    if (results.includes(false)) {
      const first = form.querySelector(".invalid input, .invalid textarea");
      if (first) first.focus();
      return;
    }
    if (form.elements.company.value) return; // honeypot: bots only

    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true; btn.textContent = "Sending...";

    try {
      if (!CONFIG.FORM_ENDPOINT) {
        // DEMO MODE: nothing is sent anywhere.
        await new Promise(r => setTimeout(r, 600));
        show("ok", "Demo only: your request was not sent.", "This website is not yet connected to a form service. See the README to connect one before launch.");
      } else {
        const data = Object.fromEntries(new FormData(form).entries());
        delete data.company;
        const res = await fetch(CONFIG.FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Bad response");
        show("ok", "Request received.", "Thank you. The practice will contact you to confirm an appointment time. This is a request, not a confirmed booking.");
      }
      form.reset();
      $$(".field", form).forEach(f => f.classList.remove("invalid"));
    } catch (err) {
      show("err", "We couldn't send your request.", CONFIG.PHONE ? "Please try again or call " + CONFIG.PHONE + "." : "Please try again, or contact the practice directly.");
    } finally {
      btn.disabled = false; btn.textContent = "Send request";
      status.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  });
})();
