# 🛡️ SUPER ADMIN HIERARCHY SYSTEM - COMPLETE GUIDE

## 📋 Overview

STROT now implements a **strict 3-tier administrative hierarchy**:

```
┌─────────────────────────────────────┐
│         SUPER ADMIN                 │
│    (strotadmin@gmail.com)           │
│  • System-wide control              │
│  • Manages Master Admins            │
│  • Access: /admin/* routes          │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│       MASTER ADMIN                  │
│    (City/State Level)               │
│  • Manages Community Heads          │
│  • City-scoped operations           │
│  • Access: /master-admin/* routes   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     COMMUNITY HEAD                  │
│    (Local Level)                    │
│  • Implements BAL/BUDDHI/VIDYA      │
│  • Local operations only            │
│  • Access: /donations, /jobs, etc.  │
└─────────────────────────────────────┘
```

---

## 🔐 Super Admin Credentials

**Email**: `strotadmin@gmail.com`  
**Password**: `strot1234`

### First-Time Setup

1. **Register the Super Admin**:
   - Go to `/register`
   - Email: `strotadmin@gmail.com`
   - Password: `strot1234`
   - Name: `Super Administrator`
   - Phone: Any valid number
   - Role: Select **ANY role** (will be auto-promoted)

2. **Automatic Promotion**:
   - A database trigger detects this email
   - Automatically sets role to `SUPER_ADMIN`
   - Creates entry in `master_admins` table with full permissions
   - Sets city as "National" and state as "India"

3. **Login**:
   - Email: `strotadmin@gmail.com`
   - Password: `strot1234`
   - Redirects to Super Admin Dashboard

---

## 🎯 Access Control Matrix

| Route | Super Admin | Master Admin | CH | Business | Donor |
|-------|------------|--------------|-----|----------|-------|
| `/` (Dashboard) | ✅ Super Admin | ✅ Master Admin | ✅ CH Dash | ✅ Business | ✅ Donor |
| `/admin/dashboard` | ✅ Only | ❌ | ❌ | ❌ | ❌ |
| `/admin/master-admins` | ✅ Only | ❌ | ❌ | ❌ | ❌ |
| `/admin/users` | ✅ Only | ❌ | ❌ | ❌ | ❌ |
| `/admin/community-heads` | ✅ Only | ❌ | ❌ | ❌ | ❌ |
| `/master-admin/*` | ✅ View | ✅ Only | ❌ | ❌ | ❌ |
| `/donations` | ✅ View | ✅ View | ✅ Manage | ❌ | ✅ Create |
| `/jobs` | ✅ View | ✅ View | ✅ View | ✅ Manage | ❌ |

---

## 📊 Super Admin Dashboard

**Route**: `/` (when logged in as Super Admin) or `/admin/dashboard`

### Key Metrics

1. **Total System Users** - All registered accounts
2. **Master Admins** - City-level administrators
3. **Cities Covered** - Geographic coverage
4. **Community Heads** - Active/Pending/Suspended breakdown
5. **Total Donations** - System-wide
6. **Job Listings** - Posted by businesses
7. **Workshops** - Total conducted
8. **Workers Onboarded** - Across all CHs
9. **Slum Areas** - Registered areas
10. **Pending Flags** - Critical alerts
11. **Suspended CHs** - Under review

### Quick Actions

- **Manage Master Admins** → Create/edit city administrators
- **User Management** → Promote users to any role
- **All Community Heads** → System-wide CH overview
- **System Audit Logs** → Track all admin actions

---

## 🛠️ Super Admin Functions

### 1. Master Admin Management (`/admin/master-admins`)

**Create Master Admin**:
1. Click "Create Master Admin"
2. Select user from dropdown (existing users)
3. Assign **City** and **State**
4. Set permissions:
   - ✅ Create Community Heads
   - ✅ Remove Community Heads
   - ✅ View CSR Funds
   - ❌ Create Other Admins (Super Admin only)
5. User is promoted to `MASTER_ADMIN` role
6. Entry created in `master_admins` table

**Manage Master Admins**:
- View all Master Admins with their cities
- See stats: Total CHs managed, Active CHs, Pending CHs
- Edit permissions per Master Admin
- Activate/Deactivate Master Admins
- **Cascade Effect**: Deactivating MA suspends all their CHs

