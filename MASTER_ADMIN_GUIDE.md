# MASTER ADMIN SYSTEM - COMPLETE IMPLEMENTATION GUIDE

## 🎯 Overview

The Master Admin system has been fully implemented for STROT. This provides **city-wide operational control** and governance over Community Heads, ensuring transparency, accountability, and zero corruption risk.

---

## 📊 Database Schema

### New Tables Created

#### 1. **roles**
Manages system role definitions
- `id` (uuid) - Primary key
- `name` (text) - Role name (USER, DONOR, COMMUNITY_HEAD, BUSINESS, MASTER_ADMIN, SUPER_ADMIN)
- `description` (text) - Role description
- `created_at` (timestamptz) - Creation timestamp

#### 2. **slum_areas**
Geographic management of slum settlements
- `id` (uuid) - Primary key
- `name` (text) - Area name
- `city` (text) - City
- `state` (text) - State
- `pincode` (text) - Postal code
- `population_estimate` (integer) - Estimated population
- `coordinates` (jsonb) - GPS coordinates
- `is_active` (boolean) - Active status
- `created_at` (timestamptz) - Creation timestamp

**Sample Data**: 8 Mumbai slum areas pre-populated (Dharavi Area A/B, Mankhurd, Govandi, etc.)

#### 3. **master_admins**
City-level administrators
- `id` (uuid) - References auth.users(id)
- `user_id` (uuid) - References profiles(id)
- `city` (text) - Assigned city
- `state` (text) - State
- `assigned_by` (uuid) - Who created this admin
- `permissions` (jsonb) - Permission settings:
  - `can_create_ch` (boolean)
  - `can_remove_ch` (boolean)
  - `can_view_csr` (boolean)
  - `can_create_admin` (boolean) - SUPER_ADMIN only
- `is_active` (boolean) - Active status
- `created_at` (timestamptz) - Creation timestamp

#### 4. **community_heads** (Extended)
New columns added:
- `slum_area_id` (uuid) - References slum_areas(id)
- `approved_by` (uuid) - References master_admins(id)
- `tenure_start_date` (date) - Tenure start
- `tenure_end_date` (date) - Tenure end (monthly renewable)
- `is_suspended` (boolean) - Suspension status
- `suspension_reason` (text) - Reason if suspended
- `total_donations_handled` (integer) - Performance metric
- `total_jobs_placed` (integer) - Performance metric
- `total_workshops_hosted` (integer) - Performance metric

#### 5. **ch_activity_logs**
Transparency tracking for all CH actions
- `id` (uuid) - Primary key
- `ch_id` (uuid) - References community_heads(id)
- `action_type` (text) - Action type (donation_claimed, job_matched, etc.)
- `entity_id` (uuid) - Related entity ID
- `entity_type` (text) - Entity type (donation, job, workshop, worker)
- `metadata` (jsonb) - Additional data
- `ip_address` (text) - IP address
- `created_at` (timestamptz) - Timestamp

**Action Types**:
- `donation_claimed`
- `donation_delivered`
- `job_matched`
- `job_placed`
- `workshop_proposed`
- `workshop_hosted`
- `workshop_completed`
- `worker_onboarded`
- `profile_updated`
- `tenure_extended`
- `status_changed`

#### 6. **ch_flagged_reports**
Misconduct reporting system
- `id` (uuid) - Primary key
- `ch_id` (uuid) - Flagged Community Head
- `reported_by` (uuid) - Reporter user ID
- `reporter_type` (text) - Reporter role (user, donor, business, master_admin, system)
- `reason` (text) - Report reason
- `description` (text) - Detailed description
- `evidence_urls` (text[]) - Evidence attachments
- `severity` (integer) - 1-5 severity scale
- `status` (text) - pending, under_review, resolved, dismissed
- `reviewed_by` (uuid) - Master Admin who reviewed
- `resolution_notes` (text) - Resolution details
- `resolved_at` (timestamptz) - Resolution timestamp
- `created_at` (timestamptz) - Report timestamp

**Auto-Suspension**: Severity ≥ 4 triggers immediate suspension option

#### 7. **csr_transactions**
CSR fund monitoring
- `id` (uuid) - Primary key
- `category` (text) - delivery, skilling, administration, infrastructure, other
- `amount` (numeric) - Transaction amount
- `description` (text) - Description
- `ch_id` (uuid) - Related Community Head
- `approved_by` (uuid) - Approving Master Admin
- `receipt_url` (text) - Receipt/proof
- `transaction_date` (date) - Transaction date
- `created_at` (timestamptz) - Creation timestamp

