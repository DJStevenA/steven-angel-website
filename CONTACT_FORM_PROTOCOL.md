# Contact Form → Email Protocol
## How to connect a website form to email (Gmail inbox)

---

## Goal
When someone fills a contact form on the website, an email arrives at `dj.steven.angel@gmail.com` with all the form details (name, email, message, etc).

---

## The Problem We Solved

### What didn't work:

**1. Netlify Forms** — requires paid plan ($19/mo) for email notifications. Free tier only stores submissions in the dashboard.

**2. Gmail SMTP (nodemailer)** — App Passwords expire when you change your Google password or disable 2FA. Also, Gmail SMTP connections timeout from cloud servers (Railway) because of cold starts and SMTP handshake delays.

**3. Gmail App Password** — not permanent. Google can revoke it at any time. Not suitable for production.

### What works:

**Resend API** — free (100 emails/day), API key that doesn't expire, simple HTTP fetch (no SMTP), works from any cloud server.

---

## Architecture

```
User fills form on website
        ↓
Frontend (React) sends POST to Railway backend
        ↓
Backend calls Resend API
        ↓
Resend sends email to dj.steven.angel@gmail.com
        ↓
Email arrives in Gmail inbox
```

```
steven-angel.com          Railway backend               Resend API
(Netlify)                 (ghost-backend)               (resend.com)

Form submit ──POST──→  /contact endpoint ──API──→  sends email
                          ↓                            ↓
                        returns                     delivers to
                        {success:true}              Gmail inbox
```

---

## Setup (One-Time)

### 1. Create Resend Account
- Go to https://resend.com
- Sign up with GitHub (one click)
- Get API key from dashboard (starts with `re_`)
- Free tier: 100 emails/day, 3000/month

### 2. Add API Key to Railway
- Railway dashboard → ghost-backend → Variables
- Add: `RESEND_API_KEY` = `re_your_key_here`
- Deploy

### 3. Install resend package
```bash
cd ghost-backend
npm install resend
```

---

## Backend Code (Node.js / Express)

```javascript
// At the top of index.js
const { Resend } = require("resend");

// Contact form endpoint
app.post("/contact", async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.name || !b.email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const emailBody = [
      `New contact from ${b.source || "website"}`,
      ``,
      `Name: ${b.name}`,
      `Email: ${b.email}`,
      b.phone ? `Phone: ${b.phone}` : null,
      b.reference ? `Reference: ${b.reference}` : null,
      b.genre ? `Genre: ${b.genre}` : null,
      b.service ? `Service: ${b.service}` : null,
      b.message ? `\nMessage:\n${b.message}` : null,
    ].filter(Boolean).join("\n");

    await resend.emails.send({
      from: "Steven Angel Website <onboarding@resend.dev>",
      to: process.env.GMAIL_USER,  // dj.steven.angel@gmail.com
      reply_to: b.email,           // so you can reply directly to the lead
      subject: `[NEW LEAD] ${b.name}`,
      text: emailBody,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("[CONTACT] Error:", err.message);
    res.status(500).json({ error: err.message || "Failed" });
  }
});
```

### Key Details:
- `from`: Must be `onboarding@resend.dev` on free tier (or your verified domain)
- `reply_to`: Set to the lead's email so you can reply directly from Gmail
- `subject`: `[NEW LEAD]` prefix makes it easy to filter in Gmail
- `to`: Uses `GMAIL_USER` env variable (not hardcoded)

---

## Frontend Code (React)

```jsx
<form
  onSubmit={(e) => {
    e.preventDefault();
    const form = e.target;
    const data = Object.fromEntries(new FormData(form));
    data.source = "ghost-page"; // or "homepage" — identifies which form

    fetch("https://ghost-backend-production-adb6.up.railway.app/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          alert("Message sent! I'll get back to you within 24 hours.");
          form.reset();
        } else {
          alert("Something went wrong. Please try WhatsApp instead.");
        }
      })
      .catch(() => alert("Something went wrong. Please try WhatsApp instead."));
  }}
>
  <input name="name" placeholder="Your name" required />
  <input name="email" type="email" placeholder="Your email" required />
  <textarea name="message" placeholder="Message" />
  <button type="submit">Send</button>
</form>
```

### Key Details:
- No `method="POST"` or `action` needed — we handle submit in JS
- `Object.fromEntries(new FormData(form))` converts form to JSON
- `data.source` identifies which page the lead came from
- Always show a fallback (WhatsApp) if something fails

---

## CORS Configuration

The backend must allow requests from the frontend domain:

```javascript
// In index.js — allow all origins
app.use(cors({ origin: true }));
```

**Why `origin: true`?** Because the site can be accessed from both `steven-angel.com` and `www.steven-angel.com`. Using a specific URL would block one of them.

---

## Environment Variables (Railway)

| Variable | Value | Purpose |
|----------|-------|---------|
| `RESEND_API_KEY` | `re_...` | Resend API authentication |
| `GMAIL_USER` | `dj.steven.angel@gmail.com` | Email recipient |
| `FRONTEND_URL` | `https://steven-angel.com` | (legacy, not used for CORS anymore) |

---

## Testing

### From terminal:
```bash
curl -s -X POST "https://ghost-backend-production-adb6.up.railway.app/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"your@email.com","message":"Test message","source":"cli-test"}'
```

Expected response: `{"success":true}`

### From Gmail:
Search: `subject:[NEW LEAD]` — should see the test email.

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `{"error":"Name and email are required"}` | Empty form fields | Check form `name` attributes match backend |
| CORS error in browser console | Backend doesn't allow frontend origin | Set `cors({ origin: true })` |
| `{"success":true}` but no email | Wrong Resend API key | Check `RESEND_API_KEY` in Railway |
| Email in spam | Using `onboarding@resend.dev` sender | Add custom domain in Resend for branded sender |
| Form shows "something went wrong" | Backend is sleeping (Railway cold start) | First request wakes server (~5s), retry works |

---

## Why NOT Gmail SMTP / App Passwords

1. **App Passwords expire** — when you change your Google password, all App Passwords are revoked
2. **SMTP timeouts** — Gmail SMTP handshake takes 3-10 seconds from cloud servers, often exceeding request timeouts
3. **Cold start + SMTP** — Railway/Heroku servers sleep after inactivity. Waking up + SMTP handshake = guaranteed timeout
4. **Resend is free** — 100 emails/day, API key doesn't expire, instant delivery via HTTP (not SMTP)

---

## Files Reference

| File | Location | What it does |
|------|----------|-------------|
| Backend endpoint | `ghost-backend/index.js` → `/contact` | Receives form data, sends email via Resend |
| Ghost page form | `src/Ghost.jsx` → line ~1935 | Contact form on /ghost page |
| Homepage form | `src/App.jsx` → line ~641 | Contact form on homepage |
| Backend repo | github.com/DJStevenA/ghost-backend | Auto-deploys to Railway on push |
| Frontend repo | github.com/DJStevenA/steven-angel-website | Auto-deploys to Netlify on push |
