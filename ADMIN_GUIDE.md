# Admin Submissions Management System

This document describes the Admin Submissions List feature - a comprehensive tool for managing all customer submissions and monitoring system analytics.

## 📋 Overview

The Admin Submissions List provides:

- **Complete Submission Visibility**: View all customer submissions in a single, organized table
- **Real-time Status Management**: Update submission status with instant feedback
- **Auto-charge Capability**: Automatically charge unpaid submissions when marked as "Completed"
- **Advanced Filtering**: Filter by submission status, payment status
- **Analytics Dashboard**: View key metrics (total submissions, revenue, pending items)
- **Role-based Access Control**: Only authenticated admin users can access this feature

## 🔐 Access Control

### Requirements

- User must have `role = "admin"` in the database
- Must be authenticated (logged in)
- Attempting to access as non-admin will redirect to Customer Dashboard

### Admin User Setup

#### Option 1: Using the Seed Script (Recommended)

```bash
cd backend
node seed.js
```

This will create a default admin user:

- **Email**: admin@nicegrading.com
- **Password**: Admin123!

To customize, set environment variables before running:

```bash
ADMIN_EMAIL=youremail@example.com \
ADMIN_PASSWORD=YourPassword123! \
ADMIN_NAME="Your Name" \
node seed.js
```

#### Option 2: Manual Database Creation

Connect to MongoDB directly and insert:

