'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  identity,
  skills,
  projects,
  coverage,
  socials,
  certs,
  ethics,
  resumes,
} from '@/data/content';
import { track } from '@vercel/analytics';
import { Section, Panel, Reveal } from './ui';

/* ── fake filesystem, built from the real content ───────────── */

function buildFs() {
  return {
    'about.txt': identity.bio.join('\n\n'),
    'scope.txt': `${ethics.title}\n\n${ethics.body}`,
    'skills.json': JSON.stringify(
      Object.fromEntries(skills.map((g) => [g.group, { evidence: g.evidence, items: g.items }])),
      null,
      2
    ),
    'certs.txt': certs.map((c) => `${c.name.padEnd(30)} ${c.issuer.padEnd(16)} ${c.year}`).join('\n'),
    'contact.txt': [
      `email  ${identity.email}`,
      `phone  ${identity.phone}`,
      `where  ${identity.location}`,
      '',
      ...socials.map((s) => `${s.label.padEnd(10)} ${s.href}`),
    ].join('\n'),
    resumes: Object.fromEntries(
      resumes.map((r) => [
        r.file.split('/').pop(),
        `${r.role}\n${r.note}\n\nrun: open ${r.role.split(' ')[0].toLowerCase()}   → downloads this pdf`,
      ])
    ),
    engagements: Object.fromEntries(
      projects.map((p) => [
        `${p.id}.md`,
        `# ${p.title}\n[${p.kind}]\n\n${p.summary}\n\n${p.highlights
          .map((h) => `- ${h}`)
          .join('\n')}\n\nstack: ${p.stack.join(', ')}\ncase study: /work/${p.id}${
          p.repo ? `\nrepo:  ${p.repo}` : p.site ? `\nsite:  ${p.site}` : ''
        }`,
      ])
    ),
    coverage: Object.fromEntries(
      coverage.map((c) => [
        `${c.id}.md`,
        `# ${c.id} — ${c.technique}\ntactic: ${c.tactic}\nwhere:  ${c.where}\nstatus: ${c.status}\n\nrun:\n  ${c.run}\n\ncaught by:\n  ${c.signal}`,
      ])
    ),
  };
}

const BANNER = String.raw`
 ___ _  _   _   _  _____ _    ___   _   ___
/ __| || | /_\ | || |_ _| |  / __| /_\ | _ )
\__ \ __ |/ _ \| __ || || |__\__ \/ _ \| _ \
|___/_||_/_/ \_\_||_|___|____|___/_/ \_\___/
`;

/* ── command implementations ────────────────────────────────── */

