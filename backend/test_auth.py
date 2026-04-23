import urllib.request
import urllib.error
import json

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/auth/signup',
    data=json.dumps({'full_name': 'Test', 'email': 'test6@test.com', 'password': 'pass'}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    print(urllib.request.urlopen(req).read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(e.read().decode('utf-8'))
