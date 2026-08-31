// ─────────────────────────────────────────────────────────────
//  EDIT EVERYTHING HERE. This is the only file you need to touch
//  to change what the site says. Components read from it.
//  Sourced from the five role-targeted resumes in /public/resumes.
// ─────────────────────────────────────────────────────────────

export const identity = {
  name: 'Sahil Anil Nikam',
  handle: 'sahil',
  role: 'SOC Analyst (L1) · VAPT · Blue Team',
  tagline:
    'I run both sides of the attack: simulate it mapped to MITRE ATT&CK, then prove the SIEM catches it.',
  location: 'Shirdi, Maharashtra · open to Pune / Mumbai / Bengaluru / Hyderabad / Gurugram',
  status: 'Immediate joiner',
  email: 'sahilnikam133@gmail.com',
  phone: '+91 8329935878',
  resumeUrl: '/resumes/Sahil_Nikam_SOC_Analyst.pdf',
  bio: [
    'B.Tech Computer Science graduate (Sandip University, 2026, CGPA 8.53) working across SOC operations and offensive security. Three-month SOC Analyst internship at ESCOSS LLP deploying and administering Wazuh, implementing Splunk, and building integrations that centralised log collection across Windows and Linux endpoints.',
    'Certified across all five modules of the SevenMentors SOC Analyst Program — Networking, Linux, CEH, WAPT and Python for SOC. The work I care about is the loop: run a controlled red-team technique in an owned lab, map it to MITRE ATT&CK, then check whether the detection stack actually fired — and write the rule when it did not.',
    'Founder and security lead at Vrikaan, an AI threat-detection platform covering phishing and scam detection, real-time monitoring and dark-web exposure scanning. Recognised in "The Cyber 50 — India\'s Elite Founders List" by Indian Startup Times.',
  ],
};

/** Role-targeted CVs. The contact section lets recruiters pick the relevant one. */
export const resumes = [
  { role: 'SOC Analyst (L1)', file: '/resumes/Sahil_Nikam_SOC_Analyst.pdf', note: 'Blue team · SIEM · IR' },
  { role: 'VAPT / Security Analyst', file: '/resumes/Sahil_Nikam_VAPT_Security_Analyst.pdf', note: 'WAPT · OWASP · red team' },
  { role: 'Jr Network Analyst', file: '/resumes/Sahil_Nikam_Jr_Network_Analyst.pdf', note: 'Traffic & protocol analysis' },
  { role: 'L1 Network Engineer', file: '/resumes/Sahil_Nikam_L1_Network_Engineer.pdf', note: 'NOC · CCNA fundamentals' },
  { role: 'System Administrator', file: '/resumes/Sahil_Nikam_System_Administrator.pdf', note: 'Windows · Linux · virtualisation' },
];