### 2. User Management (`/admin/users`)

**Features**:
- View all registered users
- Search by name, email, phone
- Filter by role
- **Change Role** for any user:
  - Promote to Master Admin (requires city/state)
  - Promote to Super Admin
  - Demote to lower roles
  - Automatic table entries created

### 3. Community Heads Overview (`/admin/community-heads`)

**System-wide CH Monitoring**:
- View all CHs across all cities
- Filter by:
  - Status (active, pending, suspended, expired)
  - City
  - Master Admin
- See which Master Admin manages each CH
- View performance metrics per CH
- Monitor suspension reasons

---

## 🌆 Master Admin Dashboard

**Route**: `/` (when logged in as Master Admin) or `/master-admin/dashboard`

### Key Features

1. **City-Scoped Metrics**:
   - Community Heads in their city only
   - Donations handled by their CHs
   - Jobs posted in their city
   - Workshops in their area

2. **Management Pages**:
   - **Community Heads** → Approve, suspend, extend tenure, assign areas
   - **Activity Logs** → Monitor all CH actions
   - **Flagged Reports** → Review misconduct reports
   - **CSR Funds** → Track fund allocations

3. **Permissions**:
   - Set by Super Admin
   - Can create/remove CHs if permitted
   - Can view CSR if permitted
   - Cannot create other admins (Super Admin only)

---

## 🔒 Row Level Security (RLS) Policies

### Hierarchy Enforcement

**Super Admin**:
```sql
-- Full access to ALL tables
-- Can read/write profiles, master_admins, community_heads, etc.
```

**Master Admin**:
```sql
-- Can view/manage community_heads (all)
-- Can view profiles (for CH management)
-- Can view/create ch_activity_logs
-- Can view/manage ch_flagged_reports
-- Can view/create csr_transactions (if permitted)
-- Can view slum_areas
-- Can view own master_admins record
```

**Community Head**:
```sql
-- Can view/update own community_heads record
-- Can view slum_areas
-- Cannot access master_admins
-- Cannot access other CHs' data
```

**Others (Business/Donor/User)**:
```sql
-- Can view/update own profile
-- Cannot access any admin tables
```

---

## 🚀 Implementation Details

### Database Trigger

**Auto-Promotion for Super Admin**:
```sql
CREATE OR REPLACE FUNCTION auto_promote_super_admin()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.email = 'strotadmin@gmail.com' THEN
        NEW.role := 'SUPER_ADMIN';
        
        INSERT INTO public.master_admins (id, user_id, city, state, permissions)
        VALUES (
            NEW.id, NEW.id, 'National', 'India',
            jsonb_build_object(
                'can_create_ch', true,
                'can_remove_ch', true,
                'can_view_csr', true,
                'can_create_admin', true,
                'system_wide_access', true
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Frontend Route Guards

**Component**: `@/components/route-guard.tsx`

```tsx
<SuperAdminGuard>
  <SuperAdminDashboard />
