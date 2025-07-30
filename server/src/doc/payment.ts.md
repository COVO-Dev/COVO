# 💳 Payment Service & Routes

Handles **payment initiation**, **transaction processing**, **wallet management**, **bank account management**, and **transaction history** for brands and influencers.

---

## 📌 Endpoints

| Method | Endpoint                                  | Description                              | Auth Required |
|--------|-------------------------------------------|------------------------------------------|---------------|
| POST   | `/webhook`                               | Paystack payment webhook (public)       | No            |
| POST   | `/initiate`                              | Initiate a payment                       | Yes           |
| POST   | `/wallet/add-bank-account`               | Add/update influencer bank account      | Yes           |
| POST   | `/wallet/withdraw`                       | Withdraw from influencer wallet         | Yes           |
| GET    | `/wallet`                                | Get influencer or brand wallet details  | Yes           |
| GET    | `/wallet/withdrawals`                    | Get influencer wallet withdrawal history| Yes           |
| GET    | `/transactions/brand`                    | Get brand transactions (paginated)      | Yes           |
| GET    | `/transactions/influencer`               | Get influencer transactions (paginated) | Yes           |
| GET    | `/transactions/:id`                      | Get transaction details by ID            | Yes           |
| GET    | `/export/transactions/brand`             | Export brand transactions report         | Yes           |
| GET    | `/export/transactions/influencer`        | Export influencer transactions report    | Yes           |

---

## 🔧 Service Methods

### `initiatePayment(request)`
- Begins payment process with Paystack.
- Calculates platform commission (8%) and influencer payout.
- Creates transaction record and Paystack payment session.
- Returns payment URL and transaction details.

### `handlePaymentWebhook(payload)`
- Handles Paystack webhook calls after payment.
- Updates transaction status.
- Transfers platform commission to platform account.
- Transfers payout to influencer bank or wallet.
- Updates campaign payment statistics.

### `addInfluencerBankAccount(influencerId, bankDetails)`
- Verifies bank account via Paystack.
- Creates a Paystack transfer recipient.
- Deactivates old accounts and saves new active, verified bank account.

### `withdrawFromWallet(userId, amount)`
- Checks wallet balance.
- Verifies active bank account.
- Initiates withdrawal transfer via Paystack.
- Updates wallet and logs transaction.

### `getWallet(userId, userType)`
- Returns wallet balance and recent transactions.
- Returns default zeroed wallet if none exists.

### `getBrandTransactions(brandId, page, limit)`
- Paginated fetch of brand transactions.

### `getInfluencerTransactions(influencerId, page, limit)`
- Paginated fetch of influencer transactions.

### `getTransaction(transactionId)`
- Retrieves single transaction with populated campaign, brand, and influencer data.

### `getWithdrawalHistory(userId)`
- Lists influencer wallet withdrawal transactions.

---

## ✅ Validation & Errors

- Uses MongoDB transactions for atomic operations.
- Handles errors with try/catch and transaction rollback.
- Validates influencer bank account via Paystack.
- Throws descriptive errors on failure.

---

## 🧠 Notes

- Platform commission rate hardcoded at 8%.
- Payment handled via Paystack with immediate split method.
- Wallet is fallback if bank transfer fails.
- Supports exporting transactions (PDF, etc.) via routes.
- Sensitive operations protected by `authMiddleware`.
