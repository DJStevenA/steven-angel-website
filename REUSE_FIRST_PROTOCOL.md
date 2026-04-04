# Reuse-First Protocol
## "Check What We Already Have Before Building Anything New"

---

## The Rule
Before writing new code, adding a new service, or paying for a new tool — **always check if the existing codebase already solves the problem.**

## When to Apply
Every time a new requirement comes up:
- New feature request
- Bug fix
- Integration with external service
- New functionality needed

## The Protocol (Step by Step)

### Step 1: Define the Problem
Write one sentence describing what you need.
> Example: "I need the contact form to send emails to dj.steven.angel@gmail.com"

### Step 2: Map Existing Capabilities
Before looking at external solutions, check:

**A. Existing Backend Services**
- What endpoints already exist?
- What APIs are already connected?
- What credentials/tokens are already set up?

For steven-angel.com:
| Service | URL | What It Does | Credentials |
|---------|-----|-------------|-------------|
| Railway Backend | ghost-backend-production-adb6.up.railway.app | Express server | Gmail App Password, Dropbox Token, PayPal |
| Netlify | steven-angel.com | Static hosting + deploy | GitHub auto-deploy |
| GitHub | DJStevenA/steven-angel-website | Source code | gh CLI authenticated |
| GitHub | DJStevenA/ghost-backend | Backend code | auto-deploy to Railway |

**B. Existing Libraries & Functions**
- What npm packages are already installed?
- What utility functions already exist?
- What patterns are already used?

For the backend:
| Capability | Library | Already Used In |
|-----------|---------|----------------|
| Send emails | nodemailer | /sign-first endpoint |
| Create PDFs | pdfkit | Agreement PDF generation |
| PayPal payments | fetch + PayPal API | /create-order endpoint |
| Dropbox file management | fetch + Dropbox API | Folder creation in /sign-first |
| CORS handling | cors | All endpoints |

**C. Existing Infrastructure**
- What environment variables are set up?
- What authentication flows exist?
- What databases/storage is available?

### Step 3: Find the Match
Ask: "Can any existing capability solve this problem?"

Example thought process:
```
Problem: "Send contact form emails"

Option A: Netlify Forms → Requires paid plan ($19/mo)
Option B: New email service (SendGrid) → New account, new API key, new dependency
Option C: Railway backend already has nodemailer + Gmail → FREE, 5 minutes of work

Winner: Option C ✅
```

### Step 4: Implement Using Existing Resources
If a match is found:
- Add a new endpoint/function to the existing service
- Reuse existing credentials and libraries
- Follow the same patterns already in the code

### Step 5: Only Build New If Nothing Exists
If no match is found after Steps 2-3:
- Document why existing resources can't solve this
- Choose the simplest external solution
- Prefer free/open-source over paid services
- Prefer adding to existing services over creating new ones

---

## Quick Checklist (Copy-Paste for New Tasks)

```
Before building:
[ ] Checked existing backend endpoints
[ ] Checked installed npm packages
[ ] Checked existing API credentials/tokens
[ ] Checked if similar functionality already exists
[ ] Confirmed no existing resource can solve this
```

## Architecture Reference: steven-angel.com

```
Frontend (Netlify)              Backend (Railway)
├── / (homepage)                ├── POST /sign-first
├── /ghost                      │   └── Creates Dropbox folder
├── /sign                       │   └── Generates PDF
│                               │   └── Sends email (nodemailer)
│   Contact forms ──────────►  │   └── Creates PayPal order
│   (fetch to Railway)          ├── POST /create-order
│                               ├── GET  /download-pdf/:token
│                               ├── POST /contact-form  ← NEW
│                               │   └── Sends email to Gmail
│                               │
│                               Environment:
│                               ├── GMAIL_USER
│                               ├── GMAIL_APP_PASSWORD
│                               ├── PAYPAL_CLIENT_ID
│                               ├── PAYPAL_SECRET
│                               ├── DROPBOX_TOKEN
│                               └── FRONTEND_URL
```

## Real Examples from This Project

| Problem | Expensive Solution | Reuse-First Solution |
|---------|-------------------|---------------------|
| Contact form email | Netlify Forms ($19/mo) | Railway backend + existing nodemailer |
| Ghost page source lost | Rebuild from scratch | Reconstruct from minified build |
| Font loading slow | CDN + external request | Self-host woff2 + inline in HTML |
| Image optimization | Cloudinary ($) | ffmpeg local conversion to WebP |
| GitHub push | Install gh CLI | Download binary to /tmp |

---

## Summary
**The cheapest and fastest code is code that already exists.**
Always look at what you have before reaching for something new.