function createShell({ fs, setCwd, clear, openLink }) {
  const resolve = (cwd) => cwd.reduce((node, part) => node?.[part], fs);

  const commands = {
    help: () => [
      'available commands:',
      '',
      '  ls [dir]        list files in the current directory',
      '  cd <dir>        change directory ( .. to go up )',
      '  cat <file>      print a file',
      '  tree            print the whole filesystem',
      '  whoami          identity',
      '  skills          skill matrix',
      '  projects        engagement summary',
      '  coverage        MITRE ATT&CK detection coverage',
      '  contact         how to reach me',
      '  resume          list the role-targeted CVs',
      '  nmap <target>   scan a lab host',
      '  open <name>     open a link (github, youtube, linkedin, resume)',
      '  hire            start a prefilled email',
      '  banner          print the banner',
      '  history         command history',
      '  clear           clear the screen',
      '',
      "tip: Tab completes, ↑/↓ walks history. Try 'sudo su'.",
    ],

    whoami: () => [
      identity.name,
      identity.role,
      identity.location,
      '',
      `status: ${identity.status}`,
      `email:  ${identity.email}`,
      `phone:  ${identity.phone}`,
    ],

    banner: () => BANNER.split('\n'),

    ls: (args, cwd) => {
      const node = args[0] ? resolve([...cwd, args[0]]) : resolve(cwd);
      if (!node) return [`ls: ${args[0]}: no such file or directory`];
      if (typeof node === 'string') return [args[0]];
      return Object.keys(node).map((k) =>
        typeof node[k] === 'string' ? k : `${k}/`
      );
    },

    cd: (args, cwd) => {
      const arg = args[0];
      if (!arg || arg === '~' || arg === '/') {
        setCwd([]);
        return [];
      }
      if (arg === '..') {
        setCwd(cwd.slice(0, -1));
        return [];
      }
      const next = resolve([...cwd, arg]);
      if (!next) return [`cd: ${arg}: no such file or directory`];
      if (typeof next === 'string') return [`cd: ${arg}: not a directory`];
      setCwd([...cwd, arg]);
      return [];
    },

    cat: (args, cwd) => {
      if (!args[0]) return ['cat: missing operand'];
      const node = resolve([...cwd, args[0]]);
      if (node === undefined) return [`cat: ${args[0]}: no such file or directory`];
      if (typeof node !== 'string') return [`cat: ${args[0]}: is a directory`];
      return node.split('\n');
    },

    tree: () => {
      const out = ['.'];
      const walk = (node, prefix) => {
        const keys = Object.keys(node);
        keys.forEach((k, i) => {
          const last = i === keys.length - 1;
          out.push(`${prefix}${last ? '└── ' : '├── '}${k}${typeof node[k] === 'string' ? '' : '/'}`);
          if (typeof node[k] !== 'string') walk(node[k], `${prefix}${last ? '    ' : '│   '}`);
        });
      };
      walk(fs, '');
      return out;
    },

    skills: () =>
      skills.flatMap((g) => [
        `▸ ${g.group}`,
        `  evidence: ${g.evidence}`,
        ...g.items.map((s) => `    · ${s}`),
        '',
      ]),

    projects: () =>
      projects.flatMap((p) => [`▸ ${p.title}  [${p.kind}]`, `  ${p.summary}`, '']),

    coverage: () => [
      'technique                              tactic              status',
      '─'.repeat(78),
      ...coverage.map(
        (c) =>
          `${`${c.id} ${c.technique}`.padEnd(38).slice(0, 38)} ${c.tactic.padEnd(19).slice(0, 19)} ${c.status}`
      ),
      '',
      'cat coverage/<id>.md for the full row',
    ],

    contact: () => socials.map((s) => `${s.label.padEnd(10)} ${s.href}`),

    history: (_args, _cwd, ctx) => ctx.history.map((h, i) => `${String(i + 1).padStart(3)}  ${h}`),

    clear: () => {
      clear();
      return [];
    },

    nmap: (args) => {
      const target = args.find((a) => !a.startsWith('-')) ?? 'lab.local';
      if (!/^(lab\.local|127\.0\.0\.1|localhost|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(target)) {
        return [
          `nmap: refusing to scan '${target}'`,
          '',
          'This shell only scans hosts inside the lab range. Scanning systems',
          'you do not own or have written permission to test is illegal in most',
          'jurisdictions — and it is the fastest way to end a security career.',
          '',
          'try: nmap 192.168.56.101',
        ];
      }
      return [
        `Starting Nmap 7.95 ( https://nmap.org ) against ${target}`,
        'Nmap scan report for ' + target,
        'Host is up (0.00031s latency).',
        '',
        'PORT     STATE SERVICE     VERSION',
        '22/tcp   open  ssh         OpenSSH 9.6 (protocol 2.0)',
        '80/tcp   open  http        Apache httpd 2.4.62',
        '139/tcp  open  netbios-ssn Samba smbd 4.19',
        '445/tcp  open  microsoft-ds Samba smbd 4.19',
        '3306/tcp open  mysql       MySQL 8.0.39',
        '',
        'Nmap done: 1 IP address (1 host up) scanned in 2.41 seconds',
        '[scope] target is a local VM owned by the operator',
      ];
    },

    resume: () => [
      'role-targeted CVs — open <keyword> to download:',
      '',
      ...resumes.map((r) => `  ${r.role.padEnd(26)} ${r.note}`),
      '',
      'e.g.  open soc   |   open vapt   |   open network',
      '',
      'machine-readable: /resume.json  (JSON Resume schema)',
    ],

    open: (args) => {
      const key = (args[0] ?? '').toLowerCase();
      if (key === 'resume') {
        openLink(identity.resumeUrl);
        return ['opening resume — SOC Analyst variant ...'];
      }
      const cv = resumes.find((r) => r.role.toLowerCase().includes(key) && key.length > 1);
      if (cv) {
        openLink(cv.file);
        return [`opening ${cv.file} ...`];
      }
      const match = socials.find((s) => s.label.toLowerCase() === key);
      if (!match) return [`open: unknown target '${args[0] ?? ''}'`, `try: ${socials.map((s) => s.label.toLowerCase()).join(', ')}, resume`];
      openLink(match.href);
      return [`opening ${match.href} ...`];
    },

    sudo: (args) => {
      if (args.join(' ') === 'su' || args[0] === '-i') {
        return [
          'Password: ',
          '',
          "nice try — but privilege escalation is earned, not typed.",
          'sahil is not in the sudoers file. This incident has been logged.',
        ];
      }
      return ['sudo: a password is required'];
    },

    hire: () => {
      const subject = encodeURIComponent(`Role for ${identity.name}`);
      const body = encodeURIComponent(
        [
          'Hi Sahil,',
          '',
          'Role: ',
          'Location / mode: ',
          'Stack we run: ',
          '',
          'Found you via your portfolio.',
        ].join('\n')
      );
      openLink(`mailto:${identity.email}?subject=${subject}&body=${body}`);
      return [
        `opening a draft to ${identity.email} ...`,
        `phone: ${identity.phone}`,
        'resumes: run `resume`',
      ];
    },

    exit: () => ['there is no exit. scroll instead.'],
    pwd: (_a, cwd) => ['/home/sahil/portfolio' + (cwd.length ? '/' + cwd.join('/') : '')],
    date: () => [new Date().toString()],
    echo: (args) => [args.join(' ')],
    uname: () => ['Linux lab 6.9.7-kali1-amd64 x86_64 GNU/Linux'],
    matrix: () => ['wake up, neo ...', 'the rain is already running behind this page.'],
    hack: () => [
      'hacking is 5% exploits and 95% reading documentation nobody else read.',
      'start with video #1: build the lab.',
    ],
  };

  commands['rm'] = (args) =>
    args.includes('-rf') && (args.includes('/') || args.includes('/*'))
      ? ['rm: refusing to remove "/" — snapshots exist for a reason.']
      : ['rm: this filesystem is read-only'];

  commands['man'] = (args) =>
    commands[args[0]]
      ? [`What manual page do you want? Try: ${args[0]} --help`, `(hint: just run '${args[0]}')`]
      : ['What manual page do you want?'];

  return commands;
}

/**
 * Output often prints a path or a URL — `cat` ends with a case-study route,
 * `contact` lists every profile. Making those clickable means a reader does
 * not have to retype what the shell just told them.
 */
const LINK = /(https?:\/\/[^\s]+|mailto:[^\s]+|tel:[^\s]+|\/work\/[a-z0-9-]+)/g;

function Linkify({ text }) {
  if (!text) return ' ';
  const parts = text.split(LINK);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (!LINK.test(part)) {
      LINK.lastIndex = 0;
      return part;
    }
    LINK.lastIndex = 0;
    const external = part.startsWith('http'); // mailto/tel must stay same-tab
    return (
      <a
        key={i}
        href={part}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className="text-[var(--color-cyan)] underline decoration-dotted underline-offset-2 hover:text-[var(--color-acid)]"
      >
        {part}
      </a>
    );
  });
}

