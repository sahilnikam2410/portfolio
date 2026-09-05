# Protocol Cinema

Research into a steganographic command-and-control technique that tunnels data
through public APIs — studied in an authorised lab, then translated into
detection logic for anomalous outbound channels and mapped to MITRE ATT&CK.

Security research, 2025.

## Premise

Covert channels hide the payload, so payload inspection is the wrong lens.
The behaviour of the channel — timing, volume, destination consistency,
request shape — is what survives the obfuscation. That is what this research
characterises.

## Method

1. Reproduce the technique inside an authorised lab.
2. Characterise the resulting traffic behaviour, not the content.
3. Convert those observations into detection logic for anomalous outbound
   channels.
4. Map to ATT&CK: T1071.001 (Application Layer Protocol: Web).

## Detection logic

<!-- TODO: the actual signal you settled on. Thresholds, features, the rule.
     Also: what does a false positive look like in a normal environment? -->

## Explicitly not published

No working tooling, no target list, no operational payload. The value here is
defensive — the observable, not the implementation.

## Scope

Authorised lab only. No third-party API was used as a live channel.

---

## Part of a portfolio

Full case study, with diagrams and the detection logic in context:
**https://hackwithsahil.vercel.app/work/protocol-cinema**

The portfolio ties every project to the MITRE ATT&CK technique it covers:
**https://hackwithsahil.vercel.app**
