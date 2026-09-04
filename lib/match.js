/**
 * Matching a toolchain entry against the evidence that proves it.
 *
 * Skill labels are written for humans ("Wazuh — deploy & administer"), so the
 * keyword is the leading token before any dash, slash or parenthesis. Matching
 * is substring and case-insensitive: good enough to connect a claim to the
 * work behind it, and it never invents a link that is not in the text.
 */
/**
 * Candidate keywords for a label, widest first.
 *
 * A single split is not enough: "Sysmon & Windows Event Logs" has no dash, so
 * the whole phrase becomes the keyword and matches nothing even though Sysmon
 * is all over the evidence. So try the full label, then the part before any
 * separator, then the leading word — and match if any of them hits.
 */
export function toolKeywords(label) {
  const full = label.trim().toLowerCase();
  const head = full.split(/[—–\-/(·&,]/)[0].trim();
  const first = full.split(/\s+/)[0].replace(/[^a-z0-9+.]/g, '');

  return [...new Set([full, head, first])].filter((k) => k.length > 2);
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Word-boundary matching, not bare substring. `log` inside "detection logic"
 * is not evidence of log correlation, and a count that inflates itself is
 * worse than no count at all.
 */
function matches(haystack, label) {
  const text = haystack.toLowerCase();
  return toolKeywords(label).some((k) => new RegExp(`\\b${escape(k)}\\b`).test(text));
}

export function coverageMatches(row, label) {
  return matches([row.technique, row.tactic, row.run, row.signal, row.where].join(' '), label);
}

export function projectMatches(project, label) {
  return matches(
    [project.title, project.kind, project.summary, ...project.stack, ...project.highlights].join(
      ' '
    ),
    label
  );
}
