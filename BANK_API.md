# Bank Backend API Documentation

This document provides comprehensive API documentation for the Bank Backend system. All endpoints return JSON responses and expect JSON request bodies where applicable.

## Base URL
```
http://localhost:8080
```

## Team-Based Banking System
This API supports multi-team usage for classroom exercises. Each team can manage their own set of accounts and transactions by providing a `teamId` parameter.

### Team Isolation Features:
- **Account Separation**: Each account belongs to a specific team
- **Data Filtering**: Teams can only view/modify their own accounts and transactions  
- **Transfer Restrictions**: Money transfers can only occur between accounts of the same team
- **Transaction History**: All transaction queries are automatically filtered by team

### Using Team IDs:
- Include `teamId` as a query parameter: `?teamId=team-alpha`
- Or include `teamId` in the request body for POST/PUT operations
- Team IDs are case-sensitive strings (e.g., "team-alpha", "team-beta", "frontend-team-1")

### Example Team Usage:
```http
# Team Alpha creates an account
POST /api/accounts
{"teamId": "team-alpha", "accountHolder": "Alice", "initialBalance": 1000}

# Team Beta creates an account  
POST /api/accounts
{"teamId": "team-beta", "accountHolder": "Bob", "initialBalance": 500}

# Team Alpha views only their accounts
GET /api/accounts?teamId=team-alpha

# Team Alpha transfers between their own accounts
POST /api/transfer
{"teamId": "team-alpha", "fromAccountId": 1, "toAccountId": 3, "amount": 100}
```

## Authentication
*Note: Current implementation does not require authentication. In production, add JWT token authentication.*

---

## 1. Get API Information

**GET** `/`

Get basic information about the API and available endpoints.

### Request
```http
GET /
```

### Response
```json
{
  "message": "Bank Backend API",
  "version": "1.0.0",
  "endpoints": {
    "accounts": "/api/accounts",
    "transactions": "/api/transactions",
    "balance": "/api/accounts/:id/balance"
  }
}
```

---

## 2. Get All Accounts

**GET** `/api/accounts`

Retrieve a list of all bank accounts in the system, optionally filtered by team.

### Request (All accounts)
```http
GET /api/accounts
```

### Request (Team-specific)
```http
GET /api/accounts?teamId=team-alpha
```

### Response
```json
[
  {
    "id": 1,
    "teamId": "team-alpha",
    "accountNumber": "1234567890",
    "accountHolder": "John Doe",
    "balance": 1500.00,
    "accountType": "checking",
    "status": "active",
    "createdAt": "2025-06-15T10:30:45.123Z"
  },
  {
    "id": 2,
    "teamId": "team-alpha", 
    "accountNumber": "0987654321",
    "accountHolder": "Jane Smith",
    "balance": 2750.50,
    "accountType": "savings",
    "status": "active",
    "createdAt": "2025-06-14T14:22:10.456Z"
  }
]
```

---

## 3. Get Account by ID

**GET** `/api/accounts/:id`

Retrieve details of a specific account by its ID.

### Request
```http
GET /api/accounts/1
```

### Response
```json
{
  "id": 1,
  "accountNumber": "1234567890",
  "accountHolder": "John Doe",
  "balance": 1500.00,
  "accountType": "checking"
}
```

### Error Response (404)
```json
{
  "error": "Account not found"
}
```

---

## 4. Create New Account

**POST** `/api/accounts`

Create a new bank account. **Team ID is required.**

### Request
```http
POST /api/accounts
Content-Type: application/json

{
  "teamId": "team-alpha",
  "accountHolder": "Alice Johnson",
  "initialBalance": 1000,
  "accountType": "savings"
}
```

### Response (201)
```json
{
  "id": 3,
  "teamId": "team-alpha",
  "accountNumber": "5647382910",
  "accountHolder": "Alice Johnson",
  "balance": 1000,
  "accountType": "savings",
  "status": "active",
  "createdAt": "2025-06-15T10:30:45.123Z"
}
```

### Error Responses (400)
```json
{
  "error": "Team ID is required"
}
```
```json
{
  "error": "Account holder name is required"
}
```

---

## 5. Update Account Details

**PUT** `/api/accounts/:id`

