# NICE Grading - Backend API

Express.js + MongoDB backend for NICE Grading SaaS platform.

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your MongoDB and Stripe credentials.

3. **Run development server:**

   ```bash
   npm run dev
   ```

4. **Run production:**
   ```bash
   npm start
   ```

## API Routes

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Submissions (requires auth)

- `POST /api/submissions` - Create submission
- `GET /api/submissions` - Get user's submissions
- `GET /api/submissions/:id` - Get submission details
- `PATCH /api/submissions/:id/status` - Update status

### Payments (requires auth)

- `POST /api/payments/pay-now` - Initiate pay now flow
- `POST /api/payments/confirm-payment` - Confirm payment
- `POST /api/payments/pay-later` - Initiate pay later flow
- `POST /api/payments/confirm-payment-method` - Save payment method

### Admin (requires admin auth)

- `GET /api/admin/submissions` - List all submissions (paginated)
- `PATCH /api/admin/submissions/:id/status` - Update status (triggers auto-charge)
- `GET /api/admin/analytics` - Get system analytics

### Webhooks

- `POST /api/webhooks/stripe` - Stripe webhook handler

## Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nice-grading
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173
```

## Database

Uses MongoDB with Mongoose. Key collections:

- `users` - User accounts and profiles
- `submissions` - Card submissions with details
- `payments` - Payment transaction records

Auto-generated indexes on:

- User: `email` (unique)
- Submission: `userId`, `createdAt`, `submissionStatus`, `paymentStatus`
- Payment: `userId`, `submissionId`, `createdAt`

## Key Features

- **JWT Authentication** - Secure token-based auth
- **Role-based Access** - Customer and admin roles
- **Stripe Integration** - Pay Now & Pay Later flows
- **Auto-charging** - Admin status change triggers charge
- **Webhook Handling** - Stripe event processing
- **Rate Limiting** - Prevents abuse on auth & payments
- **Input Validation** - Joi schema validation
- **Error Handling** - Centralized error middleware
- **Security** - Helmet, CORS, bcrypt password hashing

## Testing

Create test scripts in `src/tests/` directory.

## Deployment

See main README.md for deployment instructions for Railway/Render.

## Notes

- Password reset tokens expire in 30 minutes
- JWT tokens valid for 7 days (configurable)
- Admin auto-charge happens on status → "Completed"
- All monetary amounts in USD cents
- Stripe events processed asynchronously via webhooks
