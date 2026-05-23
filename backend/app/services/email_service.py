import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from app.core.config import settings

# Note: SMTP settings could be added to core/config.py as well
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")

def send_reset_email(to_email: str, code: str):
    if not SMTP_USER or not SMTP_PASS:
        print("SMTP credentials not configured. Skipping email send.")
        print(f"Code for {to_email}: {code}")
        return

    subject = "DriveAway - Password Reset Verification Code"
    body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #000; text-align: center;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>You have requested to reset your password for your DriveAway account.</p>
                <p>Your verification code is:</p>
                <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
                    {code}
                </div>
                <p>This code will expire in <strong>15 minutes</strong>.</p>
                <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email and ensure your account is secure.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="text-align: center; color: #999; font-size: 12px;">
                    Best regards,<br>
                    <strong>The DriveAway Team</strong>
                </p>
            </div>
        </body>
    </html>
    """

    message = MIMEMultipart()
    message["From"] = f"DriveAway <{SMTP_USER}>"
    message["To"] = to_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(message)
        print(f"Reset email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")

def send_verification_email(to_email: str, code: str):
    if not SMTP_USER or not SMTP_PASS:
        print("SMTP credentials not configured. Skipping email send.")
        print(f"Verification code for {to_email}: {code}")
        return

    subject = "DriveAway - Email Verification Code"
    body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #000; text-align: center;">Welcome to DriveAway!</h2>
                <p>Hello,</p>
                <p>Thank you for registering with DriveAway. To complete your registration, please verify your email address.</p>
                <p>Your verification code is:</p>
                <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
                    {code}
                </div>
                <p>This code will expire in <strong>24 hours</strong>.</p>
                <p style="color: #666; font-size: 14px;">If you didn't create an account, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="text-align: center; color: #999; font-size: 12px;">
                    Best regards,<br>
                    <strong>The DriveAway Team</strong>
                </p>
            </div>
        </body>
    </html>
    """

    message = MIMEMultipart()
    message["From"] = f"DriveAway <{SMTP_USER}>"
    message["To"] = to_email
    message["Subject"] = subject
    message.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.send_message(message)
        print(f"Verification email sent to {to_email}")
    except Exception as e:
        print(f"Failed to send email: {e}")
