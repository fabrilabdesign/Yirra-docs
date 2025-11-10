# DNS Configuration Guide for Yirra Systems Email System

## Overview

This guide details all DNS records required to configure the email system for `gaudy.com.au`. All records should be added through your Cloudflare DNS dashboard.

**Note:** This is a test deployment. Once validated, the same configuration can be applied to `gaudy.com.au`.

## 📋 Prerequisites

- **Domain:** `gaudy.com.au`
- **Mail Server:** `mail.gaudy.com.au`
- **IP Address:** Your server's public IP (replace `YOUR_PUBLIC_IP` throughout)
- **DKIM Selector:** `s1` (as configured in Rspamd)

---

## 1. MX Records (Mail Exchange)

**Purpose:** Directs email delivery to your mail server

**Records to Add:**
```
Type: MX
Name: @
Value: mail.gaudy.com.au
Priority: 10
TTL: Auto (or 300)
```

**Verification:**
```bash
dig +short MX gaudy.com.au
# Should return: 10 mail.gaudy.com.au.
```

---

## 2. A/AAAA Records (Forward Resolution)

**Purpose:** Resolves `mail.gaudy.com.au` to your server's IP

**Records to Add:**
```
Type: A
Name: mail
Value: YOUR_PUBLIC_IP
TTL: Auto (or 300)
```

**For IPv6 (if available):**
```
Type: AAAA
Name: mail
Value: YOUR_PUBLIC_IPV6
TTL: Auto (or 300)
```

**Verification:**
```bash
dig +short A mail.gaudy.com.au
# Should return: YOUR_PUBLIC_IP

dig +short AAAA mail.gaudy.com.au
# Should return: YOUR_PUBLIC_IPV6 (if applicable)
```

---

## 3. SPF Record (Sender Policy Framework)

**Purpose:** Prevents email spoofing by specifying which servers can send mail for your domain

**Record to Add:**
```
Type: TXT
Name: @
Value: "v=spf1 mx a:mail.gaudy.com.au -all"
TTL: Auto (or 300)
```

**Alternative (more restrictive):**
```
Value: "v=spf1 ip4:YOUR_PUBLIC_IP -all"
```

**Verification:**
```bash
dig +short TXT gaudy.com.au
# Should contain: "v=spf1 mx a:mail.gaudy.com.au -all"
```

---

## 4. DKIM Record (DomainKeys Identified Mail)

**Purpose:** Cryptographically signs outgoing emails for authentication

**Prerequisites:**
- Generate DKIM key pair (see build guide for commands)
- Extract public key using: `openssl rsa -in s1.key -pubout -outform PEM | grep -v '----' | tr -d '\n'`

**Record to Add:**
```
Type: TXT
Name: s1._domainkey
Value: "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY_HERE"
TTL: Auto (or 300)
```

**Example:**
```
Name: s1._domainkey
Value: "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4ZJGQJzPbKfQ6QH5Q8Zv..."
```

**Verification:**
```bash
dig +short TXT s1._domainkey.gaudy.com.au
# Should return your DKIM public key record
```

---

## 5. DMARC Record (Domain-based Message Authentication, Reporting & Conformance)

**Purpose:** Provides email authentication and reporting for domain abuse

**Record to Add:**
```
Type: TXT
Name: _dmarc
Value: "v=DMARC1; p=none; rua=mailto:postmaster@gaudy.com.au; ruf=mailto:postmaster@gaudy.com.au; fo=1"
TTL: Auto (or 300)
```

**Policy Options:**
- `p=none` - Monitor only (start here)
- `p=quarantine` - Quarantine suspicious mail
- `p=reject` - Reject suspicious mail

**Verification:**
```bash
dig +short TXT _dmarc.gaudy.com.au
# Should return your DMARC policy
```

---

## 6. MTA-STS TXT Record (Mail Transfer Agent Strict Transport Security)

**Purpose:** Enforces TLS encryption for email delivery

**Record to Add:**
```
Type: TXT
Name: _mta-sts
Value: "v=STSv1; id=2024110801;"
TTL: Auto (or 300)
```

**Note:** The `id` value should be updated whenever you change the MTA-STS policy file.

**Verification:**
```bash
dig +short TXT _mta-sts.gaudy.com.au
# Should return: "v=STSv1; id=2024110801;"
```

---

## 7. TLS-RPT Record (TLS Reporting)

