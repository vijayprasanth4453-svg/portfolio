# V. Vijayprasanth — Portfolio

A premium, production-ready Full Stack Developer portfolio with a real Node.js contact backend, SEO, accessibility (WCAG 2.2) and a modern SaaS design system.

**Stack:** HTML5 · CSS3 · Vanilla JS (canvas particles, radar chart, typing, tilt) · Node.js · Express · Nodemailer

---

## 📁 Project structure

```
portfolio/
├── index.html              # Single-page site
├── css/style.css           # Full design system
├── js/script.js            # Interactions, animations, contact workflow
├── js/particles.js         # Canvas particle background + mouse interaction
├── assets/
│   ├── images/             # Add og-image.png, project images
│   ├── icons/
│   └── resume/             # Add V-Vijayprasanth-Resume.pdf
├── server/
│   ├── server.js           # Express app (security, rate limiting)
│   ├── routes/contact.routes.js
│   ├── controllers/contact.controller.js
│   ├── middleware/validate.js
│   ├── package.json
│   └── .env.example        # Copy to .env and fill in
├── robots.txt
├── sitemap.xml
└── README.md
```

---

## 🚀 Quick start

### 1. Frontend (static)

Serve the root folder with any static server, e.g. the VS Code **Live Server** extension, or:

```powershell
# from the portfolio/ folder
npx serve .
```

Open the printed URL (e.g. `http://localhost:3000`).

### 2. Backend (contact API)

```powershell
cd server
npm install
Copy-Item .env.example .env
# edit .env with your Gmail App Password
npm start
```

The API runs on `http://localhost:5000`. Health check: `GET /api/health`.

> The frontend posts to `http://localhost:5000/api/contact`. Update `API_URL` at the top of `js/script.js` to your deployed backend URL in production.

---

## 📧 Email setup (Gmail SMTP)

1. Enable 2-Step Verification on your Google account.
2. Create an **App Password**: https://myaccount.google.com/apppasswords
3. In `server/.env` set:
   ```env
   GMAIL_USER=vijayprasanth2702@gmail.com
   GMAIL_APP_PASSWORD=your_16_char_app_password
   CONTACT_RECEIVER=vijayprasanth2702@gmail.com
   ALLOWED_ORIGINS=https://vijayprasanth.dev,http://localhost:3000
   ```

The backend sends a notification to you **and** an auto-reply to the visitor, and stores every message in `server/data/messages.json`.

### EmailJS fallback (optional, client-only)

In `js/script.js`, set `EMAILJS.enabled = true` and fill in your `serviceId`, `templateId`, `publicKey`, then include the EmailJS SDK in `index.html`. If the backend is unreachable, the form falls back to EmailJS.

---

## 🔄 Contact workflow

```
Visitor submits form
        ↓
Client-side validation (live + on submit)
        ↓
POST /api/contact  (JSON)
        ↓
Server validation + sanitization + rate limit + honeypot
        ↓
Store message  →  Send owner email  →  Send auto-reply
        ↓
Success toast (or graceful error)
```

---

## 🔐 Security

- `helmet` security headers
- CORS allow-list via `ALLOWED_ORIGINS`
- Rate limiting (5 requests / 15 min / IP)
- Input validation, length limits & HTML escaping (XSS-safe)
- Honeypot field to block bots
- Secrets kept in `.env` (git-ignored)

---

## ♿ Accessibility (WCAG 2.2)

- Semantic landmarks, skip link, ARIA labels
- Full keyboard navigation + visible focus styles
- `prefers-reduced-motion` honored across all animations
- Accessible color contrast and live-region toasts

---

## 🔎 SEO

- Meta tags, canonical URL, Open Graph & Twitter Cards
- `Person` Schema.org JSON-LD
- `robots.txt` + `sitemap.xml`

Update the domain (`https://vijayprasanth.dev/`) in `index.html`, `robots.txt` and `sitemap.xml` to your real domain.

---

## ⚡ Performance

- No frameworks; deferred scripts; system fonts fallback
- Canvas capped particle count + DPR clamp
- IntersectionObserver-driven lazy animations
- Optimize/replace emoji project art with real WebP images in `assets/images/`

---

## ☁️ Deployment

### Frontend → Vercel / Netlify / GitHub Pages
Deploy the repository root as a static site. Set `API_URL` in `js/script.js` to your backend URL.

### Backend → Render / Railway / AWS / Fly.io
- Root directory: `server`
- Build: `npm install`
- Start: `npm start`
- Add the `.env` variables in the host dashboard
- Add your frontend domain to `ALLOWED_ORIGINS`

---

## ✅ To personalize

- [ ] Add `assets/resume/V-Vijayprasanth-Resume.pdf`
- [ ] Add `assets/images/og-image.png` (1200×630)
- [ ] Replace project GitHub/demo links
- [ ] Update social links (GitHub, LinkedIn)
- [ ] Set your real domain across SEO files

---

© V. Vijayprasanth — MIT License
