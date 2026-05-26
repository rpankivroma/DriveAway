import httpx
from app.core.config import settings

def check_brevo_connection() -> bool:
    api_key = settings.BREVO_API_KEY
    if not api_key:
        print("[BREVO SERVICE] BREVO_API_KEY is not configured. Cannot verify Brevo API connectivity.")
        return False
    
    url = "https://api.brevo.com/v3/account"
    headers = {
        "api-key": api_key,
        "accept": "application/json"
    }
    
    try:
        response = httpx.get(url, headers=headers, timeout=10.0)
        if response.status_code == 200:
            account_info = response.json()
            company_name = account_info.get("companyName", "Unknown")
            print(f"[BREVO SERVICE] Successfully connected to Brevo API. Registered Owner/Company: {company_name}")
            return True
        else:
            print(f"[BREVO SERVICE] Connection check failed. Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print(f"[BREVO SERVICE] Connection check aborted due to exception: {e}")
        return False

def send_brevo_email(to_email: str, subject: str, html_content: str) -> bool:
    api_key = settings.BREVO_API_KEY
    if not api_key:
        print("[BREVO SERVICE] BREVO_API_KEY is not configured. Skipping email send.")
        return False
    
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "api-key": api_key,
        "Content-Type": "application/json",
        "accept": "application/json"
    }
    
    payload = {
        "sender": {
            "name": settings.BREVO_SENDER_NAME,
            "email": settings.BREVO_SENDER_EMAIL
        },
        "to": [
            {
                "email": to_email
            }
        ],
        "subject": subject,
        "htmlContent": html_content
    }
    
    try:
        response = httpx.post(url, json=payload, headers=headers, timeout=10.0)
        if response.status_code in (200, 201, 202):
            print(f"[BREVO SERVICE] Email successfully dispatched to {to_email}")
            return True
        else:
            print(f"[BREVO SERVICE] Dispatch failed. Status: {response.status_code}, Response: {response.text}")
            return False
    except Exception as e:
        print(f"[BREVO SERVICE] Exception during dispatch: {e}")
        return False

def send_reset_email(to_email: str, code: str):
    if not settings.BREVO_API_KEY:
        print("[BREVO SERVICE] Brevo configuration missing. Skipping email send.")
        print(f"Password reset code for {to_email}: {code}")
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
    send_brevo_email(to_email, subject, body)

def send_verification_email(to_email: str, code: str):
    if not settings.BREVO_API_KEY:
        print("[BREVO SERVICE] Brevo configuration missing. Skipping email send.")
        print(f"Email verification code for {to_email}: {code}")
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
    send_brevo_email(to_email, subject, body)
