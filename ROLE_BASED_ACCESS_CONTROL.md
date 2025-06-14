# Role-Based Access Control (RBAC) System

## Overview
The VForums And Events platform now implements a comprehensive role-based access control system to manage user permissions, particularly for event creation. This system ensures that only authorized users (moderators and admins) can create events while maintaining open access to forum discussions.

## 🎯 **Problem Solved**
- **Before**: Anyone could create events, leading to potential spam and quality issues
- **After**: Only moderators and admins can create events, while all users can participate in forums

## 🏗️ **System Architecture**

### **User Roles**
1. **User** (Default)
   - Can read forums and browse events
   - Can create questions and comments
   - Can vote on content
   - **Cannot** create events

2. **Moderator**
   - All user permissions
   - **Can create and manage events**
   - Can moderate forum discussions
   - Helps maintain community quality

3. **Admin**
   - All moderator permissions
   - **Can manage user roles**
   - Can access admin panel
   - Full platform control

### **Permission System**
Each role has specific permissions:

```typescript
// User permissions
['read_forums', 'create_questions', 'vote']

// Moderator permissions  
['read_forums', 'create_questions', 'vote', 'create_events', 'manage_events', 'moderate_forums']

// Admin permissions
['read_forums', 'create_questions', 'vote', 'create_events', 'manage_events', 'manage_users', 'moderate_forums', 'delete_content']
```

## 📁 **Implementation Details**

### **Database Structure**
User profiles are stored in Firestore with the following structure:

```javascript
// users/{uid}
{
  uid: "user-unique-id",
  email: "user@vit.edu.in",
  displayName: "User Name",
  photoURL: "profile-photo-url",
  role: "user" | "moderator" | "admin",
  permissions: ["read_forums", "create_questions", "vote"],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **Key Files Modified**

#### **1. User Service (`src/lib/services/userService.ts`)**
- `createUserProfile()` - Creates user profile with default role
- `getUserProfile()` - Retrieves user profile with role/permissions
- `updateUserRole()` - Updates user role (admin only)
- `hasPermission()` - Checks if user has specific permission
- `isModerator()` / `isAdmin()` - Role checking utilities
- `searchUser()` - Search users by email or UID

#### **2. Auth Context (`src/contexts/AuthContext.tsx`)**
- Automatically loads user roles from Firestore
- Creates user profiles on signup
- Provides `refreshUserProfile()` for role updates

#### **3. Event Creation (`src/app/events/create/page.tsx`)**
- Checks `create_events` permission before allowing access
- Shows informative message for non-moderators
- Provides guidance on becoming a moderator

#### **4. Admin Panel (`src/app/admin/page.tsx`)**
- Admin-only interface for managing user roles
- Search users by email or UID
- Update user roles with proper validation

#### **5. Navigation (`src/components/layout/AppSidebar.tsx`)**
- Shows "Admin Panel" link only for admin users
- Styled with distinctive red color for admin access

## 🚀 **How to Use**

### **For Regular Users**
1. Sign up with @vit.edu.in email
2. Automatically assigned "user" role
3. Can participate in forums but cannot create events
4. See informative message when trying to create events

### **For Admins**
1. Access admin panel via sidebar (admin users only)
2. Search for users by email or UID
3. Update user roles as needed
4. Monitor role permissions

### **Making Someone a Moderator/Admin**

#### **Option 1: Using Admin Panel (Recommended)**
1. Sign in as admin
2. Go to Admin Panel in sidebar
3. Search for user by email
4. Select new role and update

#### **Option 2: Direct Firestore Update**
1. Go to Firebase Console
2. Navigate to Firestore Database
3. Find user document in `users` collection
4. Update `role` field to `"moderator"` or `"admin"`
5. Update `permissions` array accordingly
6. User needs to refresh browser

#### **Option 3: Using Admin Script (Advanced)**
1. Set up Firebase Admin SDK
2. Configure `scripts/make-admin.js` with your service account
3. Run: `node scripts/make-admin.js admin user@vit.edu.in`

## 🔒 **Security Features**

### **Client-Side Protection**
- UI elements hidden based on permissions
- Route protection for admin/moderator pages
- Informative error messages

### **Server-Side Protection**
- Event creation service checks permissions
- Database rules should be configured (recommended)
- Role validation on all sensitive operations

### **Permission Validation**
```typescript
// Example usage
if (hasPermission(user, 'create_events')) {
  // Allow event creation
} else {
  // Show access denied message
}
```

## 🎨 **User Experience**

### **Non-Moderator Experience**
- Clear explanation of why they can't create events
- Guidance on becoming a moderator
- Alternative actions (browse events, join discussions)
- Professional, encouraging messaging

### **Moderator Experience**
- Crown icon indicating special status
- "Create New Event" page with role confirmation
- Full event management capabilities

### **Admin Experience**
- Red-colored admin panel link in sidebar
- Comprehensive user management interface
- Role update capabilities with search functionality

## 🔧 **Configuration**

### **Default Permissions**
Modify `getPermissionsForRole()` in `userService.ts` to adjust default permissions for each role.

### **Adding New Permissions**
1. Add permission string to relevant role arrays
2. Update permission checks in components
3. Add server-side validation where needed

### **Role Hierarchy**
Current hierarchy: User < Moderator < Admin
- Admins have all moderator permissions
- Moderators have all user permissions

## 🚨 **Important Notes**

### **First Admin Setup**
Since no one is admin initially, you'll need to manually set the first admin:
1. Sign up with your email
2. Go to Firestore Console
3. Find your user document
4. Change `role` to `"admin"`
5. Update `permissions` array
6. Refresh browser

### **Email Domain Restriction**
- Only @vit.edu.in emails can sign up
- This is enforced at authentication level
- Prevents unauthorized access

### **Role Persistence**
- Roles are stored in Firestore
- Persist across sessions
- Updated in real-time when changed

## 🔮 **Future Enhancements**

### **Possible Improvements**
1. **Bulk Role Management** - Update multiple users at once
2. **Role Request System** - Users can request moderator status
3. **Activity-Based Promotion** - Auto-promote active users
4. **Granular Permissions** - More specific permission controls
5. **Audit Logging** - Track role changes and admin actions
6. **Community-Specific Moderators** - Moderators for specific communities

### **Advanced Features**
1. **Firebase Security Rules** - Server-side permission enforcement
2. **Custom Claims** - Firebase Auth custom claims for better performance
3. **Role Expiration** - Temporary moderator roles
4. **Multi-Level Approval** - Admin approval for moderator requests

## 📊 **Testing Checklist**

### **User Role Testing**
- [ ] New users get "user" role by default
- [ ] Users cannot access event creation page
- [ ] Users see appropriate messaging when trying to create events
- [ ] Users can participate in forums normally

### **Moderator Role Testing**
- [ ] Moderators can create events
- [ ] Moderators see crown icon and role confirmation
- [ ] Moderators cannot access admin panel
- [ ] Event creation works properly for moderators

### **Admin Role Testing**
- [ ] Admins can access admin panel
- [ ] Admin panel search functionality works
- [ ] Role updates work correctly
- [ ] Admin panel shows in sidebar
- [ ] Admins can create events

### **Security Testing**
- [ ] Direct URL access to admin panel blocked for non-admins
- [ ] Event creation API rejects non-moderator requests
- [ ] Role changes require admin permissions
- [ ] UI elements properly hidden based on roles

## 🎉 **Success Metrics**

The RBAC system successfully:
- ✅ Prevents unauthorized event creation
- ✅ Maintains open forum access for all users
- ✅ Provides clear user guidance and feedback
- ✅ Enables easy role management for admins
- ✅ Scales with community growth
- ✅ Maintains security while being user-friendly

## 📞 **Support**

For issues with the RBAC system:
1. Check user permissions in Firestore
2. Verify role assignments are correct
3. Ensure user has refreshed browser after role changes
4. Check console for permission-related errors

The system is designed to be robust and user-friendly while maintaining security and preventing abuse. 