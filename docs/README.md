# docs

Working material for the portfolio. Nothing here is served by the site.

## repo-readmes/

Draft READMEs for the four lab projects, one file per repo. Every factual line
is taken from your resumes; every `<!-- TODO -->` is a place only you can fill.

Workflow per project:

1. Create the repo on GitHub — name it to match the case-study id
   (`silent-operator`, `protocol-honeypot`, `protocol-cinema`, `monitoring-lab`).
2. Copy the matching file in here to `README.md` in that repo.
3. Fill the TODOs. The rules and the gaps are what people read; the setup steps
   are what makes them trust it.
4. Uncomment the `repo:` line for that project in `data/content.js`. The
   "repository ↗" button on the site appears automatically.

Before pushing anything, redact: real hostnames, public IPs, usernames, tokens,
agent keys, and any address outside RFC1918. Lab ranges (192.168.x.x, 10.x.x.x)
are fine to show.

## What not to publish

No working offensive tooling, no target lists, no credential material. Defensive
output — rules, observables, detection logic — is the part worth showing, and the
part that reads as senior.