export const socials = [
  { label: 'GitHub', href: 'https://github.com/sahilnikam2410', handle: 'sahilnikam2410' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/sahil-nikam', handle: '/in/sahil-nikam' },
  { label: 'YouTube', href: 'https://www.youtube.com/@HackWithSahilYT', handle: '@HackWithSahilYT' },
  { label: 'Vrikaan', href: 'https://vrikaan.com', handle: 'vrikaan.com' },
  { label: 'Email', href: 'mailto:sahilnikam133@gmail.com', handle: 'sahilnikam133@gmail.com' },
];

export const stats = [
  { value: '5/5', label: 'SOC program modules certified' },
  { value: '3 mo', label: 'Enterprise SOC internship' },
  { value: '8.53', label: 'B.Tech CGPA / 10' },
  { value: 'Cyber 50', label: "India's elite founders list" },
];

// Grouped by where the evidence comes from — no invented proficiency numbers.
export const skills = [
  {
    group: 'SOC & Blue Team',
    evidence: 'ESCOSS internship + Silent Operator lab',
    items: [
      'Wazuh — deploy & administer',
      'Splunk',
      'Sysmon & Windows Event Logs',
      'Log correlation',
      'Alert triage',
      'Incident response',
      'Threat hunting',
      'MITRE ATT&CK mapping',
      'Active-response automation',
      'Security configuration assessment',
      'SOC reporting & escalation',
    ],
  },
  {
    group: 'Offensive / VAPT',
    evidence: 'CEH + WAPT certified — SevenMentors',
    items: [
      'Web app penetration testing',
      'Vulnerability assessment',
      'OWASP Top 10',
      'SQL injection',
      'Burp Suite',
      'DVWA',
      'Nmap recon & enumeration',
      'Red-team attack simulation',
      'Session-hijacking analysis',
      'Structured vulnerability reporting',
    ],
  },
  {
    group: 'Network, Systems & Code',
    evidence: 'Networking + Linux certified · multi-host labs',
    items: [
      'TCP/IP · DNS · DHCP · HTTP/S',
      'CCNA fundamentals',
      'Wireshark packet analysis',
      'Firewalls & VPN concepts',
      'Linux (Kali, Ubuntu) CLI',
      'Windows 10 / Server admin',
      'VirtualBox multi-host labs',
      'Endpoint agent deployment',
      'System hardening',
      'Python · Bash · C · C++ · Java',
    ],
  },
];

export const projects = [
  {
    id: 'silent-operator',
    title: 'The Silent Operator',
    kind: 'Final-Year Project · 2025–2026 · SOC detection + red team',
    summary:
      'End-to-end SOC lab — Wazuh SIEM, Kali Linux, Windows 10, VirtualBox — ingesting Sysmon and system logs from multiple endpoints into centralised dashboards. Controlled red-team attacks are executed against it, mapped to MITRE ATT&CK, then hunted from the defender side to find out what the stack missed.',
    stack: ['Wazuh', 'Sysmon', 'MITRE ATT&CK', 'Kali', 'Windows 10', 'VirtualBox'],
    highlights: [
      'Simulated attacks mapped technique-by-technique to ATT&CK',
      'Detected via log correlation, custom alert rules, triage and threat hunting',
      'Exposed detection gaps, then closed them with new rules',
    ],
    href: 'https://github.com/sahilnikam2410',
  },
  {
    id: 'protocol-honeypot',
    title: 'Protocol Honeypot',
    kind: 'Security Project · 2025 · Network IDS',
    summary:
      'A network-based intrusion detection system and honeypot built to attract, capture and analyse real reconnaissance and unauthorised access attempts, profiling attacker behaviour into alerts an analyst can act on rather than raw noise.',
    stack: ['IDS', 'Honeypot', 'Log correlation', 'Linux'],
    highlights: [
      'Captures and logs unauthorised access and recon traffic',
      'Correlates attacker behaviour into actionable alerts',
      'Profiles technique patterns rather than single events',
    ],
    href: 'https://github.com/sahilnikam2410',
  },
  {
    id: 'protocol-cinema',
    title: 'Protocol Cinema',
    kind: 'Security Research · 2025 · Covert-channel C2',
    summary:
      'Research into a steganographic command-and-control technique that tunnels data through public APIs. Studied in an authorised lab, then translated into detection logic for anomalous outbound channels and mapped to MITRE ATT&CK.',
    stack: ['Covert channels', 'Traffic analysis', 'Detection engineering', 'MITRE ATT&CK'],
    highlights: [
      'Analysed covert exfiltration over legitimate public APIs',
      'Converted observed TTPs into detection logic',
      'Lab-only — no live third-party infrastructure involved',
    ],
    href: 'https://github.com/sahilnikam2410',
  },
  {
    id: 'monitoring-lab',
    title: 'Multi-Endpoint Monitoring Lab',
    kind: 'Infrastructure · 2025–2026',
    summary:
      'Multi-host lab (Windows 10, Kali Linux, VirtualBox) with agent-based log forwarding from several endpoints into centralised dashboards — network configuration, host connectivity and full-fleet visibility, built from scratch and documented.',
    stack: ['Wazuh agents', 'Splunk', 'VirtualBox', 'Centralised logging'],
    highlights: [
      'Endpoint agents deployed and configured across hosts',
      'Simulated attack traffic analysed to find detection gaps',
      'Dashboards built for network and system telemetry',
    ],
    href: 'https://github.com/sahilnikam2410',
  },
  {
    id: 'vrikaan',
    title: 'Vrikaan — AI Threat Detection Platform',
    kind: 'Founder & Security Lead · 2024–present',
    summary:
      'Consumer-facing platform for phishing and scam detection, real-time monitoring and dark-web exposure scanning. Live phishing and social-engineering campaigns are analysed and converted into automated detection and classification logic.',
    stack: ['Threat detection', 'Phishing analysis', 'LLM routing', 'Production ops'],
    highlights: [
      'Multi-tier routing architecture: heavy reasoning vs high-volume classification',
      'Attacker techniques turned into automated classification logic',
      'Recognised in "The Cyber 50 — India\'s Elite Founders List"',
    ],
    href: 'https://vrikaan.com',
  },
];

/**
 * Detection coverage — attack run in an owned lab, then hunted from the
 * defender side. `status` is the honest outcome, not a marketing claim:
 *   detected  → the stack alerted on it as configured
 *   gap→rule  → nothing fired; a rule was written and re-tested
 *   research  → analysed and turned into detection logic, lab only
 * Edit these rows as your lab grows. Do not list anything you have not run.
 */
export const coverage = [
  {
    id: 'T1110',
    technique: 'Brute Force',
    tactic: 'Credential Access',
    run: 'Repeated failed SSH / RDP authentication against lab endpoints',
    signal: 'Wazuh auth rules — active response auto-blocked the source',
    status: 'detected',
    where: 'ESCOSS internship + lab',
  },
  {
    id: 'T1059',
    technique: 'Command & Scripting Interpreter',
    tactic: 'Execution',
    run: 'PowerShell and shell execution during red-team simulation',
    signal: 'Sysmon process-creation events correlated in Wazuh',
    status: 'detected',
    where: 'The Silent Operator',
  },
  {
    id: 'T1046',
    technique: 'Network Service Discovery',
    tactic: 'Discovery',
    run: 'Nmap host discovery and service enumeration across the lab subnet',
    signal: 'Honeypot capture + IDS alerting on scan patterns',
    status: 'detected',
    where: 'Protocol Honeypot',
  },
  {
    id: 'T1190',
    technique: 'Exploit Public-Facing Application',
    tactic: 'Initial Access',
    run: 'SQL injection against DVWA across all security levels',
    signal: 'Web request patterns reviewed; remediation documented per finding',
    status: 'gap→rule',
    where: 'WAPT module',
  },
  {
    id: 'T1071.001',
    technique: 'Application Layer Protocol: Web',
    tactic: 'Command & Control',
    run: 'Covert channel tunnelling data through public APIs',
    signal: 'Outbound anomaly logic derived from observed traffic behaviour',
    status: 'research',
    where: 'Protocol Cinema',
  },
  {
    id: 'T1566',
    technique: 'Phishing',
    tactic: 'Initial Access',
    run: 'Live phishing and social-engineering campaigns analysed',
    signal: 'Converted into automated detection and classification logic',
    status: 'detected',
    where: 'Vrikaan',
  },
  {
    id: 'T1562',
    technique: 'Impair Defenses',
    tactic: 'Defense Evasion',
    run: 'Agent stop / log-clearing attempts on monitored endpoints',
    signal: 'Agent-disconnect and event-log-cleared rules added after the gap',
    status: 'gap→rule',
    where: 'Multi-Endpoint Lab',
  },
];

export const certs = [
  { name: 'SOC Analyst Program — all 5 modules', issuer: 'SevenMentors Pvt. Ltd.', year: 'Networking · Linux · CEH · WAPT · Python' },
  { name: 'Cybersecurity Analyst Job Simulation', issuer: 'TATA / Forage', year: '2024' },
  { name: 'Cybersecurity', issuer: 'Tech Mahindra Foundation / Skill India', year: '2024' },
  { name: 'IT Security Foundations: Network Security', issuer: 'LinkedIn Learning', year: '2025' },
  { name: 'Ethical Hacking: SQL Injection', issuer: 'LinkedIn Learning', year: '2024' },
  { name: 'B.Tech Computer Science & Engineering', issuer: 'Sandip University', year: '2022–2026 · CGPA 8.53' },
];

export const timeline = [
  {
    year: 'Mar–Jun 2026',
    title: 'SOC Analyst Intern — ESCOSS LLP',
    body: 'Deployed and administered Wazuh, implemented Splunk, centralised logs across Windows and Linux endpoints. Monitored events, correlated logs, triaged alerts and ran incident response. Configured active response to auto-contain brute-force attempts. Certified by the COO and Director.',
  },
  {
    year: '2024 – present',
    title: 'Founder & Security Lead — Vrikaan',
    body: 'AI threat-detection platform: phishing and scam detection, real-time monitoring, dark-web exposure scanning. Named in "The Cyber 50 — India\'s Elite Founders List".',
  },
  {
    year: 'Aug–Sep 2023',
    title: 'Cyber Security Intern — Academor',
    body: 'Nmap scanning and reconnaissance; analysed phishing, DoS/DDoS and session-hijacking techniques defensively; cryptography and ethical-hacking labs on Kali Linux.',
  },
  {
    year: '2022 – 2026',
    title: 'B.Tech CSE — Sandip University',
    body: 'CGPA 8.53 / 10. Final-year work: The Silent Operator, a SOC detection and red-team simulation lab.',
  },
];

export const ethics = {
  title: 'Scope & ethics',
  body:
    'Every technique referenced here was executed inside authorised environments — my own VirtualBox lab hosts, DVWA, and systems I was engaged to assess. Attack simulation is always paired with the detection or hardening that answers it: that pairing is the whole point of the work, not a disclaimer on it.',
};

export const terminalBoot = [
  { cmd: 'whoami', out: ['sahil — SOC Analyst (L1) / VAPT'] },
  { cmd: 'cat /etc/status', out: ['immediate joiner · Shirdi, MH · open to relocation'] },
  {
    cmd: 'wazuh-control status',
    out: [
      'wazuh-manager      is running',
      'wazuh-indexer      is running',
      'agents: 4 active   (2x windows, 2x linux)',
      'rules loaded: custom + MITRE ATT&CK mapping',
    ],
  },
  { cmd: './portfolio --render', out: ['[ok] scene loaded', '[ok] scroll, or press ctrl+k'] },
];
