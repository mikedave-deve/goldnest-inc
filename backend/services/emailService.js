const nodemailer = require("nodemailer");

// ============================================================
// PRODUCTION EMAIL SERVICE - GMAIL SMTP
// ============================================================

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateDelta: 1000,
  rateLimit: 10,
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Gmail SMTP configuration error:", error.message);
    console.log("📧 Email service disabled. Check SMTP credentials in .env");
  } else {
    console.log("✅ Gmail SMTP ready - Production email service active");
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
        text: html.replace(/<[^>]*>/g, ""),
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error(`❌ Email attempt ${attempt} failed:`, error.message);

      if (attempt === retries) {
        console.error("❌ All email attempts failed");
        return null;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// ============================================================
// MOBILE-FIXED EMAIL TEMPLATE (Black & Gold)
// ============================================================

const emailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    /* Force dark mode colors on all email clients */
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #0a0a0a !important;
    }
    /* Prevent auto-formatting on mobile */
    a { color: #FFD700 !important; }
    .wrapper { background-color: #0a0a0a !important; }
    .container { background-color: #000000 !important; }
  </style>
</head>
<body style="margin: 0 !important; padding: 0 !important; font-family: Arial, Helvetica, sans-serif !important; background-color: #0a0a0a !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <!-- OUTER WRAPPER - FIXED BLACK BACKGROUND -->
  <div style="background-color: #0a0a0a !important; min-height: 100vh; padding: 0; margin: 0;">
    <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0a0a0a !important; padding: 40px 20px; margin: 0;">
      <tr>
        <td align="center" style="background-color: #0a0a0a !important; padding: 0;">
          <!-- INNER CONTAINER - FIXED BLACK WITH GOLD BORDER -->
          <table width="600" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; width: 100%; background-color: #000000 !important; border: 2px solid #FFD700; margin: 0 auto;">
            
            <!-- HEADER WITH LOGO -->
            <tr>
              <td style="background-color: #000000 !important; padding: 30px; text-align: center; border-bottom: 2px solid #FFD700;">
                <div style="font-size: 36px; font-weight: bold; color: #FFD700 !important; letter-spacing: 2px; margin: 0; padding: 0;">
                  GOLDNEST
                </div>
                <div style="font-size: 12px; color: #999999 !important; margin-top: 5px; letter-spacing: 1px; padding: 0;">
                  INVESTMENT PLATFORM
                </div>
              </td>
            </tr>
            
            <!-- CONTENT -->
            ${content}
            
            <!-- FOOTER -->
            <tr>
              <td style="background-color: #0a0a0a !important; padding: 30px; text-align: center; border-top: 1px solid #333333;">
                <p style="color: #666666 !important; font-size: 12px; margin: 0 0 10px 0; padding: 0;">
                  © ${new Date().getFullYear()} GoldNest Investment Platform. All rights reserved.
                </p>
                <p style="color: #666666 !important; font-size: 11px; margin: 0; padding: 0;">
                  This is an automated email. Please do not reply to this message.
                </p>
              </td>
            </tr>
            
          </table>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;

// Content Section - FIXED
const contentSection = (html) => `
<tr>
  <td style="background-color: #000000 !important; padding: 40px 30px; color: #ffffff !important;">
    ${html}
  </td>
</tr>
`;

// Info Box - FIXED
const infoBox = (items) => `
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #0a0a0a !important; border: 1px solid #333333; margin: 25px 0;">
  <tr>
    <td style="padding: 20px; background-color: #0a0a0a !important;">
      ${items
        .map(
          (item, index) => `
        <div style="margin-bottom: ${
          index === items.length - 1 ? "0" : "12px"
        }; padding-bottom: ${
            index === items.length - 1 ? "0" : "12px"
          }; border-bottom: ${
            index === items.length - 1 ? "none" : "1px solid #222222"
          };">
          <div style="color: #999999 !important; font-size: 12px; margin-bottom: 4px;">${
            item.label
          }</div>
          <div style="color: #ffffff !important; font-size: 15px; font-weight: 500;">${
            item.value
          }</div>
        </div>
      `
        )
        .join("")}
    </td>
  </tr>
</table>
`;

// Button - FIXED
const button = (url, text) => `
<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="margin: 30px 0;">
  <tr>
    <td align="center">
      <a href="${url}" style="display: inline-block; background-color: #FFD700 !important; color: #000000 !important; padding: 14px 40px; text-decoration: none; font-weight: bold; font-size: 14px; letter-spacing: 1px; border-radius: 2px; border: none;">
        ${text}
      </a>
    </td>
  </tr>
</table>
`;

// Alert Box - FIXED
const alertBox = (text, type = "info") => {
  const colors = {
    info: "#FFD700",
    success: "#00FF00",
    warning: "#FFA500",
    danger: "#FF4444",
  };
  return `
<div style="background-color: #0a0a0a !important; border-left: 4px solid ${colors[type]}; padding: 15px 20px; margin: 25px 0;">
  <p style="color: #ffffff !important; margin: 0; line-height: 1.6; font-size: 14px;">
    ${text}
  </p>
</div>
`;
};

// ============================================================
// EMAIL FUNCTIONS (UNCHANGED - ONLY TEMPLATE FIXED)
// ============================================================

const sendRegistrationPending = async (email, username) => {
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      Welcome, ${username}
    </h2>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px; margin-bottom: 20px;">
      Thank you for registering with <strong style="color: #FFD700 !important;">GoldNest Investment Platform</strong>.
    </p>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      Your account is currently <strong style="color: #FFA500 !important;">pending admin approval</strong>.
    </p>
    
    ${infoBox([
      {
        label: "STEP 1",
        value: "Admin reviews your registration (24-48 hours)",
      },
      { label: "STEP 2", value: "You receive approval confirmation email" },
      { label: "STEP 3", value: "Login and start investing" },
    ])}
    
    ${alertBox(
      "You will receive an email notification once your account is approved.",
      "info"
    )}
    
    <p style="color: #999999 !important; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #222222;">
      Need assistance? Contact us at <a href="mailto:${
        process.env.ADMIN_EMAIL
      }" style="color: #FFD700 !important; text-decoration: none;">${
    process.env.ADMIN_EMAIL
  }</a>
    </p>
  `);

  return await sendEmail(
    email,
    "Registration Pending - GoldNest Investment",
    emailTemplate(content)
  );
};

const sendRegistrationApproved = async (email, username) => {
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      Account Approved
    </h2>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      Congratulations <strong style="color: #ffffff !important;">${username}</strong>! Your GoldNest Investment account has been approved.
    </p>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      You can now login and start building your investment portfolio.
    </p>
    
    ${button("https://goldnest-inc.com/login", "LOGIN TO DASHBOARD")}
    
    ${infoBox([
      { label: "BASIC PLAN", value: "1.5% daily for 365 days ($50 - $499)" },
      {
        label: "PROFESSIONAL",
        value: "2.5% daily for 365 days ($500 - $1,499)",
      },
      {
        label: "GOLDEN PLAN",
        value: "5.0% daily for 365 days ($1,500 - $2,999)",
      },
      { label: "VIP TRIAL", value: "10% after 24 hours ($3,000 - $6,999)" },
      { label: "INVESTORS PLAN", value: "20% after 24 hours ($10,000+)" },
    ])}
    
    ${alertBox("Keep your account credentials secure at all times.", "warning")}
  `);

  return await sendEmail(
    email,
    "Account Approved - GoldNest Investment",
    emailTemplate(content)
  );
};