**Purpose:** Receives reports about TLS delivery issues

**Record to Add:**
```
Type: TXT
Name: _smtp._tls
Value: "v=TLSRPTv1; rua=mailto:postmaster@gaudy.com.au"
TTL: Auto (or 300)
```

**Verification:**
```bash
dig +short TXT _smtp._tls.gaudy.com.au
# Should return your TLS-RPT configuration
```

---

## 8. PTR Record (Reverse DNS)

**Purpose:** Maps your IP address back to your mail server hostname

**Important:** This is configured at your hosting provider's control panel, NOT in Cloudflare DNS.

**Required Configuration:**
- Contact your hosting provider (where YOUR_PUBLIC_IP is allocated)
- Request PTR record: `YOUR_PUBLIC_IP` → `mail.gaudy.com.au`

**Verification:**
```bash
dig +short -x YOUR_PUBLIC_IP
# Should return: mail.gaudy.com.au.
```

---

## 📝 Complete DNS Record Summary

Here's the complete list for easy copy-paste into Cloudflare:

### MX Record
```
Type: MX
Name: @
Content: mail.gaudy.com.au
Priority: 10
```

### A Record
```
Type: A
Name: mail
Content: YOUR_PUBLIC_IP
```

### SPF Record
```
Type: TXT
Name: @
Content: "v=spf1 mx a:mail.gaudy.com.au -all"
```

### DKIM Record
```
Type: TXT
Name: s1._domainkey
Content: "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY_HERE"
```

### DMARC Record
```
Type: TXT
Name: _dmarc
Content: "v=DMARC1; p=none; rua=mailto:postmaster@gaudy.com.au; ruf=mailto:postmaster@gaudy.com.au; fo=1"
```

### MTA-STS Record
```
Type: TXT
Name: _mta-sts
Content: "v=STSv1; id=2024110801;"
```

### TLS-RPT Record
```
Type: TXT
Name: _smtp._tls
Content: "v=TLSRPTv1; rua=mailto:postmaster@gaudy.com.au"
```

---

## 🔍 Validation Commands

Use these commands to verify all records are properly configured:

```bash
# MX Records
dig +short MX gaudy.com.au

# A Records
dig +short A mail.gaudy.com.au

# SPF Record
dig +short TXT gaudy.com.au

# DKIM Record
dig +short TXT s1._domainkey.gaudy.com.au

# DMARC Record
dig +short TXT _dmarc.gaudy.com.au

# MTA-STS Record
dig +short TXT _mta-sts.gaudy.com.au

# TLS-RPT Record
dig +short TXT _smtp._tls.gaudy.com.au

# PTR Record (Reverse DNS)
dig +short -x YOUR_PUBLIC_IP
```

---

## 🚀 Implementation Order

1. **A/AAAA Records** - Basic resolution
2. **MX Records** - Mail delivery
3. **PTR Record** - Reverse DNS (at hosting provider)
4. **SPF Record** - Anti-spoofing
5. **DKIM Record** - Message signing
6. **DMARC Record** - Authentication policy
7. **MTA-STS & TLS-RPT** - TLS enforcement

---

## ⚠️ Important Notes

- **DNS Propagation:** Allow 24-48 hours for changes to propagate globally
- **Testing:** Use tools like MX Toolbox or Mail-Tester.com to validate configuration
- **DKIM Key:** Generate your actual DKIM key pair before adding the record
- **PTR Record:** Must be configured at your IP address provider, not Cloudflare
- **Backup MX:** Consider adding backup MX servers for redundancy

---

## 🧪 Testing Tools

**Online Validators:**
- [MX Toolbox](https://mxtoolbox.com/) - Comprehensive DNS checks
- [Mail-Tester](https://www.mail-tester.com/) - Send test emails for scoring
- [DMARC Analyzer](https://www.dmarcanalyzer.com/) - DMARC validation
- [MTA-STS Validator](https://www.huque.com/bin/mta-sts-check) - MTA-STS validation

**Command Line:**
```bash
# Full DNS validation script
./validate-dns.sh gaudy.com.au
```

---

## 📞 Support

If you encounter issues:
1. Check DNS propagation with `dig` commands above
2. Verify records in Cloudflare dashboard
3. Test with online validation tools
4. Contact your hosting provider for PTR record issues

---

*This guide is specific to the Yirra Systems email infrastructure. Last updated: November 8, 2025*
