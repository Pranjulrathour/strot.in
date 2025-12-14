# 🚀 QUICK START - Super Admin Setup

## Step 1: Register Super Admin (2 minutes)

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Go to registration page**:
   - Navigate to `http://localhost:5173/register`

3. **Fill in Super Admin credentials**:
   - **Email**: `strotadmin@gmail.com` (EXACT - case sensitive)
   - **Password**: `strot1234`
   - **Name**: `Super Administrator` (or any name you prefer)
   - **Phone**: Any 10-digit number
   - **Role**: Select **ANY role** (will be auto-promoted to SUPER_ADMIN)
   - **Locality**: Optional

4. **Register**:
   - Click "Create account"
   - **Automatic magic happens**:
     - Database trigger detects the email
     - Role auto-promoted to `SUPER_ADMIN`
     - Entry created in `master_admins` table
     - City set to "National", permissions set to full access

5. **Login**:
   - Redirected to login or login manually
   - Email: `strotadmin@gmail.com`
   - Password: `strot1234`
   - **You'll see the Super Admin Dashboard!**

---

## Step 2: Create Your First Master Admin (3 minutes)

1. **From Super Admin Dashboard**:
   - Click on "Master Admins" in sidebar
   - Or go to `/admin/master-admins`

2. **First, create a user to promote**:
   - Logout as Super Admin
   - Register a new account (e.g., `mumbai.admin@gmail.com`)
   - Choose role: **Donor** or **Business** (doesn't matter, will be promoted)

3. **Login back as Super Admin**:
   - Email: `strotadmin@gmail.com`
   - Password: `strot1234`

4. **Promote to Master Admin**:
   - Go to "Master Admins" page
   - Click "Create Master Admin"
   - Select the user you just created
   - **City**: `Mumbai`
   - **State**: `Maharashtra`
   - **Permissions**: Leave all checked (except "Create Other Admins")
   - Click "Create Master Admin"

5. **Verify**:
   - Logout and login as the new Master Admin
   - Email: `mumbai.admin@gmail.com`
   - You'll see the **Master Admin Dashboard** (city-scoped)

---

## Step 3: Master Admin Approves a Community Head (2 minutes)

1. **Create a Community Head application**:
   - Logout
   - Register as: `ch.dharavi@gmail.com`
   - Role: **Community Head**
   - Locality: `Dharavi`

2. **Login as Master Admin**:
   - Email: `mumbai.admin@gmail.com`

3. **Approve the Community Head**:
   - Go to "Community Heads" in sidebar
   - See the pending CH application
   - Click Actions ⋮ → **Approve**
   - **System actions**:
     - Status → Active
     - Tenure: 30 days from today
     - Approved by: Your Master Admin ID

4. **Verify**:
   - Logout and login as CH
   - Email: `ch.dharavi@gmail.com`
   - You'll see the **Community Head Dashboard**

---

## 🎯 What You Now Have

### Hierarchy Active:
```
SUPER ADMIN (strotadmin@gmail.com)
    ↓
MASTER ADMIN (mumbai.admin@gmail.com) - Mumbai
    ↓
COMMUNITY HEAD (ch.dharavi@gmail.com) - Dharavi
```

### Access Control Working:
- ✅ Super Admin can access `/admin/*` routes
- ✅ Master Admin can access `/master-admin/*` routes (only Mumbai data)
- ✅ Community Head can access `/donations`, `/jobs`, `/workers`, `/workshops`
- ❌ Lower roles CANNOT access higher routes (redirected to `/access-denied`)

---

## 📊 Test the System

### Test 1: Access Control
1. Login as Community Head
2. Try to access `/admin/dashboard` → ❌ Access Denied
3. Try to access `/master-admin/dashboard` → ❌ Access Denied
4. Access `/donations` → ✅ Works

### Test 2: City Scoping
1. Login as Mumbai Master Admin
2. Go to "Community Heads"
3. **Should see**: Only CHs they approved
4. Create another Master Admin for Delhi
5. Delhi MA should see ZERO CHs (different city)

### Test 3: Cascade Disable
1. Login as Super Admin
2. Go to "Master Admins"
3. Find Mumbai MA → Deactivate
4. **Verify**: All Mumbai CHs get suspended
5. Login as Mumbai CH → Access blocked

---

## 🔍 Verify Database

```sql
-- Check Super Admin
SELECT id, email, role FROM profiles 
WHERE email = 'strotadmin@gmail.com';
-- Should show: SUPER_ADMIN

-- Check Master Admin
SELECT * FROM master_admins 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'mumbai.admin@gmail.com');
-- Should show: city=Mumbai, is_active=true, full permissions

-- Check Community Head
SELECT * FROM community_heads 
WHERE user_id = (SELECT id FROM profiles WHERE email = 'ch.dharavi@gmail.com');
-- Should show: status=active, approved_by=<mumbai_ma_id>, tenure dates set
```

---

## 🎨 UI Preview

### Super Admin sees:
- **Sidebar**: Dashboard, Master Admins, User Management, Community Heads, System Logs
- **Dashboard**: System-wide metrics (all cities, all MAs, all CHs)
- **Master Admins page**: Create, activate/deactivate, edit permissions
- **Community Heads**: ALL CHs across all cities

### Master Admin sees:
- **Sidebar**: Dashboard, Community Heads, Activity Logs, Flagged Reports, CSR Funds
- **Dashboard**: ONLY their city metrics (CHs they manage)
- **Community Heads**: ONLY CHs they approved
- **Activity Logs**: ONLY logs from their CHs
- **Flags**: ONLY flags for their CHs

### Community Head sees:
- **Sidebar**: Dashboard, Donations, Jobs, Workers, Workshops
- **Dashboard**: Local operations
- No admin access

---

## ⚡ Quick Commands

### Start Development:
```bash
npm run dev
# Frontend: http://localhost:5173
```

### Check TypeScript:
```bash
npm run check
```

### View Database (Supabase):
```
Project: ovgkxztwqhthsjiohhsc
URL: https://supabase.com/dashboard/project/ovgkxztwqhthsjiohhsc
```

---

## 📞 Troubleshooting

### Issue: Super Admin not auto-promoted
**Solution**: 
1. Ensure email is EXACTLY `strotadmin@gmail.com`
2. Check trigger exists:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'trigger_auto_promote_super_admin';
   ```
3. Manually promote if needed:
   ```sql
   UPDATE profiles SET role = 'SUPER_ADMIN' WHERE email = 'strotadmin@gmail.com';
   ```

### Issue: Access Denied even for correct role
**Solution**:
1. Clear browser cache
2. Logout and login again
3. Check role in browser console: 
   ```js
   localStorage.getItem('supabase.auth.token')
   ```

### Issue: Master Admin sees all CHs (not city-scoped)
**Solution**:
1. Verify RLS policies are active
2. Check `approved_by` column in `community_heads` table
3. Ensure Master Admin has `city` set in `master_admins` table

---

## 🎓 Next Steps

1. **Create more Master Admins** for different cities
2. **Assign areas** to Community Heads via Master Admin
3. **Monitor activity logs** for CH transparency
4. **Review flagged reports** for misconduct
5. **Track CSR spending** by category
6. **Generate reports** from Super Admin dashboard

---

## 📚 Full Documentation

- **Hierarchy Guide**: `SUPER_ADMIN_HIERARCHY_GUIDE.md`
- **Master Admin Guide**: `MASTER_ADMIN_GUIDE.md`
- **Context**: `CONTEXT.md`

---

**Total Setup Time**: ~7 minutes  
**Status**: ✅ Production Ready  
**Last Updated**: December 14, 2025
