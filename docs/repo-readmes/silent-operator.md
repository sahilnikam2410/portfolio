# The Silent Operator

SOC detection and red-team simulation lab. Attacks are run against hosts I own,
mapped to MITRE ATT&CK before execution, then hunted from the defender side to
find out what the stack actually caught.

Final-year project, 2025–2026.

## Environment

| Component | Role |
|---|---|
| Wazuh manager + indexer | SIEM, alert rules, active response |
| Wazuh agents | Windows and Linux endpoints |
| Sysmon | Windows process/network telemetry |
| Kali Linux | Attacker host |
| VirtualBox | Isolated lab networking |

## Method

1. Build the stack: manager, agents, Sysmon and system logs forwarded into centralised dashboards.
2. Map each technique to its MITRE ATT&CK ID and expected telemetry before execution.
3. Execute controlled attacks against owned lab hosts, one technique at a time.
4. Hunt from the defender side: log correlation, custom alert rules and triage.
5. Record the outcome honestly — fired, or gap.
6. For gaps: write the rule, re-run the technique and confirm it fires.

## Coverage

| ID | Technique | Tactic | Status |
|---|---|---|---|
| T1110 | Brute Force | Credential Access | **validated in lab** |
| T1059 | Command & Scripting Interpreter | Execution | detected |
| T1046 | Network Service Discovery | Discovery | detected |
| T1190 | Exploit Public-Facing Application | Initial Access | assessed |
| T1071.001 | Application Layer Protocol: Web | Command & Control | research |
| T1566 | Phishing | Initial Access | detected |

`validated in lab` means the custom detection fired during a controlled run and the resulting Wazuh event was captured as evidence.

## Rule validated in the lab

**Wazuh — Windows brute-force detection**

The deployed rule that fired on `WIN-SERVER-2022` is **rule 100211, level 12**. It correlates repeated Windows logon-failure events (Wazuh rule `60122`) and fires after five matches within 60 seconds.

```xml
<group name="local,authentication_failures,">
  <rule id="100211" level="12" frequency="5" timeframe="60">
    <if_matched_sid>60122</if_matched_sid>
    <description>Brute-force attack detected - multiple Windows logon failures</description>
    <mitre>
      <id>T1110</id>
    </mitre>
    <group>authentication_failed,brute_force,windows,</group>
  </rule>
</group>
```

**Validation receipt:** Wazuh Threat Hunting captured rule `100211` at **level 12** on `WIN-SERVER-2022` at approximately **21:39 on 5 Sep 2026**, preceded by multiple `60122` logon-failure events. The evidence image is `public/artifacts/bruteforce-100211.png`.

**False positives to tune:** service accounts with stale cached credentials and password managers retrying after a password change can create legitimate failure bursts.

## Sigma equivalent

```yaml
title: Windows brute force
status: experimental
logsource:
  product: windows
  service: security
detection:
  selection:
    EventID: 4625
  timeframe: 60s
  condition: selection | count() by IpAddress >= 5
level: high
tags:
  - attack.credential_access
  - attack.t1110
```

## Scope

Every host in this lab is mine and runs inside an isolated lab environment. No live third-party targets, credential material or real-world systems are used.

## Rebuild it

<!-- TODO: setup steps, or a link to your lab-build video -->

---

## Part of a portfolio

The portfolio ties every project to the MITRE ATT&CK technique it covers:
**https://hackwithsahil.vercel.app**
