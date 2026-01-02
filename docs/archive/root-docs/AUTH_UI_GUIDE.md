# Authentication UI Guide

**Version**: 2.0.0  
**Date**: December 30, 2024

---

## 🎨 New Authentication UI

We've added a complete authentication UI with mock login flow for development and production-ready Google OAuth.

### What Was Added

1. **LoginModal.vue** - Beautiful login modal with Google button
2. **UserProfile.vue** - User profile dropdown in header
3. **Mock authentication** - Realistic dev experience without Google OAuth setup

---

## 📸 Components

### 1. Login Modal

**Features:**
- Google OAuth button (styled like real Google login)
- Development mode indicator
- Feature list showcase
- Privacy policy links
- Smooth animations

**Behavior:**
- **Development**: Shows "Sign in with Test Account" + simulates 1s delay
- **Production**: Shows "Sign in with Google" + real OAuth flow

**Trigger**: User clicks "Sign In" button in header

### 2. User Profile

**Features:**
- User avatar with initials
- User name and role display
- Dropdown menu with:
  - Profile settings (coming soon)
  - My Library (opens load modal)
  - Admin Dashboard (admin only)
  - Sign Out button
- Development mode badge
- Admin badge

**Visual States:**
- **Not logged in**: Blue "Sign In" button
- **Logged in (regular)**: User avatar + name + dropdown
- **Logged in (dev)**: Orange avatar with 🔧 badge
- **Logged in (admin)**: Admin badge in dropdown

---

## 🔧 Development Mode

### Mock Users

Two predefined mock users for testing:

```javascript
// Regular User
{
  id: 'dev-user-1',
  email: 'alice.dev@ziner.local',
  name: 'Alice Developer',
  role: 'user',
  isTemp: true,
  avatar: '🎨'
}

// Admin User
{
  id: 'dev-admin-1',
  email: 'admin.dev@ziner.local',
  name: 'Admin Developer',
  role: 'admin',
  isTemp: true,
  avatar: '⚙️'
}
```

**Default**: Regular user (Alice Developer)

### How to Switch Users

**Method 1: localStorage**
```javascript
// In browser console
localStorage.setItem('dev_user_id', 'dev-admin-1')
// Reload page
```

**Method 2: Sign out and back in**
1. Click user avatar
2. Click "Sign Out"
3. Click "Sign In"
4. Gets same user (persisted in localStorage)

### Auto-Login

Development mode **automatically logs you in** on app load:
- No login modal shows
- Uses saved user from localStorage
- If no saved user, defaults to Alice Developer

---

## 🚀 Production Mode

### Setup Required

**1. Get Google OAuth Credentials**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create OAuth 2.0 Client ID
- Add redirect URIs

**2. Configure Environment**
```bash
# frontend/.env.production
VITE_SKIP_AUTH=false
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=https://app.yourdomain.com/auth/callback
```

**3. Real Auth Flow**
1. User clicks "Sign In"
2. Login modal shows real "Sign in with Google"
3. Google OAuth popup appears
4. User authorizes
5. Backend exchanges code for JWT
6. User logged in with real Google profile

---

## 🎯 User Flow

### Development

```
App Loads
    ↓
Auto-login as Alice Developer
    ↓
Header shows user avatar
    ↓
Click avatar → See profile menu
    ↓
Click "Sign Out" → Confirmation
    ↓
Logged out → "Sign In" button appears
    ↓
Click "Sign In" → Login modal
    ↓
Click "Sign in with Test Account"
    ↓
1 second delay (simulates OAuth)
    ↓
Logged back in as Alice
```

### Production

```
App Loads (no auto-login)
    ↓
Header shows "Sign In" button
    ↓
Click "Sign In" → Login modal
    ↓
Click "Sign in with Google"
    ↓
Google OAuth popup
    ↓
User authorizes
    ↓
Backend verifies + creates session
    ↓
User logged in with real profile
    ↓
Header shows avatar with real name/email
```

---

## 🎨 UI Components Breakdown

### Header Integration

```vue
<div class="header-right">
  <!-- ... other buttons ... -->
  <UserProfile />
</div>
```

**Responsive Design:**
- Desktop: Full user info visible
- Tablet: Name + avatar
- Mobile: Avatar only

### Login Modal

