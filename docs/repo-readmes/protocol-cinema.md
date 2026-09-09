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

The four observables above are the ones this research settled on, and they
are the part worth keeping: a covert channel can change its payload freely
and cannot easily change how it behaves.

- **Timing.** Beaconing is a rhythm. A channel that checks in on an interval
  looks nothing like a human or an application making requests when it has
  something to send, and the regularity survives jitter better than most
  operators expect.
- **Volume.** Small, even transfers in both directions, sustained. Neither the
  burst of a download nor the silence of an idle client.
- **Destination consistency.** One client returning to one endpoint that
  nothing else on the network talks to. On a public API this is the strongest
  of the four, because the destination is legitimate and the *pattern of who
  uses it* is not.
- **Request shape.** Fields, ordering, headers and user agent staying identical
  across requests, where a real client varies.

**The thresholds are not published, because they were not kept.** This lab has
since been decommissioned and no rule file or tuned value survived it. Writing
plausible numbers here would be inventing a result, and a covert-channel
detection tuned to invented values is worse than none — it would look
authoritative and fail silently in anyone else's network.

**What a false positive looks like:** software update checks, telemetry
agents, monitoring pollers and CI runners all beacon on an interval to one
consistent destination with a fixed request shape. On these four observables
they are indistinguishable from the thing being hunted. Any real deployment
starts by inventorying what is legitimately allowed to beacon, which is why
this is characterisation rather than a finished rule.

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
