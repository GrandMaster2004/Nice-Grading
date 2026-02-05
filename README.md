# NICE Grading - Production MVP

A full-stack SaaS platform for premium trading card grading with a modern dark UI, neon green accents, and integrated Stripe payments supporting both Pay Now and Pay Later workflows.

## Tech Stack

### Frontend

- React 18 + Vite
- Tailwind CSS 3
- React Router v6
- Stripe.js integration
- Session-based caching with sessionStorage/localStorage

### Backend

- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Stripe (Pay Now + Pay Later)
- Rate limiting & Security (Helmet, CORS)

## Project Structure

```
nice-grading/
├── backend/
│   ├── src/
│   │   ├── models/          # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Submission.js
│   │   │   └── Payment.js
│   │   ├── controllers/     # Business logic
│   │   │   ├── authController.js
│   │   │   ├── submissionController.js
│   │   │   ├── paymentController.js
│   │   │   ├── adminController.js
│   │   │   └── webhookController.js
│   │   ├── routes/          # API endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── submissionRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   └── webhookRoutes.js
│   │   ├── middleware/      # Auth, validation, error handling
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── utils/           # Helpers
│   │   │   ├── helpers.js
│   │   │   └── stripe.js
│   │   └── server.js        # Express app entry
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable UI components
    │   │   ├── UI.jsx       # Button, Input, Card, etc.
    │   │   └── ProtectedRoute.jsx
    │   ├── pages/           # Full pages
    │   │   ├── Landing.jsx
    │   │   ├── Auth.jsx     # Login & Register
    │   │   ├── Dashboard.jsx
    │   │   ├── AddCards.jsx
    │   │   ├── SubmissionReview.jsx
    │   │   ├── Payment.jsx
    │   │   ├── Confirmation.jsx
    │   │   └── Admin.jsx
    │   ├── hooks/           # Custom React hooks
    │   │   ├── useAuth.js
    │   │   ├── useSubmissions.js
    │   │   ├── usePayment.js
    │   │   └── useAdmin.js
    │   ├── layouts/         # Layout components
    │   │   └── MainLayout.jsx
    │   ├── utils/           # Utilities
    │   │   ├── api.js       # API calls & storage
    │   │   ├── cache.js     # Session caching
    │   │   └── helpers.js
    │   ├── App.jsx          # Main router
    │   ├── main.jsx         # Entry point
    │   └── index.css        # Global styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── package.json
    ├── .env.example
    └── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account

### Backend Setup

1. **Navigate to backend directory:**

   ```bash
   cd backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:

   ```
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nice-grading
   JWT_SECRET=your_super_secret_jwt_key
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:

   ```
   VITE_API_URL=http://localhost:5000
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

## API Documentation

### Authentication Endpoints

#### Register

```
POST /api/auth/register
Body: {
  name: string,
  email: string,
  password: string
}
Response: { token, user }
```

#### Login

```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
Response: { token, user }
```

#### Forgot Password

```
POST /api/auth/forgot-password
Body: { email: string }
Response: { message, resetLink (dev only) }
```

#### Reset Password

```
POST /api/auth/reset-password
Body: {
  token: string,
  email: string,
  newPassword: string
}
Response: { token, user }
```

### Submission Endpoints

#### Create Submission

```
POST /api/submissions
Headers: Authorization: Bearer {token}
Body: {
  cards: [{ player, year, set, cardNumber, notes }],
  serviceTier: 'SPEED_DEMON' | 'THE_STANDARD' | 'BIG_MONEY',
  cardCount: number
}
Response: { submission }
```

#### Get User's Submissions

```
GET /api/submissions
Headers: Authorization: Bearer {token}
Response: { submissions }
```

#### Get Submission by ID

```
GET /api/submissions/:id
Headers: Authorization: Bearer {token}
Response: { submission }
```

#### Update Submission Status

```
PATCH /api/submissions/:id/status
Headers: Authorization: Bearer {token}
Body: { status: string }
Response: { submission }
```