```javascript
{
  "name": "Your Admin Name",
  "email": "admin@example.com",
  "passwordHash": "hashed_password", // Use bcrypt to hash
  "role": "admin",
  "stripeCustomerId": "cus_xxxxx",
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

## 🎯 Features

### 1. Submissions Table

**Columns:**

- **CUSTOMER**: Customer name and email address
- **ID**: Shortened submission ID (first 8 characters)
- **DATE**: Submission creation date
- **CARDS**: Number of cards in submission
- **SUBMISSION STATUS**: Current workflow status (dropdown for editing)
- **PAYMENT**: Payment status (Paid, Unpaid, Failed)
- **AMOUNT**: Total submission price

### 2. Submission Status Management

**Available Statuses** (in order):

1. **Created** - Initial state
2. **Awaiting Shipment** - Items ready to ship to grading facility
3. **Received** - Grading facility received items
4. **In Grading** - Currently being graded
5. **Ready for Payment** - Grading complete, awaiting payment
6. **Shipped** - Items shipped back to customer
7. **Completed** - Final state

**Inline Status Update:**

- Click the status dropdown to change
- Selection saves **immediately** (no extra button needed)
- "Saving..." indicator shows during update
- Optimistic UI updates for non-disruptive UX

### 3. Auto-Charge Logic

When a submission status is changed to **"Completed"**:

**Conditions:**

- Payment status must be "unpaid"
- Submission must have valid Stripe payment method

**Actions:**

- Automatically charges the saved payment method
- Payment record created (status: "succeeded")
- Payment status updates to "paid"
- Submission status saved as "Completed"

**Error Handling:**

- If charge fails: Payment status remains "unpaid"
- Error message displays at top of page
- UI remains functional for retry or manual action

### 4. Payment Status Values

| Status     | Description                    |
| ---------- | ------------------------------ |
| **Paid**   | Payment successfully received  |
| **Unpaid** | Payment not yet processed      |
| **Failed** | Payment attempted but declined |

### 5. Filtering

**Submission Status Filter:**

- All Status (default)
- Created
- Awaiting Shipment
- Received
- In Grading
- Ready for Payment
- Shipped
- Completed

**Payment Status Filter:**

- All Payment (default)
- Paid
- Unpaid
- Failed

Filters work together (AND logic) and update results instantly.

### 6. Analytics Dashboard

**Metrics Displayed:**

- **Total Submissions**: Count of all submissions in system
- **Processing Queue**: Submissions currently "In Grading"
- **Pending Payment**: Unpaid submissions in "Ready for Payment" status
- **Total Revenue**: Sum of all successful payments

## 🎨 UI/UX Details

### Responsive Design

- **Desktop (>768px)**: Full table with all columns visible, sticky headers
- **Tablet (480-768px)**: Compact table, filters stack horizontally
- **Mobile (<480px)**: Horizontal scrolling table, optimized font sizes

### Visual Feedback

- Hover effects on table rows
- Animated "Saving..." indicator during updates
- Error alerts with auto-dismiss (5 seconds)
- Loading skeleton while fetching data
- Empty state message when no results

### Color Coding

Status badges use consistent color scheme:

- **Created**: Gray (#737373)
- **Awaiting Shipment**: Gold (#f0c000)
- **Received**: Blue (#0ea5e9)
- **In Grading**: Purple (#8b5cf6)
- **Ready for Payment**: Orange (#fb923c)
- **Shipped**: Cyan (#06b6d4)
- **Completed**: Green (#10b981)

## 🔄 API Endpoints

All endpoints require admin authentication:

### GET /api/admin/submissions

Fetch paginated list of submissions

**Query Parameters:**

- `page`: Page number (default: 1)
- `status`: Filter by submission status (optional)
- `paymentStatus`: Filter by payment status (optional)

**Response:**

```json
{
  "success": true,
  "submissions": [
    {
      "_id": "...",
      "userId": { "name": "...", "email": "..." },
      "cardCount": 5,
      "submissionStatus": "In Grading",
      "paymentStatus": "unpaid",
      "pricing": { "total": 79.99 },
      "createdAt": "2026-02-06T..."
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 50,
    "total": 127,
    "totalPages": 3
  }
}
```

### PATCH /api/admin/submissions/:id/status

Update submission status with auto-charge if needed

**Request Body:**

```json
{
  "status": "Completed"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Status updated successfully",
  "submission": {
    /* updated submission */
  }
}
```

### GET /api/admin/analytics

Fetch system-wide analytics

**Response:**

```json
{
  "success": true,
  "analytics": {
    "totalSubmissions": 127,
    "completedSubmissions": 45,
    "inGradingCount": 12,
    "paidSubmissions": 98,
    "pendingPaymentCount": 23,
    "totalRevenue": 9847.5
  }
}
```

## 🚀 Best Practices

1. **Regular Monitoring**: Check "Processing Queue" regularly to identify bottlenecks
2. **Payment Management**: Monitor "Pending Payment" to ensure timely collections
3. **Status Updates**: Keep statuses current for accurate customer communication
4. **Error Handling**: Address payment failures promptly (may indicate updated card needed)
5. **Pagination**: Table shows 50 items per page; use pagination for large datasets

## ⚙️ Environment Variables

Required for admin functionality:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...

# Admin Setup (optional, for seed script)
ADMIN_EMAIL=admin@nicegrading.com
ADMIN_PASSWORD=Admin123!
ADMIN_NAME=Admin User
```

## 🔒 Security Notes

1. **Role-based Access**: Backend verifies admin role on every request
2. **Token Authentication**: All requests require valid JWT token
3. **HTTPS Only**: Use HTTPS in production
4. **Password Security**: Hash passwords with bcrypt (minimum 10 rounds)
5. **Default Credentials**: Change immediately after first login
6. **Audit Logging**: Consider implementing audit logs for compliance

## 📊 Common Workflows

### Workflow 1: Process New Submission

1. Monitor submissions in "Awaiting Shipment" status
2. Once items received at facility: Change status to "Received"
3. When grading begins: Change status to "In Grading"
4. After grading complete: Change status to "Ready for Payment"
5. Customer pays or auto-charge on completion: Payment status updates
6. Once shipped: Change status to "Shipped"
7. Final: Change status to "Completed"

### Workflow 2: Handle Failed Payment

1. Filter by "Payment Status": Failed
2. Contact customer about updated card info
3. Once customer provides new payment method, change status to "Completed"
4. Auto-charge will attempt to collect payment
5. Confirm "Payment Status" shows "Paid"

### Workflow 3: Monitor Revenue

1. Check "Total Revenue" metric (refreshed real-time)
2. Filter to "Paid" submissions to verify collection
3. Cross-reference with "Total Submissions" for completion rate
4. Monitor pending payments to identify outstanding receivables

## 🐛 Troubleshooting

**Problem**: Admin can't access the admin page

**Solutions:**

- Verify `role = "admin"` in database
- Check authentication token is valid
- Ensure JWT_SECRET matches backend
- Clear browser cache and try again

**Problem**: Status update fails silently

**Solutions:**

- Check network tab for error response
- Look for error message at top of page
- Verify admin user still has access
- Try refreshing the page

**Problem**: Auto-charge not working

**Solutions:**

- Verify Stripe payment method is valid
- Check STRIPE_SECRET_KEY is correct
- Ensure payment method hasn't expired
- Review Stripe logs for charge errors

## 📝 Pagination Behavior

- Default page size: 50 submissions per page
- Stateful: Current filters maintained across pagination
- Total count shown: "Page X of Y (Z total)"
- Disabled when at first/last page

## 🎯 Future Enhancements

Potential features for future versions:

- Bulk status updates
- Customer contact/messaging
- Submission detail view with card list
- Advanced search by submission ID
- Export submissions to CSV
- Recurring charge scheduling
- Refund management
- Dispute resolution interface
- API key management
- Admin audit logs

---

**Last Updated**: February 6, 2026
**Status**: Production Ready ✅
