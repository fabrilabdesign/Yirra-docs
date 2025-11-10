# DNS Setup Quick Checklist - Gaudie Email System

## ⏰ Before You Start
- [ ] Replace `YOUR_PUBLIC_IP` with your actual server IP
- [ ] Generate DKIM key pair (see build guide)
- [ ] Extract DKIM public key for DNS record

## 📋 DNS Records to Add (Cloudflare Dashboard)

### Essential Records (Required)
- [ ] **MX Record:** `@` → `mail.gaudy.com.au` (Priority: 10)
- [ ] **A Record:** `mail` → `YOUR_PUBLIC_IP`
- [ ] **SPF Record:** `@` TXT → `"v=spf1 mx a:mail.gaudy.com.au -all"`
- [ ] **PTR Record:** Configure at hosting provider (`YOUR_PUBLIC_IP` → `mail.gaudy.com.au`)

### Authentication Records (High Priority)
- [ ] **DKIM Record:** `s1._domainkey` TXT → `"v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"`
- [ ] **DMARC Record:** `_dmarc` TXT → `"v=DMARC1; p=none; rua=mailto:postmaster@gaudy.com.au; ruf=mailto:postmaster@gaudy.com.au; fo=1"`

### Security Records (Optional but Recommended)
- [ ] **MTA-STS Record:** `_mta-sts` TXT → `"v=STSv1; id=2024110801;"`
- [ ] **TLS-RPT Record:** `_smtp._tls` TXT → `"v=TLSRPTv1; rua=mailto:postmaster@gaudy.com.au"`

## 🧪 Validation Steps

### Quick Test Commands
```bash
# Test all records
./validate-dns.sh gaudy.com.au

# Individual checks
dig +short MX gaudy.com.au
dig +short A mail.gaudy.com.au
dig +short TXT gaudy.com.au
dig +short TXT s1._domainkey.gaudy.com.au
dig +short TXT _dmarc.gaudy.com.au
dig +short -x YOUR_PUBLIC_IP  # PTR check
```

### Online Testing Tools
- [ ] **MX Toolbox:** https://mxtoolbox.com/SuperTool.aspx
- [ ] **Mail Tester:** Send test email to score@ mail-tester.com
- [ ] **DMARC Analyzer:** https://www.dmarcanalyzer.com/

## ⚠️ Common Issues & Solutions

### Issue: Emails going to spam
- [ ] Verify SPF record is correct
- [ ] Check DKIM record has proper public key
- [ ] Ensure PTR record is configured

### Issue: DMARC failing
- [ ] Verify DKIM selector matches (s1)
- [ ] Check SPF alignment (use `mx` in SPF record)

### Issue: TLS errors
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Check MTA-STS policy file is accessible

## 📊 Expected Results

After setup, you should see:
- ✅ MX lookup returns: `10 mail.gaudy.com.au.`
- ✅ A lookup returns: `YOUR_PUBLIC_IP`
- ✅ SPF check passes
- ✅ DKIM key is published
- ✅ DMARC policy shows `p=none`
- ✅ PTR lookup returns: `mail.gaudy.com.au.`

## 🚀 Go-Live Readiness

- [ ] All essential DNS records added
- [ ] DNS propagation completed (24-48 hours)
- [ ] Validation script passes
- [ ] Test email sent and received
- [ ] DMARC reports being received (optional)

## 📞 Emergency Contacts

If DNS issues persist:
- Cloudflare Support
- Hosting Provider (for PTR records)
- Email system administrator

---
*Generated for Yirra Systems Email Infrastructure - November 8, 2025*
