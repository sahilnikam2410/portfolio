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
  location: 'Nashik, Maharashtra · open to Pune / Mumbai / Bengaluru / Hyderabad / Gurugram',
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
    repo: 'https://github.com/sahilnikam2410/silent-operator',
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
    repo: 'https://github.com/sahilnikam2410/protocol-honeypot',
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
    repo: 'https://github.com/sahilnikam2410/protocol-cinema',
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
    repo: 'https://github.com/sahilnikam2410/monitoring-lab',
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
    site: 'https://vrikaan.com',
  },
];

/**
 * Detection coverage. Every row below traces to a line in one of the resumes —
 * see the `source` field, which is not rendered, it exists so you can defend
 * each claim in an interview.
 *
 *   detected → telemetry surfaced it and an alert fired
 *   assessed → exercised offensively, findings documented with remediation
 *   research → analysed in an authorised lab and turned into detection logic
 *
 * A fourth status, 'gap→rule' (nothing fired, rule written, re-tested), is
 * supported by the UI but deliberately unused: your resume states gaps were
 * found and closed, but not which technique. Fill those in yourself and the
 * badge appears. Do not list anything you have not personally run.
 */
export const coverage = [
  {
    id: 'T1110',
    technique: 'Brute Force',
    tactic: 'Credential Access',
    run: 'Repeated failed authentication against monitored endpoints',
    signal: 'Wazuh alerting, with active response configured to auto-contain the source',
    status: 'detected',
    where: 'ESCOSS internship',
    source: 'Resume: "Configured active-response automation to auto-contain suspicious activity such as brute-force login attempts"',
  },
  {
    id: 'T1059',
    technique: 'Command & Scripting Interpreter',
    tactic: 'Execution',
    run: 'Process execution during controlled red-team simulation',
    signal: 'Sysmon and system logs correlated in Wazuh; custom alert rules',
    status: 'detected',
    where: 'The Silent Operator',
    source: 'Resume: Sysmon + system log ingestion, red-team techniques detected via log correlation and custom alert rules',
  },
  {
    id: 'T1046',
    technique: 'Network Service Discovery',
    tactic: 'Discovery',
    run: 'Nmap host discovery and service enumeration across the lab subnet',
    signal: 'Honeypot and network IDS capture, correlated into actionable alerts',
    status: 'detected',
    where: 'Protocol Honeypot',
    source: 'Resume: IDS + honeypot capturing unauthorised access and reconnaissance traffic',
  },
  {
    id: 'T1190',
    technique: 'Exploit Public-Facing Application',
    tactic: 'Initial Access',
    run: 'SQL injection against DVWA across security levels',
    signal: 'Findings documented with remediation guidance per issue',
    status: 'assessed',
    where: 'WAPT module',
    source: 'Resume: WAPT methodology on DVWA, SQL injection, structured vulnerability reporting with remediation guidance',
  },
  {
    id: 'T1071.001',
    technique: 'Application Layer Protocol: Web',
    tactic: 'Command & Control',
    run: 'Covert channel tunnelling data through public APIs, in an authorised lab',
    signal: 'Detection logic for anomalous outbound channels derived from the observed traffic',
    status: 'research',
    where: 'Protocol Cinema',
    source: 'Resume: steganographic C2 over public APIs, TTPs translated into detection logic mapped to ATT&CK',
  },
  {
    id: 'T1566',
    technique: 'Phishing',
    tactic: 'Initial Access',
    run: 'Live phishing and social-engineering campaigns analysed',
    signal: 'Converted into automated detection and classification logic',
    status: 'detected',
    where: 'Vrikaan',
    source: 'Resume: analysed live phishing campaigns, converted attacker techniques into automated detection and classification logic',
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

/**
 * Long-form case studies, rendered at /work/<id>.
 * Every line below is drawn from the resumes — do not add anything you
 * cannot defend in an interview.
 *
 * Two optional fields per study, both empty until you fill them:
 *
 *   artifacts: [{ src: '/artifacts/wazuh-agents.png', alt: 'Wazuh agent fleet' }]
 *              → screenshot strip. Redact hostnames, public IPs, agent keys.
 *
 *   rules: [{ title: 'Brute force → active response',
 *             lang: 'xml',
 *             code: '<rule id="100210" level="10">…</rule>',
 *             note: 'Fires after 6 failures in 120s; response blocks the srcip.' }]
 *              → the actual rules you wrote. One real rule beats three
 *                paragraphs; it is the single strongest thing on this site.
 *
 * A dev-only reminder renders on any study missing both. It never ships.
 */
export const caseStudies = {
  'silent-operator': {
    diagrams: ['pipeline', 'loop'],
    objective:
      'Find out whether a detection stack I built myself would actually catch a red-team run — and record honestly where it did not.',
    environment: ['Wazuh SIEM', 'Sysmon', 'Kali Linux', 'Windows 10', 'VirtualBox', 'MITRE ATT&CK'],
    approach: [
      'Built the lab end to end: Wazuh manager, agents on every endpoint, Sysmon and system logs forwarded into centralised dashboards.',
      'Executed controlled red-team attacks against the lab hosts, one technique at a time.',
      'Mapped each technique to its MITRE ATT&CK ID before running it, so the expected telemetry was written down in advance.',
      'Hunted from the defender side: log correlation, custom alert rules, triage, threat hunting.',
    ],
    outcome: [
      'Techniques that fired an alert were recorded with the rule that caught them.',
      'Techniques that produced nothing were recorded as gaps, then closed with new rules and re-run.',
    ],

    /**
     * status: 'draft'     → written, NOT yet run in the lab. The page renders
     *                       a draft badge so it never implies otherwise.
     * status: 'validated' → you ran it, it fired, you tuned it. Flip the flag
     *                       and the badge changes. Do not flip it early: the
     *                       first interview question is always "walk me
     *                       through a time this fired".
     */
    rules: [
      {
        title: 'Brute force on Windows logon, then contain',
        lang: 'xml',
        status: 'draft',
        code: "<group name=\"local,authentication_failures,\">\n  <!-- 4625: an account failed to log on -->\n  <rule id=\"100210\" level=\"5\">\n    <if_sid>60122</if_sid>\n    <description>Windows logon failure</description>\n    <mitre><id>T1110</id></mitre>\n  </rule>\n\n  <!-- six failures from one source inside two minutes -->\n  <rule id=\"100211\" level=\"10\" frequency=\"6\" timeframe=\"120\">\n    <if_matched_sid>100210</if_matched_sid>\n    <same_source_ip />\n    <description>Brute force: 6 failed logons from $(srcip) in 120s</description>\n    <mitre><id>T1110</id></mitre>\n  </rule>\n\n  <!-- a success straight after the burst is the one to wake up for -->\n  <rule id=\"100212\" level=\"12\">\n    <if_sid>60106</if_sid>\n    <if_matched_sid>100211</if_matched_sid>\n    <same_source_ip />\n    <description>Brute force succeeded from $(srcip)</description>\n    <mitre><id>T1110</id></mitre>\n  </rule>\n</group>",
        note: 'Level 10 fires active response; level 12 is the one worth paging on, because a success following a burst is the difference between noise and a compromise. Tune the frequency before trusting it — six in two minutes is a starting point, not a measurement.',
      },
      {
        title: 'The same detection as a Sigma rule',
        lang: 'yaml',
        status: 'draft',
        code: "title: Windows brute force followed by success\nid: 0f1b2c3d-4e5f-6071-8293-a4b5c6d7e8f9\nstatus: experimental\ndescription: Repeated 4625 failures from one source, then a 4624 success\nlogsource:\n  product: windows\n  service: security\ndetection:\n  failures:\n    EventID: 4625\n  success:\n    EventID: 4624\n  timeframe: 2m\n  condition: failures | count() by IpAddress > 5 and success\nfalsepositives:\n  - Service accounts with stale cached credentials\n  - Password managers retrying after a change\nlevel: high\ntags:\n  - attack.credential_access\n  - attack.t1110",
        note: 'Sigma keeps the logic portable: the same reasoning moves to Splunk or Elastic without being rewritten.',
      },
    ],
    artifacts: [
      {
        src: '/artifacts/wazuh-soc-lab.png',
        alt: 'Wazuh Threat Hunting — the lab manager (sahil) with a WIN-SERVER-2022 agent enrolled, events flowing, a custom level-15 rule firing on the Windows host, alerts mapped to MITRE Valid Accounts and Command & Scripting. Captured 5 Sep 2026.',
      },
    ],
  },

  'protocol-honeypot': {
    diagrams: ['lifecycle'],
    objective:
      'Turn unsolicited scanning and access attempts into structured, actionable alerts instead of raw log noise.',
    environment: ['Network IDS', 'Honeypot', 'Linux', 'Log correlation'],
    approach: [
      'Designed and deployed a network-based IDS alongside a honeypot to attract and capture unauthorised access attempts.',
      'Logged reconnaissance traffic and correlated repeated behaviour into attacker profiles rather than isolated events.',
    ],
    outcome: [
      'Recon and unauthorised access attempts surfaced as alerts an analyst can triage.',
      'Attacker behaviour profiled by pattern, not by single hits.',
    ],
    artifacts: [],
  },

  'protocol-cinema': {
    objective:
      'Understand a covert command-and-control channel well enough to write the detection for it.',
    environment: ['Authorised lab', 'Public API traffic', 'MITRE ATT&CK'],
    approach: [
      'Studied a steganographic technique that tunnels data through legitimate public APIs, entirely inside an authorised lab.',
      'Characterised the resulting traffic behaviour rather than the payload, since the payload is the part that hides.',
      'Translated the observed behaviour into detection logic for anomalous outbound channels and mapped it to ATT&CK.',
    ],
    outcome: [
      'Detection logic for covert exfiltration over web protocols.',
      'No live third-party infrastructure was involved at any point.',
    ],
    artifacts: [],
  },

  'monitoring-lab': {
    diagrams: ['pipeline'],
    objective:
      'Get full-fleet visibility across a mixed Windows and Linux estate, then test whether that visibility is real.',
    environment: ['Windows 10', 'Kali Linux', 'VirtualBox', 'Wazuh agents', 'Splunk'],
    approach: [
      'Deployed and configured endpoint agents across several hosts with agent-based log forwarding into centralised dashboards.',
      'Covered network configuration and host connectivity as part of the build, not as an afterthought.',
      'Pushed simulated attack traffic through the estate to see what the dashboards actually surfaced.',
    ],
    outcome: [
      'Centralised network and system telemetry across the fleet.',
      'Detection gaps identified from the simulated traffic and closed.',
    ],
    artifacts: [],
  },

  vrikaan: {
    objective:
      'Build consumer-facing threat detection that holds up against live phishing and scam campaigns.',
    environment: ['Phishing analysis', 'Real-time monitoring', 'Dark-web exposure scanning'],
    approach: [
      'Analysed live phishing and social-engineering campaigns and converted the attacker techniques into automated detection and classification logic.',
      'Designed a multi-tier routing architecture balancing heavy threat-reasoning workloads against high-volume classification.',
      'Led security engineering and production service reliability for the platform.',
    ],
    outcome: [
      'Live platform covering phishing detection, monitoring and dark-web exposure scanning.',
      'Recognised in "The Cyber 50 — India\'s Elite Founders List" (Indian Startup Times).',
    ],
    artifacts: [],
  },
};

export const ethics = {
  title: 'Scope & ethics',
  body:
    'Every technique referenced here was executed inside authorised environments — my own VirtualBox lab hosts, DVWA, and systems I was engaged to assess. Attack simulation is always paired with the detection or hardening that answers it: that pairing is the whole point of the work, not a disclaimer on it.',
};

export const terminalBoot = [
  { cmd: 'whoami', out: ['sahil — SOC Analyst (L1) / VAPT'] },
  { cmd: 'cat /etc/status', out: ['immediate joiner · Nashik, MH · open to relocation'] },
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
