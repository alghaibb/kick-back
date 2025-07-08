# Group Invite System - Testing Guide

## 🚀 Quick Start Testing

### 1. **Database Setup**

```bash
# Apply the new schema
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 2. **Environment Variables**

Make sure you have these in your `.env`:

```env
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DATABASE_URL=your_database_url
```

### 3. **Start the Development Server**

```bash
npm run dev
```

## 🧪 Testing Scenarios

### **Scenario 1: Basic Invitation Flow**

#### Step 1: Create a Group

1. Go to dashboard
2. Click "Create Group"
3. Fill out the form and create a group
4. ✅ Verify group appears in dashboard

#### Step 2: Send Invitation

1. Navigate to the group (you'll need to create a group page or add invite button)
2. Click "Invite Members" or similar
3. Enter an email address
4. Select role (member/admin)
5. Click "Send Invitation"
6. ✅ Verify success toast appears
7. ✅ Check email was sent (check Resend dashboard)

#### Step 3: Accept Invitation

1. Open the email sent to the invited user
2. Click the "Accept Invitation" link
3. ✅ Should redirect to accept-invite page
4. ✅ Should show "Welcome to the Group!" message
5. ✅ Should redirect to groups page after 2 seconds

### **Scenario 2: Invitation Management**

#### Step 1: View Pending Invitations

1. As group admin, open the invite modal
2. Switch to "Manage Invites" tab
3. ✅ Should see pending invitations
4. ✅ Should show email, inviter, and date

#### Step 2: Resend Invitation

1. Click the refresh icon on a pending invitation
2. ✅ Should show "Invitation resent successfully"
3. ✅ Check that new email was sent
4. ✅ Verify expiration date was extended

#### Step 3: Cancel Invitation

1. Click the X icon on a pending invitation
2. ✅ Should show "Invitation cancelled"
3. ✅ Invitation should disappear from list

### **Scenario 3: Error Handling**

#### Test Duplicate Invitation

1. Try to invite the same email twice
2. ✅ Should show "An invitation has already been sent to this email"

#### Test Invalid Email

1. Enter an invalid email format
2. ✅ Should show validation error

#### Test Expired Invitation

1. Wait for invitation to expire (or manually expire in database)
2. Try to accept expired invitation
3. ✅ Should show "This invitation has expired"

#### Test Wrong Email

1. Send invitation to email A
2. Try to accept with email B (different account)
3. ✅ Should show "This invitation was sent to a different email address"

## 🔧 Manual Database Testing

### **Check Database Records**

```sql
-- View all invitations
SELECT * FROM group_invites;

-- View pending invitations
SELECT * FROM group_invites WHERE status = 'pending';

-- View expired invitations
SELECT * FROM group_invites WHERE expiresAt < NOW();
```

### **Test Rate Limiting**

```sql
-- Check rate limit counters
SELECT * FROM rate_limit_counters WHERE key LIKE '%invite%';
```

## 🛠️ Test Utilities

### **Create Test Data Script**

```typescript
// scripts/create-test-data.ts
import prisma from "../src/lib/prisma";
import { generateToken } from "../src/utils/tokens";

