# Multi-Endpoint Monitoring Lab

A multi-host lab with agent-based log forwarding into centralised dashboards —
built to get real fleet visibility across mixed Windows and Linux endpoints,
then tested with simulated attack traffic to find where that visibility failed.

Final-year project, 2025–2026.

## Fleet

| Host | OS | Role |
|---|---|---|
| <!-- TODO --> | Windows 10 | Agent, Sysmon |
| <!-- TODO --> | Ubuntu | Agent |
| <!-- TODO --> | Kali Linux | Attacker |

Virtualised on VirtualBox, host-only networking.

## Build

1. Network configuration and host connectivity first — visibility is worthless
   if hosts cannot reach the manager reliably.
2. Endpoint agents installed and configured on every host.
3. Log forwarding into centralised dashboards (Wazuh; Splunk for comparison).
4. Simulated attack traffic pushed through the estate.
5. Dashboards checked against what was actually run — gaps recorded and closed.

## Agent config

<!-- TODO: your ossec.conf excerpts, Sysmon config choices, and why.
     "Why these event IDs and not the defaults" is the interesting part. -->

## Gaps found

<!-- TODO: what did not show up the first time, and what you changed. -->

## Scope

All hosts are mine, isolated from any production or third-party network.

---

## Part of a portfolio

Full case study, with diagrams and the detection logic in context:
**https://hackwithsahil.vercel.app/work/monitoring-lab**

The portfolio ties every project to the MITRE ATT&CK technique it covers:
**https://hackwithsahil.vercel.app**
