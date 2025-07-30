# 📅 Subscription Service & Routes

Manages subscription plans, creation, activation, cancellation, and history tracking with Paystack integration.

---

## 📌 Endpoints

| Method  | Endpoint                     | Description                                | Auth Required |
|---------|------------------------------|--------------------------------------------|---------------|
| POST    | `/webhook/paystack`           | Handle Paystack webhook (payment updates) | No            |
| GET     | `/plans`                     | Get all active subscription plans          | No            |
| POST    | `/subscribe`                 | Create a new subscription                    | Yes           |
| POST    | `/verify-payment`            | Verify subscription payment                  | Yes           |
| GET     | `/history`                   | Get user subscription history                | Yes           |
| GET     | `/current`                   | Get current user subscription (protected)   | Yes           |
| POST    | `/change-plan`               | Change user subscription plan                 | Yes           |
| DELETE  | `/:subscriptionId/cancel`    | Cancel a subscription                         | Yes           |

---

## 🔧 Service Methods

### `initializePlans()`
- Creates default subscription plans in database and Paystack.
- Handles free and paid plans.
- Logs creation status.

### `getPlans()`
- Returns all active plans sorted by price.

### `getPlanById(planId)`
- Fetches a plan by its database ID.

### `getPlanByCode(planCode)`
- Fetches a plan by Paystack plan code.

### `createSubscription(userId, planId, email)`
- Creates a new subscription.
- For free plans, activates immediately.
- For paid plans, initializes Paystack transaction and creates pending subscription.

### `activateSubscription(reference)`
- Verifies payment with Paystack.
- Activates subscription on successful payment.

### `cancelSubscription(subscriptionId, userId)`
- Cancels user subscription.
- Cancels Paystack subscription if applicable.

### `getUserActiveSubscription(userId)`
- Returns currently active subscription for a user.

### `getUserSubscriptionHistory(userId)`
- Returns all subscriptions for a user, sorted by creation date.

### `changeSubscription(userId, newPlanId, email)`
- Cancels current subscription if any.
- Creates new subscription with new plan.

### `checkAndUpdateExpiredSubscriptions()`
- Finds expired subscriptions and marks them inactive.

### `getSubscriptionStats()`
- Provides summary stats: total, active, cancelled, pending subscriptions, and total revenue.

### `renewSubscription(subscriptionId, userId)`
- Extends subscription end date based on plan interval.

---

## ✅ Validation & Errors

- Throws errors for missing plans, duplicate active subscriptions, invalid cancellations.
- Logs and handles Paystack API errors gracefully.

---

## 🧠 Notes

- Plans include tiered features and monthly billing.
- Payment handled via Paystack with webhook support.
- Middleware enforces subscription access for protected routes.
- Subscription renewal and status checks included.

---
