# 🔐 Email Configuration Guide for Password Reset

## Quick Setup for Gmail (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security** in the left sidebar
3. Under "Signing in to Google", click **2-Step Verification**
4. Follow the steps to enable 2FA

### Step 2: Generate App Password
1. After enabling 2FA, go to: https://myaccount.google.com/apppasswords
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter "Axionix AI"
4. Click **Generate**
5. Copy the **16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env.local
```env
EMAIL_SERVICE=gmail
EMAIL_USER=axionix.auth@gmail.com
EMAIL_PASSWORD=abcdefghjklmnop  # Remove spaces! Just the 16 characters
EMAIL_FROM=noreply@axionix.ai
```

**⚠️ IMPORTANT:** 
- App passwords are exactly 16 characters
- Remove any spaces from the password
- Case-sensitive (use lowercase)

---

## Alternative: Use Your Own Domain Email

If you have a custom domain email:

```env
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587
EMAIL_USER=your@yourdomain.com
EMAIL_PASSWORD=your_password
EMAIL_FROM=noreply@axionix.ai
```

---

## Common Errors & Solutions

### Error: "Invalid Login" or "Authentication Failed"
**Cause:** Wrong app password or regular password instead of app password

**Solution:**
1. Make sure you're using an **App Password**, not your regular Gmail password
2. Remove all spaces from the app password
3. Verify 2FA is enabled on the Google account

---

### Error: "Connection Timeout"
**Cause:** Firewall or network blocking SMTP connection

**Solution:**
1. Check if port 587 is open on your network
2. Try using port 465 with SSL instead
3. Contact your network administrator

---

### Error: "Less secure app access"
**Cause:** Google blocks apps that don't use OAuth2

**Solution:**
- This is why we use **App Passwords** - they bypass this restriction
- Make sure you generated an app password specifically for mail

---

### Error: "Recipient Not Found" or "User Does Not Exist"
**Cause:** Trying to send to invalid email addresses

**Solution:**
- Ensure the email address in the database is valid
- Check for typos in the email field

---

## Testing Your Configuration

### Test 1: Verify Environment Variables
Restart your dev server after updating `.env.local`:
```bash
npm run dev
```

### Test 2: Check Console Logs
When you request a password reset, check the terminal for:
```
✓ Email transporter verified successfully
Sending password reset email to: user@example.com
✓ Email sent successfully: <message-id>
```

### Test 3: Check Spam Folder
If emails aren't arriving:
1. Check spam/junk folder
2. Add `axionix.auth@gmail.com` to contacts
3. Wait 2-5 minutes for delivery

---

## Troubleshooting Command

Run this to test email configuration directly:

```javascript
// Create a test file: test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email verification failed:', error.message);
  } else {
    console.log('✅ Email configuration successful!');
  }
});
```

Run with:
```bash
node test-email.js
```

---

## Security Best Practices

✅ **DO:**
- Use app passwords (not regular passwords)
- Keep `.env.local` private (never commit to Git)
- Rotate app passwords periodically
- Use rate limiting on password reset endpoint

❌ **DON'T:**
- Commit `.env.local` to version control
- Share your app password publicly
- Use the same app password across multiple projects
- Store plain text passwords in code

---

## Need Help?

Check the server logs for detailed error messages:
```bash
# In development, check the terminal output
# Look for lines starting with:
✗ Email transporter verification failed: ...
Error details: { message: ..., code: ... }
```

Common error codes:
- `EAUTH` → Authentication failed (wrong password)
- `ECONNECTION` → Can't connect to email server
- `ESOCKET` → Connection timeout
- `EMESSAGE` → Error sending message