async function createTestData() {
  // Create test users
  const user1 = await prisma.user.create({
    data: {
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      hasOnboarded: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: "Invited",
      lastName: "User",
      email: "invited@example.com",
      hasOnboarded: true,
    },
  });

  // Create test group
  const group = await prisma.group.create({
    data: {
      name: "Test Group",
      description: "A test group for invitations",
      createdBy: user1.id,
      members: {
        create: {
          userId: user1.id,
          role: "admin",
        },
      },
    },
  });

  // Create test invitation
  const invite = await prisma.groupInvite.create({
    data: {
      groupId: group.id,
      email: "invited@example.com",
      invitedBy: user1.id,
      token: generateToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log("Test data created:", { user1, user2, group, invite });
}

createTestData().catch(console.error);
```

### **Test Email Function**

```typescript
// scripts/test-email.ts
import { sendGroupInviteEmail } from "../src/utils/sendEmails";

async function testEmail() {
  try {
    await sendGroupInviteEmail(
      "test@example.com",
      "John Doe",
      "Test Group",
      "test-token-123"
    );
    console.log("✅ Email sent successfully");
  } catch (error) {
    console.error("❌ Email failed:", error);
  }
}

testEmail();
```

## 🧪 Automated Testing

### **Unit Tests**

```typescript
// __tests__/group-invite.test.ts
import {
  inviteToGroupAction,
  acceptGroupInviteAction,
} from "../src/app/(main)/groups/actions";

describe("Group Invite Actions", () => {
  test("should send invitation successfully", async () => {
    const formData = new FormData();
    formData.append("groupId", "test-group-id");
    formData.append("email", "test@example.com");
    formData.append("role", "member");

    const result = await inviteToGroupAction(formData);
    expect(result.success).toBe(true);
  });

  test("should prevent duplicate invitations", async () => {
    // Send first invitation
    const formData1 = new FormData();
    formData1.append("groupId", "test-group-id");
    formData1.append("email", "test@example.com");
    formData1.append("role", "member");
    await inviteToGroupAction(formData1);

    // Try to send duplicate
    const formData2 = new FormData();
    formData2.append("groupId", "test-group-id");
    formData2.append("email", "test@example.com");
    formData2.append("role", "member");
    const result = await inviteToGroupAction(formData2);

    expect(result.error).toContain("already been sent");
  });
});
```

## 🔍 Debugging Tips

### **Check Logs**

```bash
# Watch for errors in terminal
npm run dev

# Check browser console for frontend errors
# Check Network tab for API calls
```

### **Database Debugging**

```sql
-- Check if user exists
SELECT * FROM users WHERE email = 'test@example.com';

-- Check group membership
SELECT * FROM group_members WHERE groupId = 'your-group-id';

-- Check invitation status
SELECT * FROM group_invites WHERE email = 'test@example.com';
```

### **Email Debugging**

1. Check Resend dashboard for email delivery
2. Verify `RESEND_API_KEY` is correct
3. Check email templates render correctly
4. Verify `NEXT_PUBLIC_BASE_URL` is set correctly

## 🚨 Common Issues & Solutions

### **Issue: "Group not found or you don't have permission"**

**Solution**:

- Verify user is admin/owner of the group
- Check group exists in database
- Ensure user is logged in

### **Issue: "Failed to send invitation email"**

**Solution**:

- Check `RESEND_API_KEY` is valid
- Verify email format is correct
- Check Resend account has credits

### **Issue: "Invalid or expired invitation"**

**Solution**:

- Check token exists in database
- Verify invitation hasn't expired
- Ensure status is "pending"

### **Issue: Rate limiting errors**

**Solution**:

- Wait for rate limit to reset (1 hour)
- Check rate limit counters in database
- Verify rate limiting logic

## 📊 Testing Checklist

### **Core Functionality**

- [ ] Create group
- [ ] Send invitation
- [ ] Receive email
- [ ] Accept invitation
- [ ] Join group successfully

### **Management Features**

- [ ] View pending invitations
- [ ] Resend invitation
- [ ] Cancel invitation
- [ ] See invitation status

### **Error Handling**

- [ ] Duplicate invitation prevention
- [ ] Invalid email validation
- [ ] Expired invitation handling
- [ ] Permission checks
- [ ] Rate limiting

### **Security**

- [ ] Token validation
- [ ] Email ownership verification
- [ ] Permission enforcement
- [ ] Rate limiting enforcement

### **User Experience**

- [ ] Loading states
- [ ] Success messages
- [ ] Error messages
- [ ] Automatic redirects
- [ ] Responsive design

## 🎯 Next Steps

1. **Run through all scenarios** above
2. **Test with real email addresses**
3. **Verify email templates** look good
4. **Test on different devices** (mobile, tablet, desktop)
5. **Check performance** with multiple invitations
6. **Verify security** by testing edge cases

This comprehensive testing approach will ensure your group invite system works reliably in all scenarios!
