# Role Switch Feature - Implementation Plan

## Overview

The role switch feature allows users to temporarily view and interact with the application from a different role's perspective. This is useful for:
- **Owners/Coordinators** testing the technician experience
- **Support/Admin** debugging user issues
- **Training** new coordinators on different role perspectives

## Current State Analysis

### Current Role System
- **Roles**: `owner`, `coordinator`, `technician`
- **Storage**: Single role per user in `users.role` column
- **RLS Policies**: Enforce role-based access at database level
- **API Middleware**: `requireRole()` checks role for authorization
- **UI**: No role switching capability currently

### Role Permissions Matrix

| Feature | Owner | Coordinator | Technician |
|---------|-------|-------------|------------|
| View Jobs | ✅ All | ✅ All | ✅ All |
| Create Jobs | ✅ | ✅ | ❌ |
| Update Jobs | ✅ All | ✅ All | ✅ Assigned only |
| Delete Jobs | ✅ | ✅ | ❌ |
| View Clients | ✅ | ✅ | ✅ |
| Manage Clients | ✅ | ✅ | ❌ |
| View Inventory | ✅ | ✅ | ✅ |
| Manage Inventory | ✅ | ✅ | ❌ |
| View Billing | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |

## Design Options

### Option 1: Role Impersonation (Recommended)
**Concept**: User temporarily "views as" a different role without changing their actual role.

**Pros:**
- ✅ No database schema changes needed
- ✅ Easy to implement (client-side state)
- ✅ Safe - can't escalate privileges
- ✅ Clear audit trail (original role preserved)

**Cons:**
- ❌ RLS policies still enforce actual role
- ❌ Need to handle permission checks carefully
- ❌ May need API endpoints to bypass some checks

**Implementation:**
- Store `activeRole` in client-side state (React Context)
- API middleware checks `activeRole` from request header/cookie
- RLS policies remain based on actual role (read-only operations)
- Write operations still check actual role

### Option 2: Multi-Role Assignment
**Concept**: Users can have multiple roles assigned, switch between them.

**Pros:**
- ✅ More flexible
- ✅ Can persist role preference
- ✅ Better for users who legitimately have multiple roles

**Cons:**
- ❌ Requires database schema changes
- ❌ More complex RLS policies
- ❌ Need to handle role assignment/removal

**Implementation:**
- Add `user_roles` junction table
- Update RLS policies to check multiple roles
- More complex permission logic

### Option 3: Role Delegation
**Concept**: Owner/Coordinator can temporarily delegate their role to another user.

**Pros:**
- ✅ Useful for temporary access
- ✅ Clear audit trail

**Cons:**
- ❌ Complex to implement
- ❌ Security concerns
- ❌ Not what we need for testing/viewing

## Recommended Approach: Option 1 (Role Impersonation)

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User Interface                       │
│  [Role Switch Dropdown: Owner ▼]                       │
│  - View as Owner                                        │
│  - View as Coordinator                                 │
│  - View as Technician                                  │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              RoleSwitchContext (Client)                  │
│  - activeRole: 'technician'                          │
│  - actualRole: 'owner'                                  │
│  - switchRole(role)                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              API Request (with header)                   │
│  X-Active-Role: technician                              │
│  X-Actual-Role: owner                                   │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│            API Middleware (Server)                        │
│  - Check actualRole for write operations                │
│  - Use activeRole for read operations                   │
│  - Filter data based on activeRole                      │
└─────────────────────────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: Client-Side Role Context

#### 1.1 Create RoleSwitchContext
**File**: `src/contexts/RoleSwitchContext.tsx`

```typescript
interface RoleSwitchContextType {
  actualRole: 'owner' | 'coordinator' | 'technician';
  activeRole: 'owner' | 'coordinator' | 'technician';
  availableRoles: Array<'owner' | 'coordinator' | 'technician'>;
  switchRole: (role: 'owner' | 'coordinator' | 'technician') => void;
  resetRole: () => void;
}

// Rules:
// - Owner can view as: owner, coordinator, technician
// - Coordinator can view as: coordinator, technician
// - Technician can only view as: technician (no switch)
```

**Features:**
- Store `activeRole` in localStorage (persist across sessions)
- Provide `switchRole()` function
- Calculate `availableRoles` based on actual role
- Reset to actual role on logout

