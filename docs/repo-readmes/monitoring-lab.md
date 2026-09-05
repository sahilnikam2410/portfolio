# Multi-Endpoint Monitoring Lab

A multi-host lab with agent-based log forwarding into centralised dashboards —
built to get real fleet visibility across mixed Windows and Linux endpoints,
then tested with simulated attack traffic to find where that visibility failed.

Final-year project, 2025–2026.

## Fleet

| Host | OS | IP | Role |
|---|---|---|---|
| WIN-SERVER-2022 | Windows Server 2022 | 192.168.94.131 | Monitored endpoint — Wazuh agent |
| sahil | Ubuntu Server | 192.168.94.130 | Wazuh manager 4.14.7 |

Virtualised on VMware, host-only networking (192.168.94.0/24). The Windows
agent connected to the manager and forwarded Security-log events successfully.

## Build

1. Network configuration and host connectivity first — visibility is worthless
   if hosts cannot reach the manager reliably.
2. Endpoint agents installed and configured on every host.
3. Log forwarding into centralised dashboards (Wazuh; Splunk for comparison).
4. Simulated attack traffic pushed through the estate.
5. Dashboards checked against what was actually run — gaps recorded and closed.

## Agent config

The Windows agent forwards the Security channel, so failed-logon events —
Windows Event ID 4625, which Wazuh decodes as rule 60122 — reach the manager.
Those 60122 hits are the raw material the brute-force correlation rule below
counts.

## Gaps found

The brute-force correlation rule (100211) did **not** fire on the first
attempt. The 4625 / 60122 failure events were arriving, but the initial burst
did not reach the rule's threshold — five failures inside sixty seconds — so no
correlation alert was raised.

That is the whole point of testing a detection rather than assuming it: the
telemetry was present, the rule was loaded, and it still produced nothing,
because the *volume* did not cross the line. After generating enough controlled
failures against the lab endpoint, rule 100211 fired at level 12, MITRE T1110,
visible in Wazuh Threat Hunting around 21:39 on 5 Sep 2026.

```xml
<rule id="100211" level="12" frequency="5" timeframe="60">
  <if_matched_sid>60122</if_matched_sid>
  <same_source_ip />
  <description>Brute-force attack detected - multiple Windows logon failures</description>
  <mitre><id>T1110</id></mitre>
</rule>
```

## Scope

All hosts are mine, isolated from any production or third-party network.

---

## Part of a portfolio

Full case study, with diagrams and the detection logic in context:
**https://hackwithsahil.vercel.app/work/monitoring-lab**

The portfolio ties every project to the MITRE ATT&CK technique it covers:
**https://hackwithsahil.vercel.app**
