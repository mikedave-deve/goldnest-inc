const nodemailer = require('nodemailer');

// ============================================================
// PRODUCTION EMAIL SERVICE - GMAIL SMTP
// ============================================================

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Production settings
  pool: true, // Use connection pooling
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000, // Rate limiting
  rateLimit: 10, // Max 10 emails per second
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Gmail SMTP configuration error:', error.message);
    console.log('📧 Email service disabled. Check SMTP credentials in .env');
  } else {
    console.log('✅ Gmail SMTP ready - Production email service active');
    console.log(`📧 Sending emails from: ${process.env.SMTP_USER}`);
  }
});

// ============================================================
// HELPER FUNCTION - Send Email with Retry
// ============================================================

const sendEmail = async (to, subject, html, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || `GoldNest <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
        // Add plain text version for better deliverability
        text: html.replace(/<[^>]*>/g, ''),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`❌ Email attempt ${attempt} failed:`, error.message);
      
      if (attempt === retries) {
        console.error('❌ All email attempts failed');
        return null;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// ============================================================
// EMAIL TEMPLATES
// ============================================================

// Base email template wrapper for consistent styling
const emailWrapper = (content, title = 'GoldNest Investment') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #000; border-radius: 10px; overflow: hidden;">
          ${content}
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px;">
        <p style="color: #666; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} GoldNest Investment Platform. All rights reserved.<br>
          This is an automated email, please do not reply.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// Header template
const emailHeader = (title, icon = '🌟') => `
<tr>
  <td style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 40px 30px; text-align: center;">
    <h1 style="margin: 0; color: #000; font-size: 32px;">${icon} ${title}</h1>
  </td>
</tr>
`;

// Content section template
const emailContent = (html) => `
<tr>
  <td style="background-color: #1a1a1a; padding: 40px 30px; color: #fff;">
    ${html}
  </td>
</tr>
`;

// Button template
const emailButton = (url, text) => `
<table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
  <tr>
    <td align="center">
      <a href="${url}" style="background-color: #FFD700; color: #000; padding: 15px 40px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; font-size: 16px;">
        ${text}
      </a>
    </td>
  </tr>
</table>
`;

// Info box template
const infoBox = (title, items) => `
<table width="100%" cellpadding="0" cellspacing="0" style="background-color: #2a2a2a; border-radius: 5px; margin: 20px 0;">
  <tr>
    <td style="padding: 20px;">
      <h3 style="color: #FFD700; margin: 0 0 15px 0;">${title}</h3>
      ${items.map(item => `
        <p style="color: #ddd; margin: 8px 0; line-height: 1.6;">
          <strong>${item.label}:</strong> ${item.value}
        </p>
      `).join('')}
    </td>
  </tr>
</table>
`;

// ============================================================
// 1. REGISTRATION PENDING EMAIL
// ============================================================

const sendRegistrationPending = async (email, username) => {
  const content = emailHeader('Welcome to GoldNest', '🎉') + emailContent(`
    <h2 style="color: #FFD700; margin: 0 0 20px 0;">Hello ${username}!</h2>
    <p style="color: #ddd; line-height: 1.8; font-size: 16px;">
      Thank you for registering with <strong style="color: #FFD700;">GoldNest Investment Platform</strong>.
    </p>
    <p style="color: #ddd; line-height: 1.8; font-size: 16px;">
      Your account is currently <strong style="color: #FFA500;">pending admin approval</strong>.
    </p>
    
    ${infoBox('What Happens Next?', [
      { label: '⏳ Step 1', value: 'Admin reviews your registration (24-48 hours)' },
      { label: '✉️ Step 2', value: 'You receive approval confirmation email' },
      { label: '🚀 Step 3', value: 'Login and start investing immediately' }
    ])}
    
    <div style="background-color: #FFD700; color: #000; padding: 20px; border-radius: 5px; margin: 30px 0; text-align: center;">
      <p style="margin: 0; font-weight: bold; font-size: 16px;">
        💰 Minimum Deposit: $50 | 📈 Up to 20% Returns
      </p>
    </div>
    
    <p style="color: #999; font-size: 14px; margin-top: 40px; padding-top: 20px; border-top: 1px solid #333;">
      Need assistance? Contact us at <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #FFD700;">${process.env.ADMIN_EMAIL}</a>
    </p>
  `);
  
  return await sendEmail(email, 'Registration Pending - GoldNest Investment', emailWrapper(content));
};

// ============================================================
// 2. REGISTRATION APPROVED EMAIL
// ============================================================

const sendRegistrationApproved = async (email, username) => {
  const content = emailHeader('Account Approved!', '✅') + emailContent(`
    <h2 style="color: #FFD700; margin: 0 0 20px 0;">Congratulations ${username}!</h2>
    <p style="color: #ddd; line-height: 1.8; font-size: 16px;">
      Your GoldNest Investment account has been <strong style="color: #00FF00;">approved</strong>!
    </p>
    <p style="color: #ddd; line-height: 1.8; font-size: 16px;">
      You can now login and start building your investment portfolio with confidence.
    </p>
    
    ${emailButton('http://goldnest-inc.biz/login', 'Login to Dashboard')}
    
    ${infoBox('Available Investment Plans', [
      { label: '🥉 Basic Plan', value: '1.5% daily for 365 days ($50 - $499)' },
      { label: '🥈 Professional Plan', value: '2.5% daily for 365 days ($500 - $1,499)' },
      { label: '🥇 Golden Plan', value: '5.0% daily for 365 days ($1,500 - $2,999)' },
      { label: '💎 VIP Trial', value: '10% after 24 hours ($3,000 - $6,999)' },
      { label: '👑 Investors Plan', value: '20% after 24 hours ($10,000+)' }
    ])}
    
    <div style="background-color: #2a2a2a; padding: 20px; border-radius: 5px; border-left: 4px solid #FFD700; margin: 30px 0;">
      <p style="color: #ddd; margin: 0; line-height: 1.6;">
        <strong style="color: #FFD700;">🔒 Security Tip:</strong> Keep your account credentials secure and enable two-factor authentication when available.
      </p>
    </div>
    
    <p style="color: #999; font-size: 14px; margin-top: 40px;">
      Questions? Our support team is here to help at <a href="mailto:${process.env.ADMIN_EMAIL}" style="color: #FFD700;">${process.env.ADMIN_EMAIL}</a>
    </p>
  `);
  
  return await sendEmail(email, 'Welcome to GoldNest - Account Approved! 🎉', emailWrapper(content));
};

// ============================================================
// 3. DEPOSIT PENDING EMAIL
// ============================================================

const sendDepositPending = async (email, username, amount, currency, plan) => {
  const content = emailHeader('Deposit Received', '💰') + emailContent(`
    <h2 style="color: #FFD700; margin: 0 0 20px 0;">Hello ${username},</h2>
    <p style="color: #ddd; line-height: 1.8; font-size: 16px;">
      We have received your deposit and it is currently being verified.
    </p>
    
    ${infoBox('Deposit Details', [
      { label: '💵 Amount', value: `<span style="color: #FFD700; font-size: 24px; font-weight: bold;">$${amount}</span>` },
      { label: '💱 Currency', value: currency.toUpperCase() },
      { label: '📊 Plan', value: plan },
      { label: '⏱️ Status', value: '<span style="color: #FFA500;">Pending Verification</span>' }
    ])}
    
    <div style="background-color: #2a2a2a; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
      <p style="color: #FFD700; margin: 0; font-size: 18px; font-weight: bold;">
        ⏱️ Verification Time: 1-24 hours
      </p>
      <p style="color: #ddd; margin: 10px 0 0 0; font-size: 14px;">
        You'll receive a confirmation email once approved
      </p>
    </div>
    
    ${emailButton('http://goldnest-inc.biz/PostDashboard', 'View Dashboard')}
  `);
  
  return await sendEmail(email, `Deposit Received - $${amount} | GoldNest`, emailWrapper(content));
};

// ============================================================
// 4. DEPOSIT APPROVED EMAIL
// ============================================================

const sendDepositApproved = async (email, username, amount, currency, plan, expectedProfit) => {
  const content = emailHeader('Deposit Approved!', '✅') + emailContent(`
    <h2 style="color: #FFD700; margin: 0 0 20px 0;">Excellent News ${username}!</h2>
    <p style="color: #ddd; line-height: 1.8; font-size: 16px;">
      Your deposit has been <strong style="color: #00FF00;">verified and approved</strong>! Your investment is now active and generating returns.
    </p>
    
    ${infoBox('Investment Summary', [
      { label: '💵 Principal', value: `<span style="color: #FFD700; font-size: 24px; font-weight: bold;">$${amount}</span>` },
      { label: '💱 Currency', value: currency.toUpperCase() },
      { label: '📊 Plan', value: plan },
      { label: '📈 Expected Profit', value: `<span style="color: #00FF00; font-weight: bold;">$${expectedProfit}</span>` },
      { label: '✅ Status', value: '<span style="color: #00FF00; font-weight: bold;">ACTIVE</span>' }
    ])}
    
    <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 25px; border-radius: 5px; margin: 30px 0; text-align: center;">
      <p style="color: #000; margin: 0; font-size: 20px; font-weight: bold;">
        🎯 Your profits are now accumulating!
      </p>
      <p style="color: #000; margin: 10px 0 0 0; font-size: 14px;">
        Track your earnings in real-time on your dashboard
      </p>
    </div>
    
    ${emailButton('http://goldnest-inc.biz/PostDashboard', 'View My Investments')}
  `);
  
  return await sendEmail(email, `Investment Active! $${amount} Approved 🚀`, emailWrapper(content));
};

// ============================================================
// 5. WITHDRAWAL REQUESTED EMAIL
// ============================================================

const sendWithdrawalRequested = async (email, username, amount, currency, walletAddress) => {
  const content = emailHeader('Withdrawal Request', '💸') + emailContent(`
    <h2 style="color: #FFD700; margin: 0 0 20px 0;">Hello ${username},</h2>
    <p style="color: #ddd; line-height: 1.8; font-size: 16px;">
      Your withdrawal request has been received and is being processed.
    </p>
    
    ${infoBox('Withdrawal Details', [
      { label: '💰 Amount', value: `<span style="color: #FFD700; font-size: 24px; font-weight: bold;">$${amount}</span>` },
      { label: '💱 Currency', value: currency.toUpperCase() },
      { label: '🏦 Wallet Address', value: `<code style="color: #FFA500; word-break: break-all; font-size: 12px;">${walletAddress}</code>` },
      { label: '⏱️ Status', value: '<span style="color: #FFA500;">Processing</span>' }
    ])}
    
    <div style="background-color: #2a2a2a; padding: 20px; border-radius: 5px; margin: 20px 0;">
      <p style="color: #ddd; margin: 0; line-height: 1.6;">
        <strong style="color: #FFD700;">⏱️ Processing Time:</strong> 24-48 hours<br>
        <strong style="color: #FFD700;">🔔 Next Step:</strong> You'll receive confirmation once payment is sent
      </p>
    </div>
  `);
  
  return await sendEmail(email, `Withdrawal Processing - $${amount} ${currency.toUpperCase()}`, emailWrapper(content));
};

// ============================================================
// 6. WITHDRAWAL APPROVED EMAIL
// ============================================================

const sendWithdrawalApproved = async (email, username, amount, currency, walletAddress) => {
  const content = emailHeader('Withdrawal Approved!', '✅') + emailContent(`
    <h2 style="color: #FFD700; margin: 0 0 20px 0;">Withdrawal Approved ${username}!</h2>
    <p style="color: #ddd; line-height: 1.8; font-size: 16px;">
      Your withdrawal request has been <strong style="color: #00FF00;">approved</strong> and payment is being sent to your wallet.
    </p>
    
    ${infoBox('Withdrawal Confirmation', [
      { label: '💰 Amount', value: `<span style="color: #00FF00; font-size: 24px; font-weight: bold;">$${amount}</span>` },
      { label: '💱 Currency', value: currency.toUpperCase() },
      { label: '🏦 Wallet Address', value: `<code style="color: #FFA500; word-break: break-all; font-size: 12px;">${walletAddress}</code>` },
      { label: '✅ Status', value: '<span style="color: #00FF00; font-weight: bold;">COMPLETED</span>' }
    ])}
    
    <div style="background: linear-gradient(135deg, #00FF00, #00cc00); padding: 25px; border-radius: 5px; margin: 30px 0; text-align: center;">
      <p style="color: #000; margin: 0; font-size: 20px; font-weight: bold;">
        🎉 Your withdrawal has been processed!
      </p>
      <p style="color: #000; margin: 10px 0 0 0; font-size: 14px;">
        Funds should arrive in your wallet within 24 hours
      </p>
    </div>
  `);
  
  return await sendEmail(email, `Withdrawal Approved! $${amount} Sent 💸`, emailWrapper(content));
};

// ============================================================
// 7. WITHDRAWAL REJECTED EMAIL
// ============================================================

const sendWithdrawalRejected = async (email, username, amount, currency, rejectionReason) => {
  const content = emailHeader('Withdrawal Declined', '⚠️') + emailContent(`
    <h2 style="color: #FFD700; margin: 0 0 20px 0;">Hello ${username},</h2>
    <p style="color: #ddd; line-height: 1.8; font-size: 16px;">
      Unfortunately, your withdrawal request has been <strong style="color: #ff4444;">declined</strong>.
    </p>
    
    ${infoBox('Withdrawal Details', [
      { label: '💰 Amount', value: `$${amount} ${currency.toUpperCase()}` },
      { label: '📅 Request Date', value: new Date().toLocaleDateString() },
      { label: '❌ Status', value: 'REJECTED' }
    ])}
    
    <div style="background-color: #2a2a2a; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff4444;">
      <h3 style="color: #FFD700; margin: 0 0 10px 0;">Reason for Rejection:</h3>
      <p style="color: #ddd; margin: 0; line-height: 1.6;">
        ${rejectionReason || 'No specific reason provided. Please contact support.'}
      </p>
    </div>
    
    <p style="color: #ddd; line-height: 1.8; font-size: 16px;">
      Your funds remain in your account balance and are available for future withdrawals or investments.
    </p>
    
    ${emailButton('http://goldnest-inc.biz/support', 'Contact Support')}
    
    <p style="color: #999; font-size: 14px; margin-top: 30px; text-align: center;">
      Need help? Email us at ${process.env.ADMIN_EMAIL}
    </p>
  `);
  
  return await sendEmail(email, `Withdrawal Declined - $${amount} ${currency.toUpperCase()}`, emailWrapper(content));
};

// ============================================================
// 8. PASSWORD CHANGED EMAIL
// ============================================================

const sendPasswordChanged = async (email, username, ipAddress) => {
  const content = emailHeader('Security Alert', '🔒') + emailContent(`
    <h2 style="color: #FFD700; margin: 0 0 20px 0;">Hello ${username},</h2>
    <p style="color: #ddd; line-height: 1.8; font-size: 16px;">
      Your password has been successfully changed.
    </p>
    
    ${infoBox('Security Details', [
      { label: '⏰ Time', value: new Date().toLocaleString() },
      { label: '🌐 IP Address', value: ipAddress }
    ])}
    
    <div style="background-color: #ff4444; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff0000;">
      <p style="color: #fff; margin: 0; font-weight: bold;">
        ⚠️ Did not make this change?
      </p>
      <p style="color: #fff; margin: 10px 0 0 0;">
        Contact us immediately at ${process.env.ADMIN_EMAIL}
      </p>
    </div>
    
    ${emailButton('http://goldnest-inc.biz/login', 'Login with New Password')}
  `);
  
  return await sendEmail(email, '🔒 Password Changed - GoldNest Security Alert', emailWrapper(content));
};

// ============================================================
// 9. PASSWORD RESET CONFIRMATION EMAIL (Email 1 - NEW)
// Matches first screenshot: "Password request confirmation"
// ============================================================

const sendPasswordResetConfirmation = async (email, username, token) => {
  // Build reset URL with token
  const resetUrl = `http://goldnest-inc.biz/?a=forgot_password&action=confirm&c=${token}`;
  
  // Simple HTML matching screenshot format
  const html = `
    <p>Hello ${username},</p>
    
    <p>Please confirm your request for password reset.</p>
    
    <p>Copy and paste this link to your browser:</p>
    <p><a href="${resetUrl}" style="color: #4a9eff; word-break: break-all;">${resetUrl}</a></p>
    
    <p>Thank you.</p>
    <p><a href="http://goldnest-inc.biz" style="color: #4a9eff;">goldnest-inc.biz</a></p>
  `;
  
  return await sendEmail(email, 'Password request confirmation', html);
};