Update account holder information.

### Request
```http
PUT /api/accounts/1
Content-Type: application/json

{
  "accountHolder": "John Michael Doe",
  "accountType": "checking"
}
```

### Response
```json
{
  "id": 1,
  "accountNumber": "1234567890",
  "accountHolder": "John Michael Doe",
  "balance": 1500.00,
  "accountType": "checking"
}
```

---

## 6. Get Account Balance

**GET** `/api/accounts/:id/balance`

Retrieve the current balance of a specific account.

### Request
```http
GET /api/accounts/1/balance
```

### Response
```json
{
  "accountId": 1,
  "accountNumber": "1234567890",
  "balance": 1500.00
}
```

---

## 7. Get Account Transactions

**GET** `/api/accounts/:id/transactions`

Retrieve all transactions for a specific account.

### Request
```http
GET /api/accounts/1/transactions
```

### Response
```json
[
  {
    "id": 1,
    "accountId": 1,
    "type": "deposit",
    "amount": 500.00,
    "description": "Salary deposit",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "accountId": 1,
    "type": "withdrawal",
    "amount": 100.00,
    "description": "ATM withdrawal",
    "timestamp": "2024-01-14T14:22:00.000Z"
  }
]
```

---

## 8. Create Transaction (Deposit/Withdrawal)

**POST** `/api/accounts/:id/transactions`

Create a new transaction for an account (deposit or withdrawal).

### Request (Deposit)
```http
POST /api/accounts/1/transactions
Content-Type: application/json

{
  "type": "deposit",
  "amount": 250.00,
  "description": "Cash deposit"
}
```

### Response (201)
```json
{
  "transaction": {
    "id": 3,
    "accountId": 1,
    "type": "deposit",
    "amount": 250.00,
    "description": "Cash deposit",
    "timestamp": "2025-06-16T16:45:00.000Z"
  },
  "newBalance": 1750.00
}
```

### Request (Withdrawal)
```http
POST /api/accounts/1/transactions
Content-Type: application/json

{
  "type": "withdrawal",
  "amount": 75.00,
  "description": "Gas station"
}
```

### Error Response (400 - Insufficient Funds)
```json
{
  "error": "Insufficient funds"
}
```

---

## 9. Transfer Funds Between Accounts

**POST** `/api/transfer`

Transfer money from one account to another.

### Request
```http
POST /api/transfer
Content-Type: application/json

{
  "fromAccountId": 1,
  "toAccountId": 2,
  "amount": 200.00,
  "description": "Rent payment"
}
```

### Response
```json
{
  "message": "Transfer completed successfully",
  "fromAccount": {
    "id": 1,
    "newBalance": 1300.00
  },
  "toAccount": {
    "id": 2,
    "newBalance": 2950.50
  },
  "transactions": [
    {
      "id": 4,
      "accountId": 1,
      "type": "transfer_out",
      "amount": 200.00,
      "description": "Transfer to 0987654321: Rent payment",
      "timestamp": "2025-06-16T18:30:00.000Z"
    },
    {
      "id": 5,
      "accountId": 2,
      "type": "transfer_in",
      "amount": 200.00,
      "description": "Transfer from 1234567890: Rent payment",
      "timestamp": "2025-06-16T18:30:00.000Z"
    }
  ]
}
```

---

## 10. Get All Transactions

**GET** `/api/transactions`

Retrieve all transactions across all accounts.

### Request
```http
GET /api/transactions
```

### Response
```json
[
  {
    "id": 1,
    "accountId": 1,
    "type": "deposit",
    "amount": 500.00,
    "description": "Salary deposit",
    "timestamp": "2024-01-15T10:30:00.000Z"
  },
  {
    "id": 2,
    "accountId": 1,
    "type": "withdrawal",
    "amount": 100.00,
    "description": "ATM withdrawal",
    "timestamp": "2024-01-14T14:22:00.000Z"
  }
]
```

---

## 11. Get Transaction by ID

**GET** `/api/transactions/:id`

Retrieve details of a specific transaction.

### Request
```http
GET /api/transactions/1
```