const sendDepositPending = async (email, username, amount, currency, plan) => {
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      Deposit Received
    </h2>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      Hello <strong style="color: #ffffff !important;">${username}</strong>, we have received your deposit and it is currently being verified.
    </p>
    
    ${infoBox([
      {
        label: "AMOUNT",
        value: `<span style="color: #FFD700 !important; font-size: 22px; font-weight: bold;">$${amount}</span>`,
      },
      { label: "CURRENCY", value: currency.toUpperCase() },
      { label: "PLAN", value: plan },
      {
        label: "STATUS",
        value:
          '<span style="color: #FFA500 !important;">PENDING VERIFICATION</span>',
      },
    ])}
    
    ${alertBox(
      "Verification typically takes 1-24 hours. You will receive a confirmation email once approved.",
      "info"
    )}
    
    ${button("https://goldnest-inc.com/PostDashboard", "VIEW DASHBOARD")}
  `);

  return await sendEmail(
    email,
    `Deposit Received - $${amount} | GoldNest`,
    emailTemplate(content)
  );
};

const sendDepositApproved = async (
  email,
  username,
  amount,
  currency,
  plan,
  expectedProfit
) => {
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      Deposit Approved
    </h2>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      Excellent news <strong style="color: #ffffff !important;">${username}</strong>! Your deposit has been verified and approved.
    </p>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      Your investment is now active and generating returns.
    </p>
    
    ${infoBox([
      {
        label: "PRINCIPAL",
        value: `<span style="color: #FFD700 !important; font-size: 22px; font-weight: bold;">$${amount}</span>`,
      },
      { label: "CURRENCY", value: currency.toUpperCase() },
      { label: "PLAN", value: plan },
      {
        label: "EXPECTED PROFIT",
        value: `<span style="color: #00FF00 !important; font-weight: bold;">$${expectedProfit}</span>`,
      },
      {
        label: "STATUS",
        value:
          '<span style="color: #00FF00 !important; font-weight: bold;">ACTIVE</span>',
      },
    ])}
    
    ${alertBox(
      "Your profits are now accumulating. Track your earnings in real-time on your dashboard.",
      "success"
    )}
    
    ${button("https://goldnest-inc.com/PostDashboard", "VIEW INVESTMENTS")}
  `);

  return await sendEmail(
    email,
    `Investment Active - $${amount} Approved`,
    emailTemplate(content)
  );
};