#### 1.2 Update AuthContext
**File**: `src/contexts/AuthContext.tsx`

- Fetch user role from API on login
- Provide role to RoleSwitchContext
- Clear role switch on sign out

### Phase 2: UI Components

#### 2.1 Role Switch Dropdown Component
**File**: `src/components/RoleSwitch.tsx`

**Location**: TopHeader component (next to user profile)

**Design:**
```
┌─────────────────────────────────────┐
│ [👤 Owner ▼]                        │
│                                     │
│ Dropdown:                            │
│ ┌─────────────────────────────────┐ │
│ │ 👑 View as Owner                │ │
│ │ 👔 View as Coordinator          │ │
│ │ 🔧 View as Technician           │ │
│ │ ─────────────────────────────── │ │
│ │ 🔄 Reset to Actual Role         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Features:**
- Show current active role with icon
- Show available roles (gray out unavailable)
- Visual indicator when role is switched (badge/color)
- Tooltip explaining role switch

#### 2.2 Role Badge Indicator
**File**: `src/components/RoleBadge.tsx`

- Show in header when role is switched
- "Viewing as: Technician" banner
- Click to reset

### Phase 3: API Integration

#### 3.1 Update API Middleware
**File**: `src/lib/auth-middleware.ts`

**Changes:**
```typescript
interface AuthenticatedApiRequest extends NextApiRequest {
  user: {
    id: string;
    email: string;
    org_id: string | null;
    role: 'owner' | 'coordinator' | 'technician' | null;
    activeRole?: 'owner' | 'coordinator' | 'technician'; // New
  };
}

// New function: getActiveRole()
// - Read from X-Active-Role header
// - Validate against actual role
// - Return activeRole for read operations
// - Return actualRole for write operations
```

**Rules:**
- **Read Operations**: Use `activeRole` for data filtering
- **Write Operations**: Always check `actualRole` for permissions
- **Security**: Never allow privilege escalation

#### 3.2 Update API Endpoints

**Jobs API** (`pages/api/jobs/index.ts`):
- GET: Filter based on `activeRole`
  - Technician: Only assigned jobs
  - Coordinator/Owner: All jobs
- POST/PATCH/DELETE: Check `actualRole`

**Clients API** (`pages/api/clients/index.ts`):
- GET: All roles can view
- POST/PATCH/DELETE: Check `actualRole` (owner/coordinator only)

**Inventory API** (`pages/api/inventory/index.ts`):
- GET: All roles can view
- POST/PATCH/DELETE: Check `actualRole` (owner/coordinator only)

### Phase 4: UI Updates Based on Role

#### 4.1 Conditional Rendering

**Jobs Page** (`pages/jobs/index.tsx`):
- Hide "Create Job" button if `activeRole === 'technician'`
- Hide bulk actions if `activeRole === 'technician'`
- Filter jobs based on `activeRole`

**Clients Page** (`pages/clients/index.tsx`):
- Hide "New Client" button if `activeRole === 'technician'`

**Inventory Page** (`pages/inventory/index.tsx`):
- Hide "New Item" button if `activeRole === 'technician'`
- Hide "Issue" button if `activeRole === 'technician'`

**Dashboard** (`pages/dashboard.tsx`):
- Show different widgets based on `activeRole`
- Technician: Only assigned jobs, no admin stats

#### 4.2 Navigation Updates

**Sidebar** (`src/components/Sidebar.tsx`):
- Hide certain menu items based on `activeRole`
- Show role-specific navigation

### Phase 5: Data Filtering

#### 5.1 Client-Side Filtering

**Jobs List**:
```typescript
const filteredJobs = useMemo(() => {
  if (activeRole === 'technician') {
    return jobs.filter(job => 
      job.assignments?.some(a => a.user?.id === user.id)
    );
  }
  return jobs;
}, [jobs, activeRole, user.id]);
```

#### 5.2 Server-Side Filtering

**API Endpoints**:
- Add role-based filtering in API responses
- Use `activeRole` from request header
- Return filtered data based on role permissions

### Phase 6: Testing & Validation

#### 6.1 Security Tests
- ✅ Cannot escalate privileges
- ✅ Write operations always check actual role
- ✅ RLS policies still enforced
- ✅ Role switch persists correctly
- ✅ Role switch clears on logout

#### 6.2 UX Tests
- ✅ Role switch is intuitive
- ✅ Visual indicators are clear
- ✅ Data filters correctly
- ✅ UI updates appropriately
- ✅ No broken functionality

## Database Considerations

### No Schema Changes Required
- Role switch is client-side state
- Actual role remains in `users.role`
- RLS policies unchanged (based on actual role)

### Optional: Audit Logging
If we want to track role switches:
```sql
CREATE TABLE role_switch_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  from_role TEXT,
  to_role TEXT,
  switched_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Security Considerations