</SuperAdminGuard>
```

**Guards Available**:
- `SuperAdminGuard` - SUPER_ADMIN only
- `MasterAdminGuard` - MASTER_ADMIN or SUPER_ADMIN
- `AdminGuard` - Any admin role
- `CommunityHeadGuard` - COMMUNITY_HEAD only

### Dashboard Routing Logic

```tsx
switch (user?.role) {
  case "SUPER_ADMIN":
    return <SuperAdminDashboard />;
  case "MASTER_ADMIN":
    return <MasterAdminDashboard />;
  case "MAIN_ADMIN":
    return <AdminDashboard />;
  case "BUSINESS":
    return <BusinessDashboard />;
  case "COMMUNITY_HEAD":
    return <CHDashboard />;
  default:
    return <DonorDashboard />;
}
```

---

## 📝 Workflows

### Workflow 1: Create Master Admin

1. **Super Admin** logs in
2. Goes to `/admin/master-admins`
3. Clicks "Create Master Admin"
4. Selects existing user (e.g., john@example.com)
5. Enters City: "Mumbai", State: "Maharashtra"
6. Sets permissions (all enabled except create_admin)
7. Clicks "Create Master Admin"
8. **System Actions**:
   - Updates `profiles.role` to `MASTER_ADMIN`
   - Inserts into `master_admins` table
   - User can now access `/master-admin/*` routes
   - User sees city-scoped data only

### Workflow 2: Master Admin Approves Community Head

1. **Master Admin** logs in
2. Goes to `/master-admin/community-heads`
3. Sees pending CH applications
4. Clicks "Actions" → "Approve"
5. **System Actions**:
   - Sets `status` to "active"
   - Sets `tenure_start_date` to today
   - Sets `tenure_end_date` to 30 days from now
   - Sets `approved_by` to Master Admin's ID
   - CH can now access CH dashboard

### Workflow 3: Super Admin Deactivates Master Admin

1. **Super Admin** goes to `/admin/master-admins`
2. Finds Master Admin to deactivate
3. Clicks "Actions" → "Deactivate"
4. **System Actions**:
   - Sets `master_admins.is_active` to `false`
   - **Cascade**: All CHs under this MA get suspended
   - Sets `community_heads.is_suspended` to `true`
   - Sets `suspension_reason` to "Master Admin deactivated"
   - All affected CHs lose access

---

## 🎨 UI/UX Features

### Color Coding

- **Super Admin**: Purple/Violet theme
- **Master Admin**: Violet theme
- **Community Head**: Emerald/Green theme
- **Business**: Amber/Orange theme
- **Donor**: Rose/Pink theme

### Badges

- **Active**: Green badge
- **Pending**: Amber badge (secondary)
- **Suspended**: Red badge (destructive)
- **Expired**: Gray badge (outline)

### Icons

- **Super Admin**: Shield icon
- **Master Admin**: Shield icon
- **Community Head**: Users icon
- **Business**: Building2 icon
- **Donor**: Heart icon

---

## 🔍 Testing Guide

### Test 1: Super Admin Registration

1. Go to `/register`
2. Email: `strotadmin@gmail.com`
3. Password: `strot1234`
4. Complete registration
5. **Expected**: Auto-promoted to SUPER_ADMIN
6. **Verify**:
   ```sql
   SELECT role FROM profiles WHERE email = 'strotadmin@gmail.com';
   -- Should return: SUPER_ADMIN
   
   SELECT * FROM master_admins WHERE user_id = (
     SELECT id FROM profiles WHERE email = 'strotadmin@gmail.com'
   );
   -- Should have entry with city='National', full permissions
   ```

### Test 2: Master Admin Creation

1. Register a normal user: `masteradmin@example.com`
2. Login as Super Admin
3. Go to `/admin/master-admins`
4. Create Master Admin for Mumbai
5. **Expected**: User promoted, can access MA dashboard
6. **Verify**: Login as `masteradmin@example.com` → sees `/master-admin/dashboard`

### Test 3: Access Control

1. Login as Community Head
2. Try to access `/admin/dashboard`
3. **Expected**: Redirected to `/access-denied`
4. Try to access `/master-admin/dashboard`
5. **Expected**: Redirected to `/access-denied`
6. Access `/donations`
7. **Expected**: ✅ Can access (allowed for CH)

### Test 4: Cascade Disable

1. Master Admin has 3 active CHs
2. Super Admin deactivates the Master Admin
3. **Expected**: All 3 CHs get suspended automatically
4. **Verify**:
   ```sql
   SELECT status, is_suspended, suspension_reason 
   FROM community_heads 
   WHERE approved_by = '<master_admin_id>';
   -- All should be suspended with reason "Master Admin deactivated"
   ```

---

## 📋 Database Tables Reference

### master_admins

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key = user_id |
| user_id | uuid | References profiles(id) |
| city | text | Assigned city (e.g., "Mumbai") |
| state | text | State (e.g., "Maharashtra") |
| assigned_by | uuid | Super Admin who created this |
| permissions | jsonb | Permission settings |
| is_active | boolean | Active status |
| created_at | timestamptz | Creation date |

### permissions JSON structure

```json
{
  "can_create_ch": true,
  "can_remove_ch": true,
  "can_view_csr": true,
  "can_create_admin": false,
  "system_wide_access": false
}
```

---

## 🚨 Important Notes

### Security

1. **Super Admin email is hardcoded**: `strotadmin@gmail.com`
   - Only this email gets auto-promoted
   - Change in trigger if needed
   
2. **RLS Policies are strict**:
   - Super Admin: Full access
   - Master Admin: City-scoped
   - CH: Own data only
   - Others: No admin access

3. **Route Guards prevent unauthorized access**:
   - Frontend guards on all admin routes
   - Backend RLS ensures data security
   - Double-layer protection

### Hierarchy Rules

1. **Super Admin > Master Admin > Community Head**
2. Super Admin can create/manage Master Admins
3. Master Admins can create/manage Community Heads in their city
4. Community Heads implement local operations
5. **No cross-city access** for Master Admins
6. **Only Super Admin has system-wide access**

### Permissions

1. **can_create_ch**: Can approve pending CH applications
2. **can_remove_ch**: Can suspend/deactivate CHs
3. **can_view_csr**: Can access CSR fund monitoring
4. **can_create_admin**: SUPER_ADMIN only (create other MAs)

---

## 🎓 Admin Training

### For Super Admin

**Daily Tasks**:
1. Monitor system-wide metrics
2. Review critical flags
3. Check new Master Admin requests
4. Verify city coverage

**Weekly Tasks**:
1. Review Master Admin performance
2. Check city-wise distribution
3. Audit system logs
4. Generate reports

**Monthly Tasks**:
1. Strategic planning
2. Budget allocation
3. System optimization
4. Compliance review

### For Master Admin

**Daily Tasks**:
1. Review pending CH applications
2. Check flagged reports
3. Monitor CH activity logs
4. Track CSR spending

**Weekly Tasks**:
1. Approve/reject CH applications
2. Extend tenures for high performers
3. Assign CHs to uncovered areas
4. Generate city reports

**Monthly Tasks**:
1. Performance reviews
2. Tenure renewals
3. Budget planning
4. Escalate issues to Super Admin

---

## 📞 Support & Troubleshooting

### Issue: Cannot access Super Admin dashboard

**Solution**:
1. Verify user is registered with `strotadmin@gmail.com`
2. Check role in database:
   ```sql
   SELECT role FROM profiles WHERE email = 'strotadmin@gmail.com';
   ```
3. If not SUPER_ADMIN, trigger may not have fired
4. Manually update:
   ```sql
   UPDATE profiles SET role = 'SUPER_ADMIN' WHERE email = 'strotadmin@gmail.com';
   ```

### Issue: Master Admin cannot see Community Heads

**Solution**:
1. Check Master Admin is active:
   ```sql
   SELECT is_active FROM master_admins WHERE user_id = '<user_id>';
   ```
2. Verify RLS policies are in place
3. Check permissions in `master_admins.permissions`

### Issue: Access Denied for allowed routes

**Solution**:
1. Clear browser cache
2. Logout and login again
3. Check route guard configuration
4. Verify role in auth context

---

## 🎯 Future Enhancements

### Planned Features

1. **Multi-city Management**:
   - Super Admin assign multiple cities to one MA
   - City-wise performance comparisons

2. **Advanced Analytics**:
   - City-wise trends
   - MA performance leaderboard
   - Predictive analytics

3. **Automated Workflows**:
   - Auto-approve CHs meeting criteria
   - Auto-extend high-performer tenures
   - Auto-escalate critical flags

4. **Communication**:
   - In-app messaging
   - Email notifications
   - SMS alerts for critical events

5. **Audit & Compliance**:
   - Comprehensive audit trail
   - Compliance reports
   - Export capabilities

---

## ✅ Checklist for Deployment

- [x] Super Admin trigger created
- [x] RLS policies implemented
- [x] Frontend route guards added
- [x] Super Admin dashboard created
- [x] Master Admin dashboard created
- [x] User management page created
- [x] Access denied page created
- [x] Sidebar navigation updated
- [x] TypeScript compilation passed
- [ ] Super Admin registered and tested
- [ ] Master Admin creation tested
- [ ] CH approval flow tested
- [ ] Access control tested
- [ ] Cascade disable tested

---

**Implementation Date**: December 14, 2025  
**Version**: 2.0 - STRICT HIERARCHY  
**Status**: ✅ Ready for Super Admin Registration

**Credentials**:  
Email: `strotadmin@gmail.com`  
Password: `strot1234`

**First Step**: Register this account at `/register` to activate Super Admin!
