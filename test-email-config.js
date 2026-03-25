// Quick email test - Run with: node test-email-config.js
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

console.log('🔍 Testing Email Configuration...\n');
console.log('Email User:', process.env.EMAIL_USER);
console.log('Email Service:', process.env.EMAIL_SERVICE || 'gmail');
console.log('Password Length:', process.env.EMAIL_PASSWORD?.length || 0, 'characters\n');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('❌ FAILED:', error.message);
    console.error('\n💡 Solution: Regenerate your Gmail App Password at:');
    console.error('   https://myaccount.google.com/apppasswords\n');
    console.error('Error Code:', error.code);
    if (error.code === 'EAUTH') {
      console.error('⚠️  This means the password is invalid or expired.');
      console.error('⚠️  Generate a NEW app password and update .env.local\n');
    }
  } else {
    console.log('✅ SUCCESS! Email configuration is working!\n');
    console.log('You can now use the password reset feature.\n');
  }
  
  process.exit(error ? 1 : 0);
});
