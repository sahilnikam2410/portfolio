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

## Detections

<!-- TODO: the actual rules/signatures. What patterns do you alert on?
     Scan rate? Port sequence? Specific probes? Show the logic. -->

## Sample capture

<!-- TODO: a redacted log excerpt showing a real capture.
     Redact any source IP that is not RFC1918. -->

## Scope

Deployed inside my own lab. Nothing in this repository targets or probes
third-party infrastructure.

## Setup

<!-- TODO -->