---

## 🔐 Row Level Security (RLS)

### Master Admin Access Policies

**Master Admins can**:
- ✅ View all Community Heads in their city
- ✅ Create, approve, suspend, remove CHs
- ✅ Extend CH tenure
- ✅ View all activity logs
- ✅ Review and resolve flagged reports
- ✅ Monitor CSR fund allocations
- ✅ View all donations, jobs, workshops

**Super Admins can additionally**:
- ✅ Create/manage other Master Admins
- ✅ System-wide permissions

**Community Heads cannot**:
- ❌ Modify other CHs
- ❌ View Master Admin data
- ❌ Access city-wide analytics

---

## 🖥️ Frontend Implementation

### Pages Created

#### 1. **Master Admin Dashboard** (`/master-admin/dashboard`)
**Features**:
- Overview metrics cards (CHs, donations, jobs, workshops, flags, areas, workers, suspended CHs)
- Donation pipeline visualization
- CH status distribution chart
- Quick action links to all modules
- Real-time statistics

**Key Metrics**:
- Total/Active/Pending/Suspended Community Heads
- Total/Pending/Claimed/Delivered Donations
- Open/Filled Jobs
- Total Workshops
- Pending Flags (with critical count)
- Slum Areas
- Workers Onboarded

#### 2. **Community Heads Management** (`/master-admin/community-heads`)
**Features**:
- Search and filter CHs by status (active, pending, suspended, expired)
- View CH details: name, email, locality, performance score, tenure dates
- Performance metrics: donations handled, jobs placed, workshops hosted
- Actions dropdown for each CH:
  - **Approve** pending CHs (sets 30-day tenure)
  - **Extend Tenure** with custom end date
  - **Assign Area** from slum_areas list
  - **Suspend** with reason (immediate effect)
  - **Reactivate** suspended CHs
- Suspension reason display for suspended CHs
- Beautiful card-based UI with status badges

#### 3. **Activity Logs** (`/master-admin/logs`)
**Features**:
- Real-time activity feed from all CHs
- Filter by action type (11 types)
- Filter by time range (today, week, month, all)
- Search by CH name or locality
- Action icons and color coding
- Relative timestamps ("2h ago", "Just now")
- Metadata display for detailed tracking
- Shows CH name, locality, entity info

#### 4. **Flagged Reports Centre** (`/master-admin/flags`)
**Features**:
- Priority-sorted flag list
- Severity badges (Low 1-2, Medium 3, High 4, Critical 5)
- Status tracking (pending, under_review, resolved, dismissed)
- Quick action buttons:
  - **Dismiss** - Mark as not relevant
  - **Resolve** - Mark resolved with notes
  - **Suspend CH** - For critical flags (severity ≥ 4)
- Evidence display
- Resolution notes history
- Filter by status
- Critical flag count badge in header

#### 5. **CSR Fund Monitoring** (`/master-admin/csr`)
**Features**:
- Total CSR spending overview
- Category breakdown cards:
  - Delivery (logistics, transportation)
  - Skilling (workshop costs, training)
  - Administration (operational costs)
  - Infrastructure (facility improvements)
  - Other (miscellaneous)
- Visual progress bars with percentages
- Transaction history with filtering
- Add new transaction dialog
- Date, amount, category, description tracking
- INR currency formatting

#### 6. **Manage Master Admins** (`/master-admin/manage`)
**SUPER_ADMIN only**

**Features**:
- Create new Master Admins
- Assign city/state
- Granular permission control:
  - Create Community Heads
  - Remove Community Heads
  - View CSR Funds
  - Create Other Admins (Super Admin power)
- Activate/Deactivate admins
- Permission badge display
- Access restriction for non-Super Admins

### Sidebar Navigation

**Master Admin Menu**:
- 🏠 Dashboard
- 👥 Community Heads
- 📊 Activity Logs
- ⚠️ Flagged Reports
- 💰 CSR Funds
- 🛡️ Manage Admins (Super Admin only)

**Role Icons**:
- Master Admin: Shield icon (violet)
- Super Admin: Shield icon (violet)

---

## 🚀 Testing Guide

### Step 1: Create a Master Admin User

Run this SQL in Supabase SQL Editor:

```sql
-- Register a new user via your app UI first, then promote them:
-- Let's say their email is admin@strot.com

-- 1. Update their role to MASTER_ADMIN
UPDATE public.profiles 
SET role = 'MASTER_ADMIN' 
WHERE email = 'admin@strot.com';

-- 2. Insert into master_admins table
INSERT INTO public.master_admins (id, user_id, city, state, is_active, permissions)
SELECT 
    id,
    id as user_id,
    'Mumbai' as city,
    'Maharashtra' as state,
    true as is_active,
    jsonb_build_object(
        'can_create_ch', true,
        'can_remove_ch', true,
        'can_view_csr', true,
        'can_create_admin', false
    ) as permissions
FROM public.profiles
WHERE email = 'admin@strot.com';
```

### Step 2: Create a Super Admin (Optional)

```sql
-- 1. Update role
UPDATE public.profiles 
SET role = 'SUPER_ADMIN' 
WHERE email = 'superadmin@strot.com';

-- 2. Insert with full permissions
INSERT INTO public.master_admins (id, user_id, city, state, is_active, permissions)
SELECT 
    id,
    id as user_id,
    'Mumbai' as city,
    'Maharashtra' as state,
    true as is_active,
    jsonb_build_object(
        'can_create_ch', true,
        'can_remove_ch', true,
        'can_view_csr', true,
        'can_create_admin', true  -- Super Admin power
    ) as permissions
FROM public.profiles
WHERE email = 'superadmin@strot.com';
```

### Step 3: Test Community Head Approval Flow

1. **Login as Master Admin**
2. Navigate to **Community Heads** page
3. Find a pending CH (status: "Pending Approval")
4. Click **Actions** → **Approve**
5. Verify:
   - Status changes to "Active"
   - Tenure dates are set (30 days from now)
   - CH can now access their dashboard

### Step 4: Test Area Assignment

1. On **Community Heads** page
2. Select an active CH
3. Click **Actions** → **Assign Area**
4. Choose from dropdown (8 Mumbai areas available)
5. Confirm assignment
6. Verify area shows in CH card

### Step 5: Test Suspension

1. Create a test flag report (or use test data)
2. Go to **Flagged Reports**
3. Find a critical severity report (≥ 4)
4. Click **Suspend CH**
5. Enter suspension reason
6. Verify:
   - CH status changes to "Suspended"
   - Suspension reason displays
   - CH loses access to actions
   - Can reactivate via dropdown

### Step 6: Test CSR Monitoring

1. Go to **CSR Funds** page
2. Click **Add Transaction**
3. Fill in:
   - Category (e.g., Delivery)
   - Amount (e.g., 5000)
   - Date
   - Description
4. Submit
5. Verify:
   - Transaction appears in history
   - Category total updates
   - Progress bar reflects new allocation
   - Percentage recalculates

### Step 7: Test Activity Logs

1. Perform various actions as CH:
   - Claim a donation
   - Deliver a donation
   - Onboard a worker
2. Login as Master Admin
3. Go to **Activity Logs**
4. Verify all actions are logged with:
   - Correct action type
   - CH name
   - Timestamp
   - Entity details

### Step 8: Test Super Admin Powers

1. Login as **Super Admin** (not regular Master Admin)
2. Go to **Manage Admins**
3. Click **Add Master Admin**
4. Enter existing user's email
5. Set permissions
6. Verify:
   - Regular Master Admin cannot access this page
   - New admin can login with assigned permissions
   - Permissions are enforced

---

## 🔧 Integration with Existing Modules

### BAL (Donations)

**Before**: CH claims donation → No tracking
**After**: 
- Action logged to `ch_activity_logs`
- Performance metric `total_donations_handled` increments
- Master Admin sees real-time activity in logs
- CSR delivery costs can be tracked

### BUDDHI (Employment)

**Before**: CH places worker → No oversight
**After**:
- Job placement logged
- Performance metric `total_jobs_placed` increments
- Master Admin monitors job matching activity
- Commission tracking via CSR transactions

### VIDYA (Upskilling)

**Before**: CH hosts workshop → No approval
**After**:
- Workshop proposal logged
- Performance metric `total_workshops_hosted` increments
- Master Admin reviews workshop schedule
- CSR skilling costs tracked

---

## 📱 User Roles & Permissions

### Role Hierarchy

```
SUPER_ADMIN
    ↓ (can create)
MASTER_ADMIN
    ↓ (can approve/manage)
COMMUNITY_HEAD
    ↓ (manages)
DONOR / BUSINESS / USER
```

### Permission Matrix