const sendWithdrawalRequested = async (
  email,
  username,
  amount,
  currency,
  walletAddress
) => {
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      Withdrawal Request
    </h2>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      Hello <strong style="color: #ffffff !important;">${username}</strong>, your withdrawal request has been received and is being processed.
    </p>
    
    ${infoBox([
      {
        label: "AMOUNT",
        value: `<span style="color: #FFD700 !important; font-size: 22px; font-weight: bold;">$${amount}</span>`,
      },
      { label: "CURRENCY", value: currency.toUpperCase() },
      {
        label: "WALLET ADDRESS",
        value: `<code style="color: #FFA500 !important; word-break: break-all; font-size: 11px; font-family: monospace;">${walletAddress}</code>`,
      },
      {
        label: "STATUS",
        value: '<span style="color: #FFA500 !important;">PROCESSING</span>',
      },
    ])}
    
    ${alertBox(
      "Processing time: 24-48 hours. You will receive confirmation once payment is sent.",
      "info"
    )}
  `);

  return await sendEmail(
    email,
    `Withdrawal Processing - $${amount} ${currency.toUpperCase()}`,
    emailTemplate(content)
  );
};

const sendWithdrawalApproved = async (
  email,
  username,
  amount,
  currency,
  walletAddress
) => {
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      Withdrawal Approved
    </h2>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      <strong style="color: #ffffff !important;">${username}</strong>, your withdrawal request has been approved and payment is being sent to your wallet.
    </p>
    
    ${infoBox([
      {
        label: "AMOUNT",
        value: `<span style="color: #00FF00 !important; font-size: 22px; font-weight: bold;">$${amount}</span>`,
      },
      { label: "CURRENCY", value: currency.toUpperCase() },
      {
        label: "WALLET ADDRESS",
        value: `<code style="color: #FFA500 !important; word-break: break-all; font-size: 11px; font-family: monospace;">${walletAddress}</code>`,
      },
      {
        label: "STATUS",
        value:
          '<span style="color: #00FF00 !important; font-weight: bold;">COMPLETED</span>',
      },
    ])}
    
    ${alertBox(
      "Funds should arrive in your wallet within 24 hours.",
      "success"
    )}
  `);

  return await sendEmail(
    email,
    `Withdrawal Approved - $${amount} Sent`,
    emailTemplate(content)
  );
};

