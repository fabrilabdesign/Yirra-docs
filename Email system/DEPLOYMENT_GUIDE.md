# Email System Deployment Guide - Gaudie Test Domain

## 🎯 Overview

This guide provides step-by-step instructions to deploy the complete email system on `gaudy.com.au` for testing before migrating to `yirrasystems.com`.

**Domain:** `gaudy.com.au` (test deployment)
**Namespace:** `email-system`
**Components:** Postfix + Dovecot + Rspamd + ClamAV + MTA-STS + Monitoring

---

## 📋 Prerequisites

### Infrastructure Requirements
- [x] **k3s cluster** running (control-plane node `lucy`)
- [x] **Traefik ingress controller** configured
- [x] **cert-manager** with Let's Encrypt issuers
- [x] **local-path storage class** available
- [x] **email-system namespace** created

### DNS Requirements
- [ ] **Domain ownership** of `gaudy.com.au`
- [ ] **Cloudflare DNS access** for `gaudy.com.au`
- [ ] **Public IP address** for PTR record

---

## 🚀 Deployment Steps

### Step 1: DNS Setup (30 minutes)

**1.1 Add DNS Records**
Follow the [DNS Configuration Guide](DNS_Configuration_Guide.md) to add all required records:

```bash
# Essential records (do these first)
MX: @ → mail.gaudy.com.au
A: mail → YOUR_PUBLIC_IP
SPF: @ TXT → "v=spf1 mx a:mail.gaudy.com.au -all"
PTR: Configure at hosting provider (YOUR_PUBLIC_IP → mail.gaudy.com.au)
```

**1.2 Generate DKIM Keys**
```bash
# Generate DKIM key pair
openssl genrsa -out s1.key 2048
openssl rsa -in s1.key -pubout -outform PEM | grep -v '----' | tr -d '\n' > s1.pub

# Add DKIM record to DNS
# Name: s1._domainkey.gaudy.com.au
# Type: TXT
# Value: "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY_HERE"
```

**1.3 Validate DNS**
```bash
# Run validation script
./validate-dns.sh gaudy.com.au

# Should show all ✅ for essential records
```

---

### Step 2: Deploy Email System (15 minutes)

**2.1 Run Deployment Script**
```bash
cd /home/james/yirra_systems_app/Email\ system/
./deploy-email-system.sh
```

This script will deploy:
- ✅ PVC for mail storage (50GB)
- ✅ Postfix + Dovecot configuration
- ✅ Rspamd (spam filtering)
- ✅ ClamAV (virus scanning)
- ✅ MTA-STS site
- ✅ Monitoring exporters
- ✅ Backup cronjob

**2.2 Check Deployment Status**
```bash
# Check all pods are running
kubectl get pods -n email-system

# Check services
kubectl get svc -n email-system

# Check ingress
kubectl get ingress -n email-system
```

---

### Step 3: Create Required Secrets (10 minutes)

**3.1 TLS Certificate**
```bash
# Create self-signed cert for testing (replace with Let's Encrypt later)
openssl req -x509 -newkey rsa:4096 -keyout tls.key -out tls.crt -days 365 -nodes \
  -subj "/CN=mail.gaudy.com.au"

kubectl create secret tls mail-tls -n email-system --cert=tls.crt --key=tls.key
```

**3.2 DH Parameters**
```bash
# Generate DH parameters
openssl dhparam -out dhparams.pem 2048

kubectl create secret generic tls-dhparams -n email-system --from-file=dhparams.pem
```

**3.3 Dovecot User Database**
```bash
# Create users.passwd file
cat > users.passwd << EOF
admin@gaudy.com.au:{SHA512-CRYPT}$6$salt$encrypted_password
test@gaudy.com.au:{SHA512-CRYPT}$6$salt$encrypted_password
EOF

# Generate password hash
docker run --rm dovecot/dovecot:2.3 doveadm pw -s SHA512-CRYPT -p 'YourStrongPass'

kubectl create secret generic dovecot-auth -n email-system --from-file=users.passwd
```

**3.4 DKIM Keys**
```bash
kubectl create secret generic rspamd-dkim -n email-system --from-file=s1.key
```

---

### Step 4: Test Email Functionality (20 minutes)

**4.1 Test SMTP (Port 25/587/465)**
```bash
# Test SMTP connection
telnet mail.gaudy.com.au 25
# Should get Postfix greeting
```

**4.2 Test IMAPS (Port 993)**
```bash
# Test IMAPS connection
openssl s_client -connect mail.gaudy.com.au:993 -crlf
# Should get Dovecot greeting
```

