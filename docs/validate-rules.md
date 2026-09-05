# Validating the draft rules

The two rules on `/work/silent-operator` are marked **draft — not yet run**.
This turns them into `validated in lab`. Budget ~20 minutes.

Nothing here leaves your lab. Everything targets VMs you own.

---

## 1. Install the Wazuh rule

On the Wazuh manager:

```bash
sudo nano /var/ossec/etc/rules/local_rules.xml
```

Paste the `<group name="local,authentication_failures,">` block from the case
study. Keep the rule IDs in the 100000+ range — that space is reserved for
local rules and will not collide with a Wazuh update.

Check the syntax before restarting, so a typo does not take the manager down:

```bash
sudo /var/ossec/bin/wazuh-logtest -t
```

Then restart:

```bash
sudo systemctl restart wazuh-manager
sudo /var/ossec/bin/wazuh-control status
```

## 2. Trigger it

From the Kali VM, against your own Windows VM. Six failures inside two
minutes is what rule 100211 waits for:

```bash
for i in $(seq 1 8); do
  # deliberately wrong password against your own lab host
  crackmapexec smb 192.168.56.101 -u