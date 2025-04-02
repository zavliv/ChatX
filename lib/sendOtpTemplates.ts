import transporter from "@/config/smtp";

/**
 * Returns a nicely formatted HTML OTP email template.
 * @param otp - The OTP code to include in the message.
 * @returns A string containing the HTML email template.
 */
export function getOtpTemplate(otp: string): string {
  const currentYear = new Date().getFullYear();
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8">
      <title>Your OTP Code</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f2f2f2;
          margin: 0;
          padding: 0;
          color: #333333;
        }
        .container {
          max-width: 600px;
          margin: 30px auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          color: #4A90E2;
        }
        .content p {
          font-size: 16px;
          line-height: 1.5;
        }
        .otp-box {
          text-align: center;
          margin: 20px 0;
          padding: 15px;
          background: #f9f9f9;
          border: 2px dashed #cccccc;
          font-size: 28px;
          letter-spacing: 6px;
          color: #000;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #999999;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Chaton Verification</h1>
        </div>
        <div class="content">
          <p>Hi there,</p>
          <p>
            We received a request to verify your email address for your Chaton account.
            Please use the OTP code below to complete your verification.
          </p>
          <div class="otp-box">${otp}</div>
          <p>If you did not request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${currentYear} Chaton. All rights reserved.</p>
        </div>
      </div>
    </body>
  </html>
  `;
}

/**
 * Sends an OTP email using SMTP.
 * @param recipient - The recipient's email address.
 * @param otp - The OTP code to send.
 */
export async function sendEmailOtp(
  recipient: string,
  otp: string
): Promise<void> {
  const htmlMessage = getOtpTemplate(otp);
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipient,
      subject: "Your ChatOn OTP Code",
      text: `Your OTP code is ${otp}. Please use this code to complete your verification.`,
      html: htmlMessage,
    });
    console.log(`OTP sent to ${recipient}`);
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP");
  }
}
