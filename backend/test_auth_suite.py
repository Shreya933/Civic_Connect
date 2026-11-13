# backend/test_auth_suite.py

import sys
sys.path.append('backend')
from app import app
import json

client = app.test_client()

passed = 0
failed = 0

def test(name, condition, details=""):
    global passed, failed
    if condition:
        print(f"  [PASS] {name}")
        passed += 1
    else:
        print(f"  [FAIL] {name}: {details}")
        failed += 1

print("\n==========================================")
print("RUNNING CIVIC CONNECT AUTH & ROLE AUDIT")
print("==========================================\n")

# 1. Unauthenticated request to protected route
res = client.get('/api/admin/dashboard-stats')
test("Unauthenticated request blocked with 401", res.status_code == 401, f"Status: {res.status_code}")

# 2. Invalid token blocked with 401
res = client.get('/api/admin/dashboard-stats', headers={'Authorization': 'Bearer invalid.token.signature'})
test("Invalid token blocked with 401", res.status_code == 401, f"Status: {res.status_code}")

# 3. Citizen login with wrong password blocked
res = client.post('/api/auth/login/citizen', json={'email': 'citizen@civic.test', 'password': 'WrongPassword999'})
test("Wrong password blocked with 401", res.status_code == 401, f"Status: {res.status_code}")

# 4. Citizen login with valid credentials (citizen@civic.test)
res = client.post('/api/auth/login/citizen', json={'email': 'citizen@civic.test', 'password': 'Citizen@123'})
data = res.get_json() or {}
citizen_token = data.get('data', {}).get('token')
test("Citizen login successful (200 + token received)", res.status_code == 200 and bool(citizen_token), f"Data: {data}")
test("Citizen role is CITIZEN", data.get('data', {}).get('user', {}).get('role') == 'CITIZEN')

# 5. Citizen accesses citizen route
res = client.get('/api/citizen/complaints', headers={'Authorization': f'Bearer {citizen_token}'})
test("Citizen can access /api/citizen/complaints", res.status_code == 200, f"Status: {res.status_code}")

# 6. Citizen attempts to access Admin route (Forbidden 403)
res = client.get('/api/admin/dashboard-stats', headers={'Authorization': f'Bearer {citizen_token}'})
test("Citizen blocked from /api/admin with 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

# 7. Citizen attempts to access Authority route (Forbidden 403)
res = client.get('/api/authority/dashboard', headers={'Authorization': f'Bearer {citizen_token}'})
test("Citizen blocked from /api/authority with 403 Forbidden", res.status_code == 403, f"Status: {res.status_code}")

# 8. Staff Login Step 1 (admin@civic.test)
res = client.post('/api/auth/login/staff', json={'email': 'admin@civic.test', 'password': 'Admin@123'})
data = res.get_json() or {}
admin_user_id = data.get('data', {}).get('user_id')
dev_otp = data.get('data', {}).get('devOtp')
test("Staff Step 1 sends OTP (200 + user_id)", res.status_code == 200 and bool(admin_user_id))
test("Staff Step 1 returns devOtp in dev mode", bool(dev_otp), f"devOtp: {dev_otp}")

# 9. Staff Login Step 2: wrong OTP rejected
res = client.post('/api/auth/verify-otp', json={'user_id': admin_user_id, 'otp': '000000'})
test("Invalid OTP rejected with 401", res.status_code == 401)

# 10. Staff Login Step 2: valid OTP succeeds (using the real dev_otp generated)
res = client.post('/api/auth/verify-otp', json={'user_id': admin_user_id, 'otp': dev_otp})
data = res.get_json() or {}
admin_token = data.get('data', {}).get('token')
admin_role = data.get('data', {}).get('user', {}).get('role')
test("Staff Step 2 OTP verification succeeds with generated OTP", res.status_code == 200 and bool(admin_token))
test("Staff role matches MUNICIPAL_ADMIN", admin_role in ('MUNICIPAL_ADMIN', 'ADMIN'), f"Role: {admin_role}")

# 11. Municipal Admin accesses admin dashboard stats & pending complaints
res = client.get('/api/admin/dashboard-stats', headers={'Authorization': f'Bearer {admin_token}'})
test("Municipal Admin can access /api/admin/dashboard-stats", res.status_code == 200, f"Status: {res.status_code}")

res = client.get('/api/admin/complaints/pending', headers={'Authorization': f'Bearer {admin_token}'})
test("Municipal Admin can access /api/admin/complaints/pending", res.status_code == 200, f"Status: {res.status_code}")

# 12. Municipal Admin blocked from Authority route (403)
res = client.get('/api/authority/dashboard', headers={'Authorization': f'Bearer {admin_token}'})
test("Municipal Admin blocked from /api/authority with 403", res.status_code == 403, f"Status: {res.status_code}")

# 13. Higher Authority login + OTP + access (authority@civic.test)
res = client.post('/api/auth/login/staff', json={'email': 'authority@civic.test', 'password': 'Authority@123'})
auth_otp = res.get_json().get('data', {}).get('devOtp')
res = client.post('/api/auth/verify-otp', json={'email': 'authority@civic.test', 'otp': auth_otp})
auth_token = res.get_json().get('data', {}).get('token')
test("Higher Authority authenticated via email + OTP", bool(auth_token))

res = client.get('/api/authority/dashboard', headers={'Authorization': f'Bearer {auth_token}'})
test("Higher Authority can access /api/authority/dashboard", res.status_code == 200, f"Status: {res.status_code}")

res = client.get('/api/authority/department-performance', headers={'Authorization': f'Bearer {auth_token}'})
test("Higher Authority can access department performance", res.status_code == 200, f"Status: {res.status_code}")

res = client.get('/api/sysadmin/users', headers={'Authorization': f'Bearer {auth_token}'})
test("Higher Authority blocked from /api/sysadmin with 403", res.status_code == 403, f"Status: {res.status_code}")

# 14. System Admin login + OTP + access (sysadmin@civic.test)
res = client.post('/api/auth/login/staff', json={'email': 'sysadmin@civic.test', 'password': 'SysAdmin@123'})
sys_otp = res.get_json().get('data', {}).get('devOtp')
res = client.post('/api/auth/verify-otp', json={'email': 'sysadmin@civic.test', 'otp': sys_otp})
sys_token = res.get_json().get('data', {}).get('token')
test("System Admin authenticated via email + OTP", bool(sys_token))

res = client.get('/api/sysadmin/users', headers={'Authorization': f'Bearer {sys_token}'})
test("System Admin can access /api/sysadmin/users", res.status_code == 200, f"Status: {res.status_code}")

res = client.get('/api/sysadmin/pending-staff', headers={'Authorization': f'Bearer {sys_token}'})
test("System Admin can access /api/sysadmin/pending-staff", res.status_code == 200, f"Status: {res.status_code}")

res = client.post('/api/citizen/complaints', headers={'Authorization': f'Bearer {sys_token}'})
test("System Admin blocked from Citizen Complaint submission with 403", res.status_code == 403, f"Status: {res.status_code}")

print("\n==========================================")
print(f"AUDIT SUMMARY: {passed} PASSED, {failed} FAILED")
print("==========================================\n")