/* ── component ──────────────────────────────────────────────── */

export default function Terminal() {
  const fs = useMemo(() => buildFs(), []);
  const [cwd, setCwd] = useState([]);
  const [lines, setLines] = useState([
    { kind: 'sys', text: 'portfolio shell — type `help` for commands' },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [histIndex, setHistIndex] = useState(-1);
  const [focused, setFocused] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const demoDone = useRef(false);
  const userTookOver = useRef(false);

  const clear = useCallback(() => setLines([]), []);
  const openLink = useCallback((href) => {
    if (typeof window !== 'undefined') window.open(href, '_blank', 'noopener');
  }, []);

  const shell = useMemo(
    () => createShell({ fs, setCwd, clear, openLink }),
    [fs, clear, openLink]
  );

  const prompt = `sahil@lab:~/${cwd.join('/')}$`;

  const run = useCallback(
    (raw) => {
      const trimmed = raw.trim();
      setLines((prev) => [...prev, { kind: 'cmd', text: `${prompt} ${raw}` }]);
      if (!trimmed) return;

      setHistory((h) => [...h, trimmed]);
      setHistIndex(-1);

      const [name, ...args] = trimmed.split(/\s+/);
      const fn = shell[name];

      // which commands people actually try is the only signal that says
      // whether the shell is a gimmick or the thing they came for
      track('shell_command', { command: name, known: Boolean(fn) });

      if (!fn) {
        setLines((prev) => [
          ...prev,
          { kind: 'err', text: `${name}: command not found — type 'help'` },
        ]);
        return;
      }

      const out = fn(args, cwd, { history }) ?? [];
      if (out.length) {
        setLines((prev) => [...prev, ...out.map((text) => ({ kind: 'out', text }))]);
      }
    },
    [shell, cwd, prompt, history]
  );

  const complete = useCallback(() => {
    const parts = input.split(/\s+/);
    const last = parts[parts.length - 1] ?? '';
    const pool =
      parts.length <= 1
        ? Object.keys(shell)
        : Object.keys(cwd.reduce((n, p) => n?.[p], fs) ?? {});
    const matches = pool.filter((c) => c.startsWith(last));
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0];
      setInput(parts.join(' '));
    } else if (matches.length > 1) {
      setLines((prev) => [
        ...prev,
        { kind: 'cmd', text: `${prompt} ${input}` },
        { kind: 'out', text: matches.join('   ') },
      ]);
    }
  }, [input, shell, cwd, fs, prompt]);

  const onKeyDown = (e) => {
    userTookOver.current = true; // the demo yields the moment anyone types
    if (e.key === 'Enter') {
      run(input);
      setInput('');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      const next = histIndex < 0 ? history.length - 1 : Math.max(0, histIndex - 1);
      setHistIndex(next);
      setInput(history[next]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histIndex < 0) return;
      const next = histIndex + 1;
      if (next >= history.length) {
        setHistIndex(-1);
        setInput('');
      } else {
        setHistIndex(next);
        setInput(history[next]);
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clear();
    }
  };

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  /**
   * Self-demo. An empty terminal is a dead box that most visitors will never
   * type into, so the first time it scrolls into view it runs two commands
   * itself — proving it is a real shell before asking anyone to use it.
   * Stops the moment the visitor takes over.
   */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || demoDone.current) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timers = [];

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || demoDone.current) return;
        demoDone.current = true;
        obs.disconnect();

        if (reduce) {
          run('whoami');
          return;
        }

        const script = ['whoami', 'coverage'];
        let typed = '';

        const typeCommand = (cmd, startDelay) => {
          for (let i = 1; i <= cmd.length; i++) {
            timers.push(
              setTimeout(() => {
                if (userTookOver.current) return;
                typed = cmd.slice(0, i);
                setInput(typed);
              }, startDelay + i * 55)
            );
          }
          timers.push(
            setTimeout(() => {
              if (userTookOver.current) return;
              setInput('');
              run(cmd);
            }, startDelay + cmd.length * 55 + 320)
          );
        };

        typeCommand(script[0], 700);
        typeCommand(script[1], 700 + script[0].length * 55 + 1500);
      },
      { threshold: 0.35 }
    );

    obs.observe(el);
    return () => {
      obs.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [run]);

  return (
    <Section
      id="shell"
      index="05"
      title="./shell"
      subtitle="A real shell, not a screenshot. Tab completes, arrows walk history, and `nmap` refuses anything outside the lab range — on purpose."
    >
      <Reveal>
        <Panel
          className={`overflow-hidden transition-shadow ${
            focused ? 'shadow-[0_0_50px_rgba(53,255,158,0.12)]' : ''
          }`}
        >
          <div className="flex items-center gap-2 border-b border-[rgba(53,255,158,0.14)] px-4 py-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-acid)]" />
            <span className="ml-2 text-[11px] text-[var(--color-dim)]">
              {prompt.replace('$', '')} — bash
            </span>
            <span className="ml-auto flex gap-1.5">
              {['help', 'ls', 'skills', 'nmap 192.168.56.101'].map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    userTookOver.current = true;
                    run(c);
                    inputRef.current?.focus();
                  }}
                  className="hidden border border-[rgba(53,255,158,0.2)] px-2 py-0.5 text-[10px] text-[var(--color-dim)] transition-colors hover:border-[var(--color-acid)] hover:text-[var(--color-acid)] sm:block"
                >
                  {c}
                </button>
              ))}
            </span>
          </div>

          <div
            ref={scrollRef}
            onClick={() => inputRef.current?.focus()}
            data-cursor="type"
            className="h-[300px] overflow-y-auto px-4 py-4 text-[12px] leading-[1.55] sm:h-[420px] sm:text-[13px]"
          >
            {lines.map((l, i) => (
              <div
                key={i}
                className={
                  l.kind === 'cmd'
                    ? 'whitespace-pre-wrap text-[var(--color-bone)]'
                    : l.kind === 'err'
                    ? 'whitespace-pre-wrap text-[#ff6b6b]'
                    : l.kind === 'sys'
                    ? 'whitespace-pre-wrap text-[var(--color-cyan)]'
                    : 'whitespace-pre-wrap text-[var(--color-dim)]'
                }
              >
                {l.kind === 'out' ? <Linkify text={l.text} /> : l.text || ' '}
              </div>
            ))}

            <div className="flex items-center text-[var(--color-bone)]">
              <span className="shrink-0 text-[var(--color-acid)]">{prompt}</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                onFocus={(e) => {
                  setFocused(true);
                  // on phones the soft keyboard covers the panel — pull it up.
                  // Lenis owns scrolling; a native scrollIntoView gets fought
                  // by its rAF loop and silently does nothing.
                  if (window.innerWidth < 640) {
                    const el = e.target;
                    setTimeout(() => {
                      if (window.__lenis) window.__lenis.scrollTo(el, { offset: -120 });
                      else el.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    }, 250);
                  }
                }}
                onBlur={() => setFocused(false)}
                spellCheck={false}
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                enterKeyHint="send"
                aria-label="terminal input"
                className="ml-2 w-full min-w-0 flex-1 bg-transparent outline-none"
              />
            </div>
          </div>
        </Panel>
      </Reveal>
    </Section>
  );
}