// ============================================================
// 10. PASSWORD RESET COMPLETE EMAIL (Email 2 - NEW)
// Matches second screenshot: "The password you requested"
// ============================================================

const sendPasswordResetComplete = async (email, username, newPassword, ipAddress) => {
  // Simple HTML matching screenshot format
  const html = `
    <p>Hello ${username},</p>
    
    <p>Someone (most likely you) requested your username and password from the IP ${ipAddress}.</p>
    <p><strong>Your password has been changed!!!</strong></p>
    
    <p>You can log into our account with:</p>
    
    <p><strong>Username:</strong> ${username}<br>
    <strong>Password:</strong> ${newPassword}</p>
    
    <p>Hope that helps.</p>
  `;
  
  return await sendEmail(email, 'The password you requested', html);
};

// ============================================================
// 11. ADMIN NEW USER NOTIFICATION
// ============================================================

const sendAdminNewUserNotification = async (username, email) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const subject = `🆕 New User Registration: ${username}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
      <h2 style="color: #333;">New User Registration</h2>
      <div style="background: white; padding: 20px; border-radius: 5px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Username:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${username}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Status:</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><span style="color: orange; font-weight: bold;">PENDING APPROVAL</span></td>
          </tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="http://goldnest-inc.biz/admin/users" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Review User
          </a>
        </p>
      </div>
    </div>
  `;
  
  return await sendEmail(adminEmail, subject, html);
};