### 1. Privilege Escalation Prevention
- **Rule**: `activeRole` can never have more permissions than `actualRole`
- **Enforcement**: 
  - Client-side: Filter available roles
  - Server-side: Validate in middleware

### 2. Write Operation Protection
- **Rule**: All write operations check `actualRole`, not `activeRole`
- **Implementation**: API middleware always uses `actualRole` for `requireRole()`

### 3. RLS Policy Compatibility
- **Current**: RLS policies check `auth.uid()` and role from `users` table
- **Impact**: Read operations may need special handling
- **Solution**: Use service role for read operations when role switching, OR
- **Alternative**: Add role switch support in RLS policies (complex)

### 4. Session Management
- Role switch stored in localStorage (client-side only)
- Cleared on logout
- Not sent to server in auth token (security)

## Implementation Steps

### Step 1: Create RoleSwitchContext (2-3 hours)
- [ ] Create context file
- [ ] Implement role switching logic
- [ ] Add localStorage persistence
- [ ] Add validation (no privilege escalation)

### Step 2: Create UI Components (3-4 hours)
- [ ] RoleSwitch dropdown component
- [ ] RoleBadge indicator
- [ ] Update TopHeader to include role switch
- [ ] Add icons and styling

### Step 3: Update API Middleware (2-3 hours)
- [ ] Add `activeRole` to request interface
- [ ] Read `X-Active-Role` header
- [ ] Validate role switch
- [ ] Update `requireRole()` to handle both roles

### Step 4: Update API Endpoints (4-6 hours)
- [ ] Jobs API: Filter based on activeRole
- [ ] Clients API: Check actualRole for writes
- [ ] Inventory API: Check actualRole for writes
- [ ] Sites API: Check actualRole for writes
- [ ] Assets API: Check actualRole for writes

### Step 5: Update UI Components (4-6 hours)
- [ ] Jobs page: Conditional rendering
- [ ] Clients page: Conditional rendering
- [ ] Inventory page: Conditional rendering
- [ ] Dashboard: Role-specific widgets
- [ ] Sidebar: Role-specific navigation

### Step 6: Testing (3-4 hours)
- [ ] Security tests
- [ ] UX tests
- [ ] Integration tests
- [ ] Edge case testing

**Total Estimated Time: 18-26 hours**

## Future Enhancements

### Phase 2 Features (Post-MVP)
1. **Role Switch History**: Track when users switch roles
2. **Role Templates**: Save common role switch combinations
3. **Bulk Role Switch**: Switch roles for multiple users (admin)
4. **Role Permissions Preview**: Show what permissions each role has
5. **Role Switch Analytics**: Track which roles are viewed most

## Open Questions

1. **RLS Compatibility**: Should we modify RLS policies to support role switching, or handle it at API level?
   - **Recommendation**: Handle at API level (simpler, safer)

2. **Persistence**: Should role switch persist across browser sessions?
   - **Recommendation**: Yes, store in localStorage

3. **Default Role**: Should we remember last switched role or always default to actual role?
   - **Recommendation**: Default to actual role, but remember last switch

4. **Visual Indicator**: How prominent should the role switch indicator be?
   - **Recommendation**: Subtle badge in header, clear when switched

5. **Mobile Experience**: How should role switch work on mobile?
   - **Recommendation**: Same dropdown, but in mobile menu

## Success Criteria

✅ Users can switch between available roles  
✅ UI updates to reflect active role  
✅ Data is filtered based on active role  
✅ Write operations still check actual role  
✅ No security vulnerabilities  
✅ Clear visual indicators  
✅ Intuitive UX  

## References

- Current RLS Policies: `migrations/20251101_005_rls_policies.sql`
- Auth Middleware: `src/lib/auth-middleware.ts`
- Role Permissions: `docs/ARCHITECTURE.md`