### Response
```json
{
  "id": 1,
  "accountId": 1,
  "type": "deposit",
  "amount": 500.00,
  "description": "Salary deposit",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## 12. Freeze Account

**PUT** `/api/accounts/:id/freeze`

Freeze an account to prevent transactions.

### Request
```http
PUT /api/accounts/1/freeze
Content-Type: application/json

{
  "reason": "Suspected fraudulent activity"
}
```

### Response
```json
{
  "id": 1,
  "accountNumber": "1234567890",
  "accountHolder": "John Doe",
  "balance": 1500.00,
  "accountType": "checking",
  "status": "frozen",
  "freezeReason": "Suspected fraudulent activity",
      "frozenAt": "2025-06-16T20:00:00.000Z"
}
```

---

## 13. Unfreeze Account

**PUT** `/api/accounts/:id/unfreeze`

Unfreeze a previously frozen account.

### Request
```http
PUT /api/accounts/1/unfreeze
```

### Response
```json
{
  "id": 1,
  "accountNumber": "1234567890",
  "accountHolder": "John Doe",
  "balance": 1500.00,
  "accountType": "checking",
  "status": "active",
      "unfrozenAt": "2025-06-17T09:30:00.000Z"
}
```

---

## 14. Get Account Statement

**GET** `/api/accounts/:id/statement`

Get a detailed account statement with transactions for a specific period.

### Request
```http
GET /api/accounts/1/statement?startDate=2025-06-01&endDate=2025-06-30
```

### Response
```json
{
  "account": {
    "id": 1,
    "accountNumber": "1234567890",
    "accountHolder": "John Doe",
    "accountType": "checking"
  },
  "period": {
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  },
  "summary": {
    "openingBalance": 1000.00,
    "closingBalance": 1500.00,
    "totalDeposits": 750.00,
    "totalWithdrawals": 250.00,
    "transactionCount": 8
  },
  "transactions": [
    {
      "id": 1,
      "type": "deposit",
      "amount": 500.00,
      "description": "Salary deposit",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## 15. Calculate and Apply Interest

**POST** `/api/accounts/:id/interest`

Calculate and apply interest to a savings account.

### Request
```http
POST /api/accounts/2/interest
Content-Type: application/json

{
  "interestRate": 0.025,
  "period": "monthly"
}
```

### Response
```json
{
  "account": {
    "id": 2,
    "accountNumber": "0987654321",
    "accountHolder": "Jane Smith",
    "previousBalance": 2750.50,
    "newBalance": 2756.19,
    "accountType": "savings"
  },
  "interest": {
    "rate": 0.025,
    "period": "monthly",
    "amount": 5.69,
    "appliedAt": "2025-06-30T23:59:59.000Z"
  },
  "transaction": {
    "id": 6,
    "accountId": 2,
    "type": "interest",
    "amount": 5.69,
    "description": "Monthly interest - 2.5% APR",
    "timestamp": "2025-06-30T23:59:59.000Z"
  }
}
```

---

## 16. Close Account

**DELETE** `/api/accounts/:id`

Close a bank account (only allowed if balance is zero).

### Request
```http
DELETE /api/accounts/3
```

### Response
```json
{
  "message": "Account closed successfully",
  "closedAccount": {
    "id": 3,
    "accountNumber": "5647382910",
    "accountHolder": "Alice Johnson",
    "finalBalance": 0.00,
    "closedAt": "2025-06-17T10:00:00.000Z"
  }
}
```

### Error Response (400 - Non-zero balance)
```json
{
  "error": "Cannot close account with non-zero balance. Current balance: $1000.00"
}
```

---

## Error Handling

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Invalid request data or business rule violation"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Something went wrong!"
}
```

---

## Data Types

### Account Object
```typescript
interface Account {
  id: number;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  accountType: 'checking' | 'savings';
  status?: 'active' | 'frozen' | 'closed';
}
```

### Transaction Object
```typescript
interface Transaction {
  id: number;
  accountId: number;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'interest';
  amount: number;
  description: string;
  timestamp: string; // ISO 8601 format
}
```

---

## Rate Limiting
*Note: Not implemented in current version. Consider adding rate limiting for production use.*

## API Versioning
Current version: v1.0.0  
Future versions will be available at `/v2/` endpoints.

---

*Last updated: June 2025* 