// ============================================================
// 12. ADMIN DEPOSIT NOTIFICATION
// ============================================================

const sendAdminDepositNotification = async (username, email, amount, currency, plan) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const subject = `💰 New Deposit: $${amount} from ${username}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
      <h2 style="color: #333;">New Deposit Request</h2>
      <div style="background: white; padding: 20px; border-radius: 5px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">User:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${username} (${email})</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Amount:</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong style="color: green; font-size: 18px;">$${amount}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Currency:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${currency.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Plan:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${plan}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Status:</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><span style="color: orange; font-weight: bold;">PENDING VERIFICATION</span></td>
          </tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="http://goldnest-inc.biz/admin/deposits" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Review Deposit
          </a>
        </p>
      </div>
    </div>
  `;
  
  return await sendEmail(adminEmail, subject, html);
};

// ============================================================
// 13. ADMIN WITHDRAWAL NOTIFICATION
// ============================================================

const sendAdminWithdrawalNotification = async (username, email, amount, currency, walletAddress) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const subject = `💸 New Withdrawal: $${amount} ${currency.toUpperCase()} from ${username}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
      <h2 style="color: #333;">New Withdrawal Request</h2>
      <div style="background: white; padding: 20px; border-radius: 5px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">User:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${username} (${email})</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Amount:</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong style="color: red; font-size: 18px;">$${amount}</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Currency:</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${currency.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Wallet:</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><code style="word-break: break-all;">${walletAddress}</code></td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Status:</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><span style="color: orange; font-weight: bold;">AWAITING APPROVAL</span></td>
          </tr>
        </table>
        <p style="margin-top: 20px;">
          <a href="http://goldnest-inc.biz/admin/withdrawals" style="background-color: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Review Withdrawal
          </a>
        </p>
      </div>
    </div>
  `;
  
  return await sendEmail(adminEmail, subject, html);
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  sendEmail,
  sendRegistrationPending,
  sendRegistrationApproved,
  sendDepositPending,
  sendDepositApproved,
  sendWithdrawalRequested,
  sendWithdrawalApproved,
  sendWithdrawalRejected, // NEW - Add rejection email
  sendPasswordChanged,
  sendPasswordResetConfirmation, // NEW - Email 1
  sendPasswordResetComplete, // NEW - Email 2
  sendAdminNewUserNotification,
  sendAdminDepositNotification,
  sendAdminWithdrawalNotification,
  transporter, // Export for testing
};