# Thunderbird Email Setup Guide - Gaudie Test Domain

## 📧 Test Accounts

| Email Address | Password | Purpose |
|---------------|----------|---------|
| `admin@gaudy.com.au` | `TestPass123!` | Primary test account |
| `test@gaudy.com.au` | `TestPass123!` | Secondary test account |

## 🔧 Thunderbird Configuration Steps

### Step 1: Account Setup
1. **Open Thunderbird**
2. **Click "Create a new account"** → **"Email"**
3. **Enter your details:**
   - **Name:** Gaudie Admin (or your preferred display name)
   - **Email address:** `admin@gaudy.com.au`
   - **Password:** `TestPass123!`
4. **Click "Configure manually"** (don't let Thunderbird auto-detect)

### Step 2: Incoming Server (IMAP)
```
Server Type: IMAP Mail Server
Server: mail.gaudy.com.au
Port: 143
SSL: None
Authentication: Normal password
Username: admin@gaudy.com.au
```

### Step 3: Outgoing Server (SMTP)
```
Server: mail.gaudy.com.au
Port: 587
SSL: None
Authentication: Normal password
Username: admin@gaudy.com.au
```

### Step 4: Advanced Settings
- **Check "Allow Thunderbird to manage folders"**
- **Connection security:** None (for testing)
- **Authentication method:** Normal password

## 🧪 Testing Your Setup

### Send a Test Email
1. **Compose new email:**
   - To: `test@gaudy.com.au`
   - Subject: "Test Email from Thunderbird"
   - Body: "This email tests the Gaudie email system!"
2. **Send the email**
3. **Check if it arrives in the test@gaudy.com.au inbox**

### Check Email Reception
1. **Switch to test account** in Thunderbird
2. **Look for the test email** you just sent
3. **Reply to confirm** two-way communication works

## 🔒 Security Notes

### Current Setup (Testing)
- **No SSL/TLS encryption** (for easier testing)
- **Plain text authentication** (simplified)
- **No spam filtering** (basic testing)

### Production Setup (After Testing)
- **Enable SSL/TLS** on ports 993 (IMAPS) and 465 (SMTPS)
- **Use secure authentication**
- **Enable DKIM/SPF/DMARC validation**
- **Configure spam filtering**

## 🚨 Troubleshooting

### Connection Issues
- **"Unable to connect":** Check if external ports are accessible
- **"Authentication failed":** Verify password and username
- **"Server not found":** DNS propagation may still be in progress

### Test External Connectivity First
```bash
# Test from external network:
telnet mail.gaudy.com.au 143  # IMAP
telnet mail.gaudy.com.au 587  # SMTP
```

### Common Thunderbird Errors
- **"Server settings are incorrect":** Double-check port numbers and server names
- **"Authentication failed":** Ensure username is full email address
- **"Connection refused":** External connectivity not working through UDM Pro

## 📊 Expected Behavior

### Successful Setup Indicators:
- ✅ **Account setup completes** without errors
- ✅ **Inbox loads** and shows folders
- ✅ **Send/Receive works** without connection errors
- ✅ **Emails appear** in both test accounts
- ✅ **No security warnings** (since SSL disabled for testing)

### Performance:
- **Fast connection** (local network)
- **Immediate send/receive** (no queuing delays)
- **Full IMAP sync** (all folders visible)

## 🎯 Next Steps After Thunderbird Setup

1. **Test basic email functionality**
2. **Send emails between accounts**
3. **Test from different devices/networks**
4. **Verify spam filtering** (send test spam)
5. **Configure SSL/TLS** for production use
6. **Set up additional email clients** (phone, webmail)

## 📞 Support

**If Thunderbird setup fails:**
1. Verify external connectivity works (telnet tests above)
2. Check Thunderbird error messages in detail
3. Try the secondary account (`test@gaudy.com.au`)
4. Confirm DNS records are fully propagated

**Current Status:** Email system is ready for client configuration and testing!