### Payment Endpoints

#### Pay Now - Create Payment Intent

```
POST /api/payments/pay-now
Headers: Authorization: Bearer {token}
Body: {
  submissionId: string,
  paymentMethodId: string
}
Response: { clientSecret, submissionId }
```

#### Confirm Payment

```
POST /api/payments/confirm-payment
Headers: Authorization: Bearer {token}
Body: {
  submissionId: string,
  paymentIntentId: string
}
Response: { message, submission }
```

#### Pay Later - Create Setup Intent

```
POST /api/payments/pay-later
Headers: Authorization: Bearer {token}
Body: { submissionId: string }
Response: { clientSecret, submissionId, message }
```

#### Confirm Payment Method

```
POST /api/payments/confirm-payment-method
Headers: Authorization: Bearer {token}
Body: {
  submissionId: string,
  setupIntentId: string,
  paymentMethodId: string
}
Response: { message, submission }
```

### Admin Endpoints

#### Get All Submissions (Paginated)

```
GET /api/admin/submissions?page=1&status=Created&paymentStatus=unpaid
Headers: Authorization: Bearer {admin_token}
Response: {
  submissions,
  pagination: { page, pageSize, total, totalPages }
}
```

#### Update Submission Status (with auto-charge)

```
PATCH /api/admin/submissions/:id/status
Headers: Authorization: Bearer {admin_token}
Body: { status: string }
Response: { message, submission }
```

#### Get Analytics

```
GET /api/admin/analytics
Headers: Authorization: Bearer {admin_token}
Response: {
  analytics: {
    totalSubmissions,
    completedSubmissions,
    inGradingCount,
    paidSubmissions,
    pendingPaymentCount,
    totalRevenue
  }
}
```

### Stripe Webhook

```
POST /api/webhooks/stripe
Headers: stripe-signature
Events:
- payment_intent.succeeded
- payment_intent.payment_failed
- setup_intent.succeeded
- charge.succeeded
```

## Caching Strategy

### Session Storage (sessionStorage)

Caches data for the current browser session:

- `user` - Logged-in user profile
- `submissions` - Dashboard submissions list
- `submission_form` - Multi-step form state (cards, tier, pricing)
- `pricing_tiers` - Service tier information

### Local Storage (localStorage)

Persists across sessions:

- `token` - JWT auth token
- `userRole` - User role (customer/admin)
- `stripeCustomerId` - Stripe customer ID (non-sensitive)

### Cache Validation

- Frontend checks cache before API calls
- Background revalidation triggers on data version changes
- Submission flow stored in cache until final submit
- Cache cleared on logout

## Payment Flow

### Pay Now

1. User creates submission with card details
2. Frontend creates PaymentIntent via API
3. Stripe processes card immediately
4. Submission status → "Awaiting Shipment"
5. On admin complete → already paid, ship cards

### Pay Later

1. User creates submission
2. Frontend creates SetupIntent to save card
3. No charge yet
4. Admin changes status → "Completed"
5. Backend auto-charges saved card
6. Handles failures gracefully with retry logic

## Security Features

### Backend

- JWT authentication with expiration
- Password hashing with bcryptjs
- Helmet.js for HTTP security headers
- CORS with whitelisted origin
- express-rate-limit on auth & payment endpoints
- Input validation with Joi
- Stripe webhook signature verification
- Sensitive data not exposed in logs

### Frontend

- Protected routes (ProtectedRoute component)
- Token expiration handling
- No sensitive Stripe data stored locally
- Graceful 401 logout handling
- CSRF protection via SameSite cookies

## Performance Optimizations

### Frontend

- React.lazy + Suspense for code splitting
- Skeleton loaders (no spinners)
- Optimistic UI updates
- Memoized components (useMemo, React.memo)
- Virtualized table rows (react-window ready)
- Debounced search inputs
- Prefetch next routes
- Minimize re-renders