const sendWithdrawalRejected = async (
  email,
  username,
  amount,
  currency,
  rejectionReason
) => {
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      Withdrawal Declined
    </h2>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      Hello <strong style="color: #ffffff !important;">${username}</strong>, unfortunately your withdrawal request has been declined.
    </p>
    
    ${infoBox([
      { label: "AMOUNT", value: `$${amount} ${currency.toUpperCase()}` },
      { label: "REQUEST DATE", value: new Date().toLocaleDateString() },
      { label: "STATUS", value: "REJECTED" },
    ])}
    
    ${alertBox(
      `<strong>Reason:</strong> ${
        rejectionReason || "Please contact support for details."
      }`,
      "danger"
    )}
    
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      Your funds remain in your account balance and are available for future withdrawals or investments.
    </p>
    
    ${button("https://goldnest-inc.com/support", "CONTACT SUPPORT")}
  `);

  return await sendEmail(
    email,
    `Withdrawal Declined - $${amount} ${currency.toUpperCase()}`,
    emailTemplate(content)
  );
};

/**
 * Step 1: Send password reset request confirmation email
 * User clicks link to automatically generate new password
 */
const sendPasswordResetRequest = async (email, username, token) => {
  const resetUrl = `https://goldnest-inc.com/reset-password/${token}`;

  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      Password Reset Request
    </h2>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      Hello <strong style="color: #ffffff !important;">${username}</strong>, we received a request to reset your password.
    </p>
    
    ${alertBox(
      "Click the button below to generate a new secure password:",
      "info"
    )}
    
    ${button(resetUrl, "RESET PASSWORD")}
    
    <p style="color: #999999 !important; font-size: 13px; margin-top: 30px;">
      Or copy this link to your browser:<br>
      <a href="${resetUrl}" style="color: #FFD700 !important; word-break: break-all; font-size: 12px;">${resetUrl}</a>
    </p>
    
    ${alertBox(
      "<strong>Did not request this?</strong><br>You can safely ignore this email. Your password will not be changed.",
      "warning"
    )}
    
    <p style="color: #666666 !important; font-size: 12px; margin-top: 20px;">
      This link will expire in 1 hour for security reasons.
    </p>
  `);

  return await sendEmail(
    email,
    "Password Reset Request - GoldNest",
    emailTemplate(content)
  );
};

/**
 * Step 2: Send new password after successful reset
 * User receives their new secure password
 */
const sendNewPasswordEmail = async (email, username, newPassword) => {
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      Password Reset Successful
    </h2>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      Hello <strong style="color: #ffffff !important;">${username}</strong>, your password has been successfully reset.
    </p>
    
    ${alertBox(
      "Your new password has been generated. Use it to login to your account.",
      "success"
    )}
    
    ${infoBox([
      { label: "USERNAME", value: username },
      {
        label: "NEW PASSWORD",
        value: `<code style="color: #FFD700 !important; font-size: 18px; font-family: monospace; letter-spacing: 2px; font-weight: bold;">${newPassword}</code>`,
      },
    ])}
    
    ${button("https://goldnest-inc.com/login", "LOGIN NOW")}
    
    ${alertBox(
      "<strong>Important:</strong> For security, please change this password after logging in.",
      "warning"
    )}
    
    <p style="color: #999999 !important; font-size: 13px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #222222;">
      Did not make this change? Contact us immediately at <a href="mailto:${
        process.env.ADMIN_EMAIL
      }" style="color: #FFD700 !important; text-decoration: none;">${
    process.env.ADMIN_EMAIL
  }</a>
    </p>
  `);

  return await sendEmail(
    email,
    "Your New Password - GoldNest",
    emailTemplate(content)
  );
};

/**
 * Send password change confirmation (from profile settings)
 * Security alert when user changes password manually
 */
const sendPasswordChanged = async (email, username, ipAddress) => {
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      Security Alert
    </h2>
    <p style="color: #cccccc !important; line-height: 1.8; font-size: 15px;">
      Hello <strong style="color: #ffffff !important;">${username}</strong>, your password has been successfully changed.
    </p>
    
    ${infoBox([
      { label: "TIME", value: new Date().toLocaleString() },
      { label: "IP ADDRESS", value: ipAddress || "Not available" },
    ])}
    
    ${alertBox(
      "<strong>Did not make this change?</strong><br>Contact us immediately at " +
        process.env.ADMIN_EMAIL,
      "danger"
    )}
    
    ${button("https://goldnest-inc.com/login", "LOGIN NOW")}
    
    <p style="color: #999999 !important; font-size: 13px; margin-top: 30px;">
      This is a security notification to keep you informed of account changes.
    </p>
  `);

  return await sendEmail(
    email,
    "Password Changed - GoldNest Security Alert",
    emailTemplate(content)
  );
};

const sendAdminNewUserNotification = async (username, email) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      New User Registration
    </h2>
    
    ${infoBox([
      { label: "USERNAME", value: username },
      { label: "EMAIL", value: email },
      {
        label: "STATUS",
        value:
          '<span style="color: #FFA500 !important; font-weight: bold;">PENDING APPROVAL</span>',
      },
    ])}
    
    ${button("https://goldnest-inc.com/admin/users", "REVIEW USER")}
  `);

  return await sendEmail(
    adminEmail,
    `New Registration: ${username}`,
    emailTemplate(content)
  );
};

