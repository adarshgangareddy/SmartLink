import os
import sys
import boto3
import razorpay
from dotenv import load_dotenv

# Add the current directory to path so we can import app modules if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def diagnose():
    load_dotenv()
    
    print("="*50)
    print("SMARTLINK SERVICE DIAGNOSTIC")
    print("="*50)
    
    # 1. Razorpay Check
    rzp_id = os.getenv("RAZORPAY_KEY_ID")
    rzp_secret = os.getenv("RAZORPAY_KEY_SECRET")
    
    print(f"\n[1] Checking Razorpay...")
    if not rzp_id or not rzp_secret or rzp_id == "YOUR_KEY_ID":
        print("[-] NOT CONFIGURED: Razorpay keys are missing or default.")
    else:
        try:
            client = razorpay.Client(auth=(rzp_id, rzp_secret))
            # Try to fetch orders (lightweight check)
            client.order.all()
            print("[+] SUCCESS: Razorpay authentication verified!")
        except Exception as e:
            print(f"[-] FAILURE: Razorpay authentication failed: {str(e)}")
            print("    TIP: Check if your keys are active in the Razorpay Dashboard.")

    # 2. AWS SES Check
    aws_id = os.getenv("AWS_ACCESS_KEY_ID")
    aws_secret = os.getenv("AWS_SECRET_ACCESS_KEY")
    aws_region = os.getenv("AWS_REGION", "us-east-1")
    from_email = os.getenv("AWS_SES_FROM_EMAIL")
    
    print(f"\n[2] Checking AWS SES...")
    if not aws_id or not from_email:
        print("[-] NOT CONFIGURED: AWS credentials or source email missing.")
    else:
        try:
            client = boto3.client(
                'ses',
                region_name=aws_region,
                aws_access_key_id=aws_id,
                aws_secret_access_key=aws_secret
            )
            # Check verification status of the from_email
            response = client.get_identity_verification_attributes(Identities=[from_email])
            status = response.get('VerificationAttributes', {}).get(from_email, {}).get('VerificationStatus')
            
            if status == 'Success':
                print(f"[+] SUCCESS: Source email '{from_email}' is verified in SES.")
            else:
                print(f"[-] WARNING: Source email '{from_email}' is NOT fully verified (Status: {status}).")
            
            # Check if account is in sandbox
            send_quota = client.get_send_quota()
            max_24h_send = send_quota.get('Max24HourSend', 0)
            if max_24h_send <= 200: # Typical sandbox limit
                print("[!] NOTE: Your AWS SES account appears to be in SANDBOX mode.")
                print("    In Sandbox, you can ONLY send emails to VERIFIED recipient addresses.")
            else:
                print("[+] SUCCESS: Your AWS SES account appears to be in PRODUCTION mode.")
                
        except Exception as e:
            print(f"[-] FAILURE: AWS SES check failed: {str(e)}")

    print("\n" + "="*50)
    print("DIAGNOSTIC COMPLETE")
    print("="*50)

if __name__ == "__main__":
    diagnose()
