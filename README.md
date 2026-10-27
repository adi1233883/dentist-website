# Lally Dr Andrew & Conor, Dental Surgeons: Website

Static site: HTML5, CSS3, vanilla JS. No build step.

## Folder structure

```
lally-dental/
  index.html
  style.css
  script.js          <- CONFIG block at the top (phone, email, form endpoint, LAUNCHED)
  favicon.svg
  assets/
    hero-placeholder.svg
    exterior-placeholder.svg
  README.md
```

## Run locally

Option 1: double-click `index.html`.
Option 2 (recommended): `cd lally-dental && python3 -m http.server 8000`, then open http://localhost:8000

## Deploy free

**Netlify:** drag the `lally-dental` folder onto https://app.netlify.com/drop.
**GitHub Pages:** push the folder to a repo, then Settings > Pages > Deploy from branch (`main`, `/root`).
**Cloudflare Pages:** connect the repo, build command empty, output directory `/`.

After deploying, update `<link rel="canonical">` and `og:` tags in `index.html` with the real URL.

## Images

Placeholders are used on purpose. Do **not** reuse the Google Maps / Street View or search-result images from the reference screenshots (not licensed for reuse).
- Hero: add a licensed photo (Unsplash / Pexels, check the licence) as `assets/hero.jpg` (about 1280x1040, under 200 KB) and change the `src` in the hero `<img>`.
- Entrance: ask the practice for its own photo, save as `assets/clinic-exterior.jpg`, update the `src` in the About section.
- Update the `alt` text to describe the real photos.

## Business details to verify before launch

1. Phone number (set `CONFIG.PHONE`). The search screenshot shows a partly cut-off number, so it was not used.
2. Email address (`CONFIG.EMAIL`) and website URL.
3. Full weekly opening hours. Mon-Fri 9:00-6:00 and Sat/Sun closed were taken from a third-party listing image, and Maps shows "opens 9 am". Edit the `<table>` in `#hours`.
4. Which services are really offered; remove or rename cards in `#services`.
5. Dentists' names and qualifications for the About section (the sign in the screenshot suggests degrees, but it was cropped, so they are not used).
6. The 4.7 rating / 13 reviews (seen in the 27 Oct 2026 screenshot) and the correct Google reviews link.
7. Wheelchair accessibility and "ground floor" (from Google Maps, auto-generated).
8. Exact Google Maps listing / embed.
9. Eircode / postcode, if the practice wants it shown.
10. Privacy Policy and Accessibility Statement text (drafts only; legal review needed, GDPR).
11. Whether the practice is correctly described (Maps category says "Oral surgeon").

When all are confirmed, set `LAUNCHED: true` in `script.js` to hide the yellow verify markers, then add `telephone`, `url`, `openingHoursSpecification` and `aggregateRating` to the JSON-LD in `index.html`.

## Backend integrations still required

- **Contact form:** currently demo mode (nothing is sent and the success message says so). Create a form at Formspree, Netlify Forms or Web3Forms, then paste the endpoint into `CONFIG.FORM_ENDPOINT`. Test an email arrives.
- **Spam protection:** a honeypot is included; add reCAPTCHA / hCaptcha / Turnstile if spam appears.
- **GDPR:** consent wording and data-processor agreement with the form provider.
- **Optional:** Google Business Profile reviews widget, analytics (with cookie consent if used), online booking system.