**Structure:**
```
┌─────────────────────────────┐
│    Welcome to Ziner      ✕  │
│  Sign in to save your work  │
│                             │
│  ┌──────────────────────┐  │
│  │  [G] Sign in with... │  │
│  └──────────────────────┘  │
│                             │
│  🔧 Development Mode        │
│  Using test account         │
│                             │
│  What you get:              │
│  💾 Save to cloud           │
│  🔄 Access anywhere         │
│  📚 Unlimited projects      │
│  🎨 All features            │
│                             │
│  Terms & Privacy            │
└─────────────────────────────┘
```

### User Profile Dropdown

```
┌────────────────────────┐
│  AD  Alice Developer   │
│      alice@ziner.local │
│      🔧 Development Mode│
├────────────────────────┤
│  👤 Profile Settings   │
│  📚 My Library      3  │
├────────────────────────┤
│  🚪 Sign Out           │
└────────────────────────┘
```

---

## 🔐 Security Notes

### Development
- ✅ Auto-login for convenience
- ✅ Clearly marked as "Development Mode"
- ✅ No real credentials needed
- ✅ Same security flow as production (JWT tokens)

### Production
- ✅ Real Google OAuth
- ✅ JWT token verification
- ✅ Secure session management
- ✅ No auto-login
- ✅ User must explicitly sign in

---

## 🛠️ Customization

### Add More Mock Users

Edit `frontend/src/services/auth/AuthService.js`:

```javascript
const mockUsers = [
  // ... existing users ...
  {
    id: 'dev-user-2',
    email: 'bob.dev@ziner.local',
    name: 'Bob Designer',
    role: 'user',
    isTemp: true,
    avatar: '🎨',
  }
]
```

### Change Default User

```javascript
// Change this line:
selectedUser = mockUsers[0]  // First user (Alice)

// To:
selectedUser = mockUsers[1]  // Second user (Admin)
```

### Customize Avatar Colors

Edit `UserProfile.vue`:

```css
.user-avatar {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}
```

### Add More Menu Items

Edit `UserProfile.vue`:

```vue
<button class="menu-item" @click="yourAction">
  <span class="item-icon">🎯</span>
  <span>Your Feature</span>
</button>
```

---

## 🧪 Testing

### Test Login Flow
1. Start app
2. Should auto-login as Alice Developer
3. Avatar shows "AD" initials
4. Click avatar → menu opens
5. See profile info + badge

### Test Logout Flow
1. Click avatar
2. Click "Sign Out"
3. Confirm dialog appears
4. After confirmation, "Sign In" button shows
5. Click "Sign In" → modal opens

### Test Mock Login
1. When logged out, click "Sign In"
2. Modal appears
3. Click "Sign in with Test Account"
4. 1 second delay
5. Modal closes
6. Logged in as Alice

### Test Admin User
1. In console: `localStorage.setItem('dev_user_id', 'dev-admin-1')`
2. Reload page
3. Logged in as Admin Developer
4. Click avatar → see "Admin" badge
5. See "Admin Dashboard" menu item

---

## 📱 Responsive Behavior

**Desktop (>1200px)**
- Full user info: Avatar + Name + Role + Dropdown icon
- Dropdown: 280px wide

**Tablet (768px - 1200px)**
- Avatar + Name (no role)
- Smaller dropdown: 240px

**Mobile (<768px)**
- Avatar only
- Dropdown: Full width - 40px padding

---

## 🎓 Key Files

| File | Purpose |
|------|---------|
| `LoginModal.vue` | Login UI + mock/real OAuth |
| `UserProfile.vue` | User avatar + dropdown menu |
| `AuthService.js` | Mock user logic |
| `authStore.js` | Auth state management |
| `Header.vue` | Integration point |

---

## ✅ Checklist

### Development Experience
- [x] Auto-login on app load
- [x] Realistic user profiles
- [x] Development mode badge
- [x] No Google OAuth setup needed
- [x] Easy user switching (localStorage)

### Production Ready
- [x] Real Google OAuth integration
- [x] Proper user sessions
- [x] Secure token handling
- [x] Role-based UI (admin features)
- [x] Clean separation dev/prod

---

## 🎉 Benefits

**For Developers:**
- ✅ No auth barriers during development
- ✅ Test admin features locally
- ✅ Realistic user experience
- ✅ Easy to switch between users

**For Users:**
- ✅ Beautiful, modern UI
- ✅ Familiar Google sign-in
- ✅ Clear visual feedback
- ✅ Easy access to profile/settings

**For Product:**
- ✅ Production-ready auth UI
- ✅ Extensible for new features
- ✅ Role-based features ready
- ✅ Great first impression

---

**Enjoy the smooth authentication experience!** 🚀🔐