const sendAdminDepositNotification = async (
  username,
  amount,
  currency,
  plan
) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      New Deposit Request
    </h2>
    
    ${infoBox([
      { label: "USER", value: username },
      {
        label: "AMOUNT",
        value: `<span style="color: #00FF00 !important; font-size: 22px; font-weight: bold;">$${amount}</span>`,
      },
      { label: "CURRENCY", value: currency.toUpperCase() },
      { label: "PLAN", value: plan },
      {
        label: "STATUS",
        value:
          '<span style="color: #FFA500 !important; font-weight: bold;">PENDING VERIFICATION</span>',
      },
    ])}
    
    ${button("https://goldnest-inc.com/admin/deposits", "REVIEW DEPOSIT")}
  `);

  return await sendEmail(
    adminEmail,
    `New Deposit: $${amount} from ${username}`,
    emailTemplate(content)
  );
};

const sendAdminWithdrawalNotification = async (
  adminEmail,
  username,
  amount,
  currency,
  walletAddress
) => {
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      New Withdrawal Request
    </h2>
    
    ${infoBox([
      { label: "USER", value: username },
      {
        label: "AMOUNT",
        value: `<span style="color: #FF4444 !important; font-size: 22px; font-weight: bold;">$${amount}</span>`,
      },
      { label: "CURRENCY", value: currency.toUpperCase() },
      {
        label: "WALLET",
        value: `<code style="color: #FFA500 !important; word-break: break-all; font-size: 11px; font-family: monospace;">${walletAddress}</code>`,
      },
      {
        label: "STATUS",
        value:
          '<span style="color: #FFA500 !important; font-weight: bold;">AWAITING APPROVAL</span>',
      },
    ])}
    
    ${button("https://goldnest-inc.com/admin/withdrawals", "REVIEW WITHDRAWAL")}
  `);

  return await sendEmail(
    adminEmail,
    `New Withdrawal: $${amount} ${currency.toUpperCase()} from ${username}`,
    emailTemplate(content)
  );
};

const sendSupportEmail = async (adminEmail, userName, userEmail, message) => {
  const content = contentSection(`
    <h2 style="color: #FFD700 !important; margin: 0 0 20px 0; font-size: 24px; font-weight: normal;">
      New Support Request
    </h2>
    
    ${infoBox([
      { label: "FROM", value: userName },
      {
        label: "EMAIL",
        value: `<a href="mailto:${userEmail}" style="color: #FFD700 !important; text-decoration: none;">${userEmail}</a>`,
      },
      { label: "RECEIVED", value: new Date().toLocaleString() },
    ])}
    
    <div style="background-color: #0a0a0a !important; border: 1px solid #333333; padding: 20px; margin: 25px 0;">
      <div style="color: #999999 !important; font-size: 12px; margin-bottom: 10px;">MESSAGE:</div>
      <div style="color: #ffffff !important; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${message}</div>
    </div>
    
    ${alertBox(
      "<strong>Action Required:</strong> Please respond to this inquiry within 24 hours.",
      "warning"
    )}
    
    ${button(`mailto:${userEmail}`, "REPLY TO USER")}
  `);

  return await sendEmail(
    adminEmail,
    `Support Request from ${userName}`,
    emailTemplate(content)
  );
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
  sendWithdrawalRejected,
  sendPasswordResetRequest,
  sendNewPasswordEmail,
  sendPasswordChanged,
  sendAdminNewUserNotification,
  sendAdminDepositNotification,
  sendAdminWithdrawalNotification,
  sendSupportEmail,
  transporter,
};
