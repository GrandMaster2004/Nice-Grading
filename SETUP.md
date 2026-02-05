# NICE Grading - Full Stack Setup Guide

## ⚡ Installation (5 minutes)

### Step 1: Clone & Install Dependencies

```bash
# Navigate to workspace
cd "Nice Grading"

# Install all (root script)
npm run install-all
```

### Step 2: Backend Configuration

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your credentials:
# - MONGODB_URI: MongoDB Atlas connection string
# - JWT_SECRET: Random string (use: openssl rand -hex 32)
# - STRIPE_SECRET_KEY: From Stripe Dashboard
# - STRIPE_WEBHOOK_SECRET: From Stripe Webhooks
# - STRIPE_PUBLISHABLE_KEY: From Stripe Dashboard
```

### Step 3: Frontend Configuration

```bash
cd ../frontend

# Copy environment template
cp .env.example .env

# Edit .env with:
# - VITE_API_URL: http://localhost:5000 (dev) or production URL
# - VITE_STRIPE_PUBLISHABLE_KEY: From Stripe Dashboard
```

### Step 4: MongoDB Setup

Option A - MongoDB Atlas (Cloud):

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Create database user with password
4. Whitelist your IP
5. Copy connection string to `.env` as `MONGODB_URI`

Option B - Local MongoDB:

```bash
# Install MongoDB Community: https://docs.mongodb.com/manual/installation/
mongod  # Start MongoDB daemon
# Use: mongodb://localhost:27017/nice-grading
```

### Step 5: Stripe Setup

1. Create account at https://stripe.com
2. Go to Developers → API Keys
3. Copy Test Secret Key → `STRIPE_SECRET_KEY`
4. Copy Test Publishable Key → `STRIPE_PUBLISHABLE_KEY`
5. Go to Webhooks → Add endpoint:
   - URL: http://localhost:5000/api/webhooks/stripe (dev)
   - Events: payment_intent._, setup_intent._, charge.\*
6. Copy Signing Secret → `STRIPE_WEBHOOK_SECRET`

## 🚀 Running Locally

### Terminal 1 - Backend

```bash
cd backend
npm run dev
# Server starts on http://localhost:5000
```

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
# Frontend starts on http://localhost:5173
```

### Test the Setup

1. Open http://localhost:5173
2. Click "START" → Register account
3. Add cards → Review → Payment
4. Use Stripe test card: 4242 4242 4242 4242 (any future date, any CVC)

## 📱 User Flows to Test

### Flow 1: Registration & Dashboard

1. Register with email & password
2. Dashboard shows empty submissions
3. Session caches user profile

### Flow 2: Add Cards & Submit

1. Add Cards page - enter card details
2. Speed Demon toggle test
3. Review page - check pricing
4. Submit - creates submission

### Flow 3: Pay Now

1. Payment page - Pay Now selected
2. Enter Stripe test card
3. Immediate charge
4. Confirmation page

### Flow 4: Pay Later

1. Payment page - Pay Later selected
2. Enter Stripe test card
3. Charge on admin complete
4. Admin dashboard tests next

### Flow 5: Admin Panel

1. Login with admin account (change role in DB: `{role: 'admin'}`)
2. View all submissions in table
3. Change status → triggers auto-charge if unpaid
4. View analytics

## 🔧 Development Tips

### Database

```bash
# MongoDB Shell (mongosh)
use nice-grading

# View collections
show collections

# Find submissions
db.submissions.find()

# Clear all data
db.submissions.deleteMany({})
```

### Debugging

```bash
# Backend logs are printed to console
# Check MongoDB connection, JWT errors, Stripe errors

# Frontend browser DevTools
# Check Network tab for API calls
# Check Console for JS errors
# Check Application → Storage for cache
```

### Useful Commands

```bash
# Reset cache
localStorage.clear()
sessionStorage.clear()

# Check stored token
localStorage.getItem('token')

# Decode JWT
# Use: jwt.io website
```

## 📦 Deployment Checklist

Before going to production:

- [ ] Change `NODE_ENV` to `production`
- [ ] Generate strong `JWT_SECRET` (openssl rand -hex 32)
- [ ] Use Stripe LIVE keys (not test keys)
- [ ] Set correct `FRONTEND_URL` in backend
- [ ] Enable HTTPS everywhere
- [ ] Configure MongoDB whitelist for production IPs
- [ ] Set up email service for password resets
- [ ] Enable rate limiting (check middleware)
- [ ] Set up monitoring/logging (e.g., Sentry)
- [ ] Test payment webhook with Stripe CLI:
  ```bash
  stripe listen --forward-to localhost:5000/api/webhooks/stripe
  ```

## 🛠 Troubleshooting

### "Cannot connect to MongoDB"

- Check connection string in `.env`
- Verify IP is whitelisted in MongoDB Atlas
- Ensure database user has correct password

### "Stripe webhook failed"

- Check `STRIPE_WEBHOOK_SECRET` is correct
- Verify webhook endpoint URL is accessible
- Check request signature in Stripe Dashboard logs

### "CORS error when calling API"

- Verify `FRONTEND_URL` in backend `.env` matches actual frontend
- Check frontend is making requests to correct `VITE_API_URL`

### "Session cache not persisting"

- Check browser sessionStorage is enabled
- Try incognito mode (no extensions blocking)
- Clear browser cache & reload

### "Payment not going through"

- Use Stripe test card: 4242 4242 4242 4242
- Check Stripe Dashboard for payment intent status
- Verify webhook is being received (Stripe Dashboard → Webhooks → Events)

## 📚 Documentation

- [Stripe API Docs](https://stripe.com/docs/api)
- [MongoDB Mongoose](https://mongoosejs.com/)
- [Express.js](https://expressjs.com/)
- [React Hooks](https://react.dev/reference/react)
- [Tailwind CSS](https://tailwindcss.com/)

## 🎯 Next Steps

1. **Customize Styling** - Update colors/fonts in `tailwind.config.js`
2. **Add Real Card Images** - Replace placeholder assets
3. **Email Service** - Implement password reset emails
4. **Payment Notifications** - Send order confirmation emails
5. **Analytics** - Add Google Analytics or Mixpanel
6. **Customer Support** - Integrate Intercom or similar

## 📞 Support

For issues:

1. Check error logs in terminal
2. Review Stripe Dashboard for payment errors
3. Check MongoDB Atlas for database status
4. Use browser DevTools to inspect API requests

---

**Ready to build? Start with Terminal 1 (backend) then Terminal 2 (frontend)!**
