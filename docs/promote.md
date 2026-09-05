# Where the URL goes

Copy-paste ready. Nothing here needs editing except where marked.

**Live:** https://hackwithsahil.vercel.app

---

## 1. LinkedIn — Featured section (highest value)

Profile → Add profile section → Recommended → **Add featured** → Add a link.

- **URL:** `https://hackwithsahil.vercel.app`
- **Title:** `Portfolio — SOC detection & VAPT lab`
- **Description:**

> Detection coverage mapped to MITRE ATT&CK, lab-scoped case studies, and an
> interactive shell. Built with Next.js and WebGL; ships with CSP, HSTS and a
> published security.txt.

## LinkedIn — headline

Replace the current one:

```
SOC Analyst (L1) · VAPT · Blue Team | Wazuh · Splunk · MITRE ATT&CK | Immediate joiner
```

## LinkedIn — About, first line

Put the link at the top. Recruiters stop reading fast:

```
Portfolio: https://hackwithsahil.vercel.app
```

---

## 2. GitHub profile README

Create a repo named exactly `sahilnikam2410` (public, tick "Add a README").
GitHub then shows it on your profile. Paste this in:

```markdown
### Sahil Anil Nikam — SOC Analyst (L1) · VAPT · Blue Team

I run both sides of the attack: simulate it mapped to MITRE ATT&CK, then prove
the SIEM catches it.

**Portfolio:** https://hackwithsahil.vercel.app · **Resume:** https://hackwithsahil.vercel.app/resume.json

- SOC internship at ESCOSS LLP — deployed and administered Wazuh, implemented Splunk
- Certified across all five SevenMentors SOC modules: Networking, Linux, CEH, WAPT, Python
- Founder & security lead, Vrikaan — phishing and scam detection at consumer scale
- B.Tech CSE, Sandip University, 2026 — CGPA 8.53

**Working with:** Wazuh · Splunk · Sysmon · MITRE ATT&CK · Nmap · Wireshark · Burp Suite · Kali · Python

Open to SOC / VAPT / security analyst roles. Immediate joiner.
```

## GitHub — portfolio repo settings

Repo → About (gear icon, top right):

- **Description:** `SOC & VAPT portfolio — Next.js, WebGL, hardened headers, CI-tested`
- **Website:** `https://hackwithsahil.vercel.app`
- **Topics:** `nextjs` `react-three-fiber` `webgl` `portfolio` `cybersecurity` `soc-analyst` `mitre-attack` `wazuh`

---

## 3. YouTube — channel About

Studio → Customisation → Basic info → Description, append:

```
Portfolio: https://hackwithsahil.vercel.app
```

Also add it under **Links** so it shows on the channel banner.

---

## 4. Resume PDFs

The five PDFs under `public/resumes` do not carry the URL yet — I cannot edit
their contents. On your next export, put it in the contact line beside the
email:

```
sahilnikam133@gmail.com · +91 8329935878 · hackwithsahil.vercel.app · linkedin.com/in/sahil-nikam
```

Drop the updated files back into `public/resumes` with the same filenames and
the site picks them up with no code change.

---

## 5. Anywhere else worth 30 seconds

- Email signature
- TryHackMe / HackTheBox profile bio
- The pinned comment on your first YouTube upload
