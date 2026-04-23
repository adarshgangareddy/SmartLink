import boto3
from ..core.config import settings
import logging

logger = logging.getLogger(__name__)

def send_reset_email(to_email: str, otp: str):
    # If AWS is not configured, just print to console for local development!
    if not settings.AWS_ACCESS_KEY_ID or not settings.AWS_SES_FROM_EMAIL:
        # We print prominently so the developer can see the OTP in their terminal
        print("="*50)
        print("AWS SES NOT CONFIGURED - MOCK EMAIL MODE")
        print(f"Mock Email sent to: {to_email}")
        print(f"Your OTP is: {otp}")
        print("="*50)
        return True

    # Actual AWS SES Call
    client = boto3.client(
        'ses',
        region_name=settings.AWS_REGION,
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
    )
    
    try:
        response = client.send_email(
            Destination={'ToAddresses': [to_email]},
            Message={
                'Body': {
                    'Text': {
                        'Charset': "UTF-8",
                        'Data': f"Hello,\n\nYour SmartLink password reset OTP is: {otp}\n\nThis OTP will expire in 15 minutes. If you did not request a password reset, please ignore this email.",
                    }
                },
                'Subject': {
                    'Charset': "UTF-8",
                    'Data': "SmartLink - Password Reset OTP",
                },
            },
            Source=settings.AWS_SES_FROM_EMAIL,
        )
        logger.info(f"Email sent successfully! Message ID: {response['MessageId']}")
        return True
    except client.exceptions.MessageRejected as e:
        logger.error(f"SES Message Rejected: {str(e)}")
        logger.error("TIP: If your AWS SES is in Sandbox mode, verify both the sender and recipient emails.")
        return False
    except Exception as e:
        logger.error(f"SES Failed to send email: {str(e)}")
        logger.error(f"Details: {type(e).__name__}")
        return False
