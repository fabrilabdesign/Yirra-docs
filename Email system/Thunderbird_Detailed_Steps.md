# Thunderbird Setup - Detailed Step-by-Step Guide

## 📧 Account Details
- **Email Address:** `admin@gaudy.com.au`
- **Password:** `TestPass123!`
- **Your Name:** Gaudie Admin (or your preferred display name)

---

## 🔧 Step-by-Step Thunderbird Configuration

### Step 1: Start Thunderbird
1. Open Thunderbird
2. If you see the welcome screen, click **"Skip this and use my existing email"**
3. Or go to **Menu** → **File** → **New** → **Existing Mail Account**

### Step 2: Enter Account Information
```
Your full name: Gaudie Admin
Email address: admin@gaudy.com.au
Password: TestPass123!
```

### Step 3: Manual Configuration
When Thunderbird says **"Thunderbird failed to find the settings for your email account"**:

**Click: "Configure manually"**

### Step 4: Incoming Server Settings
```
Protocol: IMAP
Hostname: mail.gaudy.com.au  ← This is the "Server" field
Port: 143
SSL: None
Authentication: Normal password
Username: admin@gaudy.com.au
```

### Step 5: Outgoing Server Settings
```
Hostname: mail.gaudy.com.au  ← This is the "Server" field
Port: 587
SSL: None
Authentication: Normal password
Username: admin@gaudy.com.au
```

### Step 6: Advanced Settings (Optional)
- **IMAP server directory:** (leave empty)
- **This server requires a secure connection (SSL):** Unchecked
- **Use secure authentication:** Unchecked

---

## 🖥️ Screenshot Guide

### Manual Configuration Screen:
```
┌─ Account Setup ──────────────────────────────┐
│                                             │
│ Incoming:                                   │
│   IMAP ┌─────────────────────────────────┐  │
│        │ mail.gaudy.com.au              │  │ ← Hostname/Server
│        └─────────────────────────────────┘  │
│   Port: 143                                │
│   SSL: None                                │
│                                             │
│ Outgoing:                                  │
│   ┌─────────────────────────────────────┐   │
│   │ mail.gaudy.com.au                   │   │ ← Hostname/Server
│   └─────────────────────────────────────┘   │
│   Port: 587                                │
│   SSL: None                                │
└─────────────────────────────────────────────┘
```

---

## 🔍 Field Name Clarification

In Thunderbird, the fields are labeled as:
- **"Server"** (not "Hostname" - that's just terminology)
- **"Server hostname"** in some dialogs
- **"Mail server"** in account properties

All of these mean the same thing: `mail.gaudy.com.au`

---

## 🧪 Testing Your Setup

### Step 1: Test Account
After setup, Thunderbird will test the connection. You should see:
- ✅ **"Login to server"** - Success
- ✅ **"Send test email"** - Success

### Step 2: Send Test Email
1. **Compose new email:**
   - To: `test@gaudy.com.au`
   - Subject: "Thunderbird Test"
   - Message: "Testing email system!"
2. **Click Send**

### Step 3: Check Reception
1. **Create second account** in Thunderbird for `test@gaudy.com.au`
2. **Check if test email arrived**
3. **Reply to confirm** round-trip works

---

## 🚨 Common Issues & Solutions

### "Hostname not found"
- **Problem:** DNS not propagated
- **Solution:** Wait 24-48 hours or check DNS with `./validate-dns.sh gaudy.com.au`

### "Connection refused"
- **Problem:** UDM Pro port forwarding not working
- **Solution:** Test external connectivity with telnet commands

### "Authentication failed"
- **Problem:** Wrong username/password
- **Solution:** Username must be full email: `admin@gaudy.com.au`

### "Server settings are incorrect"
- **Problem:** Wrong port or SSL settings
- **Solution:** Double-check ports (143 for IMAP, 587 for SMTP) and SSL=None

---

## 📋 Quick Reference

| Field | IMAP (Incoming) | SMTP (Outgoing) |
|-------|-----------------|-----------------|
| **Server/Hostname** | `mail.gaudy.com.au` | `mail.gaudy.com.au` |
| **Port** | `143` | `587` |
| **Security** | `None` | `None` |
| **Authentication** | `Normal password` | `Normal password` |
| **Username** | `admin@gaudy.com.au` | `admin@gaudy.com.au` |

---

## 🎯 Success Indicators

✅ **Account creation completes** without errors
✅ **Inbox loads** and shows mail folders
✅ **Send/Receive buttons work** without connection errors
✅ **Test emails arrive** in other accounts
✅ **No certificate warnings** (SSL disabled for testing)

---

## 📞 Need Help?

If you get stuck:
1. **Take screenshots** of error messages
2. **Check the exact error text** in Thunderbird
3. **Run external connectivity tests** first:
   ```bash
   telnet mail.gaudy.com.au 143
   telnet mail.gaudy.com.au 587
   ```

**The field labeled "Server" or "Hostname" should be: `mail.gaudy.com.au`** 🚀