| Action | User | Donor | Business | CH | Master Admin | Super Admin |
|--------|------|-------|----------|-----|--------------|-------------|
| Donate items | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Post jobs | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Claim donations | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Onboard workers | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| View CH logs | ❌ | ❌ | ❌ | Own only | ✅ All | ✅ All |
| Approve CHs | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Suspend CHs | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View CSR funds | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Create admins | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 🎨 UI/UX Features

### Design Philosophy
- **Apple-like Minimalism**: Clean, spacious layouts
- **TailwindCSS**: Consistent spacing and styling
- **Soft shadows**: Subtle elevation effects
- **Color coding**: Role-specific colors (violet for admin, blue for CH, etc.)
- **Responsive**: Mobile and desktop optimized
- **Dark mode**: Full theme support

### Key Components Used
- Shadcn UI: Cards, Dialogs, Badges, Select, Input, Textarea
- Lucide Icons: Consistent iconography
- React Query: Real-time data synchronization
- Wouter: Client-side routing

---

## 🐛 Troubleshooting

### Issue: Cannot see Master Admin menu
**Solution**: 
1. Check user role in database: `SELECT role FROM profiles WHERE id = 'user-id'`
2. Ensure role is 'MASTER_ADMIN' or 'SUPER_ADMIN'
3. Clear browser cache and re-login

### Issue: 406 errors on queries
**Solution**: Already fixed! All `.single()` changed to `.maybeSingle()` for optional lookups.

### Issue: Cannot create Master Admin
**Solution**:
1. Verify user exists in profiles table first
2. Check if `can_create_admin` permission is true for current Super Admin
3. Ensure first admin creation (bootstrap) works without checks

### Issue: CH cannot be approved
**Solution**:
1. Check Master Admin has `can_create_ch` permission
2. Verify CH profile exists in profiles table
3. Check RLS policies are correctly applied

---

## 📈 Future Enhancements

### Planned Features
1. **Analytics Dashboard**: City-wide trends, graphs, charts
2. **Email Notifications**: Alert Master Admins on critical flags
3. **Mobile App**: Native iOS/Android for Master Admins
4. **Automated Reports**: Weekly/monthly performance summaries
5. **Tenure Renewal Reminders**: Auto-notify CHs before tenure expiry
6. **Multi-city Support**: Master Admins for different cities
7. **Audit Trail Export**: Download activity logs as CSV/PDF
8. **Real-time Chat**: Communication between Master Admin and CHs

---

## 🔍 Database Migrations Applied

1. `20251214_create_master_admin_schema_part1.sql`
   - Created roles, slum_areas, master_admins tables
   - Set up initial RLS policies

2. `20251214_extend_community_heads_and_create_logs.sql`
   - Extended community_heads with governance columns
   - Created ch_activity_logs table
   - Created ch_flagged_reports table
   - Created csr_transactions table
   - Added indexes for performance

3. `20251214_master_admin_rls_policies.sql`
   - Comprehensive RLS policies for all tables
   - Master Admin access control
   - CH self-access limits
   - Updated profiles constraint for new roles

---

## ✅ Completion Checklist

- [x] Database schema created
- [x] RLS policies implemented
- [x] Master Admin Dashboard page
- [x] Community Heads Management page
- [x] Activity Logs page
- [x] Flagged Reports page
- [x] CSR Monitoring page
- [x] Manage Admins page (Super Admin)
- [x] App.tsx routing updated
- [x] Sidebar navigation updated
- [x] TypeScript compilation successful
- [x] Sample data created (8 slum areas)
- [x] Documentation complete

---

## 🎓 Training Guide for Master Admins

### Daily Tasks
1. **Morning**: Check Flagged Reports for overnight issues
2. **Check Dashboard**: Review key metrics and pending CHs
3. **Review Logs**: Monitor CH activities for anomalies
4. **CSR Reconciliation**: Verify daily transactions

### Weekly Tasks
1. **CH Performance Review**: Check metrics, extend high performers
2. **Area Assignment**: Assign new CHs to uncovered areas
3. **Flag Resolution**: Clear pending flags backlog
4. **Budget Review**: Analyze CSR spending patterns

### Monthly Tasks
1. **Tenure Renewals**: Process CH tenure extensions
2. **Performance Reports**: Generate city-wide statistics
3. **Admin Meeting**: Review system health with Super Admin
4. **Data Cleanup**: Archive old logs and transactions

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review Supabase logs: `/master-admin/logs`
3. Check database directly via Supabase dashboard
4. Contact system administrator

---

**Implementation Date**: December 14, 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready

**Built with**: React, TypeScript, TailwindCSS, Supabase, Shadcn UI
