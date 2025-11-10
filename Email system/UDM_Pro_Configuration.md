# UDM Pro Configuration Guide for Email System

## 📋 Current Status

**Your Server IP:** `122.199.30.183`
**Email System Ports:**
- ✅ **IMAP (143):** Open to all interfaces
- ❌ **SMTP (25/587/465):** Only localhost (needs external access)

## 🔧 UDM Pro Configuration Required

### 1. Firewall Rules (Port Forwarding)

**Access UDM Pro Web Interface:**
1. Open browser to `https://192.168.1.1` (or your UDM IP)
2. Login with admin credentials

**Navigate to Port Forwarding:**
```
Settings → Networks → [Your Network] → Port Forwarding
```

**Add These Rules:**

#### Rule 1: SMTP (Port 25)
```
Name: Email SMTP
Protocol: TCP
Source: Any
Destination: 122.199.30.183
Port: 25 → 25
```

#### Rule 2: SMTP Submission (Port 587)
```
Name: Email SMTP Submission
Protocol: TCP
Source: Any
Destination: 122.199.30.183
Port: 587 → 587
```

#### Rule 3: SMTPS (Port 465)
```
Name: Email SMTPS
Protocol: TCP
Source: Any
Destination: 122.199.30.183
Port: 465 → 465
```

#### Rule 4: IMAPS (Port 993) - Optional
```
Name: Email IMAPS
Protocol: TCP
Source: Any
Destination: 122.199.30.183
Port: 993 → 993
```

### 2. Firewall Rules (Traffic Rules)

**Navigate to Firewall Rules:**
```
Settings → Security → Firewall → Rules
```

**Add WAN to LAN Rule:**
```
Name: Allow Email Ports
Type: WAN to LAN
Protocol: TCP
Source: Any
Destination: 122.199.30.183
Ports: 25,587,465,143,993
Action: Accept
```

### 3. Advanced Firewall (GeoIP Blocking - Optional)

**Block High-Risk Countries:**
```
Settings → Security → Threat Management → Country Blocking
```
- Consider blocking countries with high spam/bot activity
- Common blocks: Russia, China, Brazil, India (use cautiously)

---

## 🧪 Testing Configuration

### After UDM Configuration:

**Test SMTP Ports:**
```bash
# Test from external machine
telnet mail.gaudy.com.au 25
telnet mail.gaudy.com.au 587
telnet mail.gaudy.com.au 465
```

**Test IMAP Port:**
```bash
telnet mail.gaudy.com.au 143
telnet mail.gaudy.com.au 993
```

**Expected Response:**
```
Trying 122.199.30.183...
Connected to mail.gaudy.com.au.
Escape character is '^]'.
220 mail.gaudy.com.au ESMTP Postfix
```

---

## 🔒 Security Considerations

### Rate Limiting (Recommended)
```
Settings → Security → Threat Management → DoS/DDOS Protection
```
- Enable SYN flood protection
- Set connection limits per IP

### Port-Specific Rules
- **Port 25:** Consider restricting to known mail servers only
- **Ports 587/465:** Allow from anywhere (authenticated)
- **Ports 143/993:** Allow from trusted networks

### Monitoring
```
Settings → Security → Traffic & Logs
```
- Monitor email port traffic
- Set up alerts for unusual activity

---

## 🚨 Important Notes

### SMTP Port 25 Blocking
Many ISPs block outbound port 25. If you're testing from home:
- Use ports 587 (submission) or 465 (SMTPS) instead
- Configure email clients to use port 587 with STARTTLS

### IPv6 Considerations
If you have IPv6 enabled:
- UDM Pro may need IPv6 port forwarding rules
- Test both IPv4 and IPv6 connectivity

### DNS Propagation
DNS changes take 24-48 hours. After UDM config:
```bash
# Test DNS resolution
dig MX gaudy.com.au
dig A mail.gaudy.com.au
```

---

## 🔄 Troubleshooting

### If Ports Still Blocked:
1. **Check UDM Rules:** Verify rules are active and correct
2. **Firewall Logs:** Check UDM logs for blocked traffic
3. **Server Firewall:** Ensure server firewall allows the ports
4. **Network Path:** Test from different networks

### Common Issues:
- **Double NAT:** UDM behind another router
- **VPN Interference:** Corporate VPN blocking ports
- **ISP Blocking:** ISP blocks port 25 outbound

---

## 📊 Post-Configuration Checklist

- [ ] Port forwarding rules added for 25,587,465,143,993
- [ ] Firewall rules allow traffic to server
- [ ] External connectivity tested
- [ ] Email client configuration updated
- [ ] Spam filtering tested
- [ ] Monitoring enabled

---

## 🎯 Next Steps After UDM Config

1. **Test External Access:** Send/receive emails from outside network
2. **Configure Email Clients:** Thunderbird, Outlook, etc.
3. **Test Spam Filtering:** Send test spam to verify Rspamd
4. **Enable SSL/TLS:** Upgrade from plain text to encrypted
5. **Monitor Logs:** Watch for unauthorized access attempts

---

*UDM Pro Configuration Guide - Gaudie Email System*
*Last updated: November 8, 2025*
