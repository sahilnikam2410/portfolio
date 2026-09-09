# Protocol Honeypot

A network-based intrusion detection system and honeypot built to attract,
capture and analyse unauthorised access and reconnaissance traffic, then
correlate attacker behaviour into alerts an analyst can act on.

Security project, 2025.

## Why

Raw scan logs are noise. A honeypot has no legitimate users, so *every*
interaction with it is signal — which makes it the cleanest place to study
attacker behaviour and tune detection before pointing it at production.

## What it does

- Exposes deliberately interesting services and logs every interaction.
- Runs a network IDS alongside it to catch scan and enumeration patterns.
- Correlates repeated behaviour into attacker profiles rather than isolated hits.

## What is not published here

The honeypot software, the IDS and its ruleset, the collector, and the tuned
scan and probe thresholds are not in this repository, and they are not coming.
The lab was decommissioned and no configuration or rule file survived it.

That is a real limitation and it is written here rather than left as an empty
heading, because an unfinished section reads like work in progress and this is
not in progress. What the project established is above: a honeypot has no
legitimate users, so every interaction with it is signal, and correlating
repeated behaviour into a profile is more useful to an analyst than alerting
on each hit.

Anyone wanting the thresholds should treat that as the open question it is.
Publishing invented ones would make this look finished and be worth less than
saying nothing.

## Scope

Deployed inside my own lab. Nothing in this repository targets or probes
third-party infrastructure.

---

## Part of a portfolio

Full case study, with diagrams and the detection logic in context:
**https://hackwithsahil.vercel.app/work/protocol-honeypot**

The portfolio ties every project to the MITRE ATT&CK technique it covers:
**https://hackwithsahil.vercel.app**