### Backend

- Lean MongoDB queries with indexes
- Pagination for admin list (50 items/page)
- Rate-limiting to prevent abuse
- Async/await for non-blocking I/O
- Proper connection pooling

### Database Indexes

```javascript
// User
(-email(unique) -
  // Submission
  userId,
  createdAt - submissionStatus,
  paymentStatus -
    // Payment
    userId,
  createdAt - submissionId);
```

## Deployment

### Vercel (Frontend)

1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variables in Vercel dashboard:
   - `VITE_API_URL` → production backend URL
   - `VITE_STRIPE_PUBLISHABLE_KEY`
4. Deploy automatically on push

### Railway / Render (Backend)

1. Push code to GitHub
2. Create new project on Railway/Render
3. Set environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI` → MongoDB Atlas
   - `JWT_SECRET` → strong random key
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL` → production frontend URL
4. Deploy automatically on push

### Stripe Webhook Configuration

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `setup_intent.succeeded`
   - `charge.succeeded`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## Testing

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Add cards to submission
- [ ] Review submission summary
- [ ] Pay Now payment flow
- [ ] Pay Later payment flow
- [ ] Dashboard - view submissions
- [ ] Admin - view all submissions
- [ ] Admin - update submission status
- [ ] Admin - auto-charge on complete
- [ ] Stripe webhooks processing
- [ ] Session cache validity
- [ ] Token expiration handling
- [ ] Mobile responsiveness

## Troubleshooting

### MongoDB Connection Issues

- Verify connection string in `.env`
- Check IP whitelist in MongoDB Atlas
- Ensure database name is correct

### Stripe Integration Issues

- Verify keys are correct (test vs. live)
- Check webhook signature verification
- Review Stripe Dashboard logs

### CORS Errors

- Verify `FRONTEND_URL` in backend `.env`
- Ensure frontend is on allowed origin
- Check request headers include Content-Type

### Session Cache Not Working

- Check browser sessionStorage is enabled
- Clear cache manually if stale
- Check cache key names match

## Environment Variables Checklist

### Backend (.env)

- [ ] NODE_ENV
- [ ] PORT
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] JWT_EXPIRE
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_PUBLISHABLE_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] FRONTEND_URL

### Frontend (.env)

- [ ] VITE_API_URL
- [ ] VITE_STRIPE_PUBLISHABLE_KEY

## Contributing Guidelines

1. Create feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/name`
4. Create Pull Request with description

## Database Models

### User

```javascript
{
  name: String,
  email: String (unique),
  passwordHash: String,
  role: 'customer' | 'admin',
  stripeCustomerId: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Submission

```javascript
{
  userId: ObjectId (ref: User),
  cards: [{
    player: String,
    year: String,
    set: String,
    cardNumber: String,
    notes: String
  }],
  cardCount: Number,
  serviceTier: 'SPEED_DEMON' | 'THE_STANDARD' | 'BIG_MONEY',
  pricing: {
    basePrice: Number,
    processingFee: Number,
    total: Number
  },
  paymentStatus: 'unpaid' | 'paid' | 'failed',
  submissionStatus: 'Created' | 'Awaiting Shipment' | ... | 'Completed',
  stripePaymentIntentId: String,
  stripeSetupIntentId: String,
  stripePaymentMethodId: String,
  orderSummary: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Payment

```javascript
{
  submissionId: ObjectId (ref: Submission),
  userId: ObjectId (ref: User),
  amount: Number,
  currency: 'usd',
  paymentType: 'pay_now' | 'pay_later',
  status: 'pending' | 'succeeded' | 'failed' | 'refunded',
  stripeChargeId: String,
  stripePaymentIntentId: String,
  errorMessage: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Support

For issues or questions:

1. Check troubleshooting section above
2. Review error logs in terminal
3. Check Stripe Dashboard for payment issues
4. Review MongoDB Atlas for database issues

## License

MIT