**4.3 Send Test Email**
```bash
# Use any email client or swaks
swaks --to test@gaudy.com.au --server mail.gaudy.com.au --port 587 \
      --auth-user admin@gaudy.com.au --auth-password YourPassword \
      --tls --header "Subject: Test Email"
```

**4.4 Check Logs**
```bash
# Check Postfix logs
kubectl logs -n email-system daemonset/mailedge -c postfix

# Check Dovecot logs
kubectl logs -n email-system daemonset/mailedge -c dovecot

# Check Rspamd logs
kubectl logs -n email-system deployment/rspamd
```

---

### Step 5: Add Remaining DNS Records (10 minutes)

**5.1 Add Authentication Records**
```bash
# DMARC Record
# Name: _dmarc.gaudy.com.au
# Type: TXT
# Value: "v=DMARC1; p=none; rua=mailto:postmaster@gaudy.com.au; ruf=mailto:postmaster@gaudy.com.au; fo=1"

# MTA-STS Record
# Name: _mta-sts.gaudy.com.au
# Type: TXT
# Value: "v=STSv1; id=2024110801;"

# TLS-RPT Record
# Name: _smtp._tls.gaudy.com.au
# Type: TXT
# Value: "v=TLSRPTv1; rua=mailto:postmaster@gaudy.com.au"
```

**5.2 Final DNS Validation**
```bash
./validate-dns.sh gaudy.com.au
# Should show all records as ✅
```

---

## 🔍 Troubleshooting

### Common Issues

**Pods not starting:**
```bash
kubectl describe pod <pod-name> -n email-system
kubectl logs <pod-name> -n email-system
```

**DNS not resolving:**
```bash
dig MX gaudy.com.au
dig A mail.gaudy.com.au
# Check propagation (may take 24-48 hours)
```

**Email not delivering:**
```bash
# Check Postfix queue
kubectl exec -n email-system daemonset/mailedge -c postfix -- mailq

# Check Rspamd status
curl http://rspamd.email-system.svc.cluster.local:11334/stat
```

**Authentication failing:**
```bash
# Check Dovecot auth logs
kubectl logs -n email-system daemonset/mailedge -c dovecot | grep auth
```

---

## 📊 Monitoring & Health Checks

### Service Health
```bash
# Check all services
kubectl get all -n email-system

# Check pod health
kubectl get pods -n email-system
kubectl describe pods -n email-system
```

### Email Metrics
```bash
# Postfix metrics
curl http://postfix-exporter.email-system.svc.cluster.local:9154/metrics

# Rspamd metrics
curl http://rspamd-exporter.email-system.svc.cluster.local:9814/metrics
```

### Log Monitoring
```bash
# Tail all logs
kubectl logs -f -n email-system daemonset/mailedge

# Check specific service logs
kubectl logs -f -n email-system deployment/rspamd
kubectl logs -f -n email-system deployment/clamav
```

---

## 🎯 Success Criteria

**Deployment Complete When:**
- [ ] All pods running (7/7)
- [ ] Services accessible
- [ ] DNS validation passes (all ✅)
- [ ] Test email sent/received successfully
- [ ] Webmail accessible (if configured)
- [ ] Monitoring dashboards show data

**Email System Working When:**
- [ ] SMTP authentication works
- [ ] IMAP connections successful
- [ ] DKIM signing active
- [ ] SPF/DKIM/DMARC validation passes
- [ ] No spam in test emails
- [ ] Backups running (check cronjob)

---

## 🚀 Next Steps After Testing

### For Production Migration
1. **Validate all functionality** on `gaudy.com.au`
2. **Update configurations** for `yirrasystems.com`
3. **Repeat deployment** process for production
4. **Migrate mailboxes** from Zoho
5. **Update MX records** to point to new system

### Performance Optimization
1. **Tune resource limits** based on usage
2. **Configure monitoring alerts**
3. **Set up log aggregation**
4. **Implement backup verification**

### Security Hardening
1. **Enable MTA-STS enforcement** (change from testing to enforce)
2. **Configure DMARC quarantine** (change from none to quarantine)
3. **Set up TLS reporting** monitoring
4. **Review and tighten policies**

---

## 📞 Support

**Issues during deployment:**
1. Check pod status: `kubectl get pods -n email-system`
2. Check logs: `kubectl logs <pod-name> -n email-system`
3. Validate DNS: `./validate-dns.sh gaudy.com.au`
4. Check service connectivity

**Email delivery issues:**
1. Test SMTP: `telnet mail.gaudy.com.au 25`
2. Check queue: `kubectl exec daemonset/mailedge -c postfix -- mailq`
3. Review headers of test emails

---

*Deployment Guide v1.0 - Gaudie Email System Test Deployment*
*Last updated: November 8, 2025*
