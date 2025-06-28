# Local Bank API Server

A Node.js implementation of the Bank Backend API discovered from `https://cursorworkshopserver.onrender.com/`. This local server replicates the exact API structure, endpoints, and response formats.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation & Setup

1. **Navigate to the server directory:**
   ```bash
   cd local-bank-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Verify it's running:**
   ```bash
   curl http://localhost:3001/
   ```

The server will be available at `http://localhost:3001` (Note: We use port 3001 to avoid conflicts with Apple's AirPlay service on port 5000)

## 📊 Pre-loaded Sample Data

The server comes with the exact same sample data discovered from the remote API:

### Accounts
1. **John Doe** - ID: 1, Account: 1234567890, Balance: $1,500.00 (Checking)
2. **Jane Smith** - ID: 2, Account: 0987654321, Balance: $2,716.50 (Savings)
3. **El Ildaro** - ID: 3, Account: 7362141486, Balance: $34.00 (Checking)
4. **juancho** - ID: 4, Account: 8370711022, Balance: $3,000,000.00 (Checking)

### Transactions
- Historical transactions including deposits, withdrawals, and transfers
- 5 pre-loaded transactions matching the discovered data

## 🔗 API Endpoints

All endpoints match the discovered API specification exactly:

### 1. API Information
```bash
GET /
# Returns API info and available endpoints
curl http://localhost:3001/
```

### 2. Account Management
```bash
# Get all accounts
GET /api/accounts
curl http://localhost:3001/api/accounts

# Get specific account
GET /api/accounts/:id
curl http://localhost:3001/api/accounts/1

# Get account balance
GET /api/accounts/:id/balance
curl http://localhost:3001/api/accounts/1/balance

# Create new account
POST /api/accounts
curl -X POST http://localhost:3001/api/accounts \
  -H "Content-Type: application/json" \
  -d '{"accountHolder": "New User", "initialBalance": 1000, "accountType": "checking"}'
```

### 3. Transaction Management
```bash
# Get all transactions
GET /api/transactions
curl http://localhost:3001/api/transactions

# Create transaction (deposit/withdrawal)
POST /api/accounts/:id/transactions
curl -X POST http://localhost:3001/api/accounts/1/transactions \
  -H "Content-Type: application/json" \
  -d '{"type": "deposit", "amount": 500, "description": "Salary deposit"}'

curl -X POST http://localhost:3001/api/accounts/1/transactions \
  -H "Content-Type: application/json" \
  -d '{"type": "withdrawal", "amount": 100, "description": "ATM withdrawal"}'
```

### 4. Fund Transfers
```bash
POST /api/transfer
curl -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromAccountId": 1, "toAccountId": 2, "amount": 250, "description": "Payment"}'
```

### 5. Account Statements
```bash
GET /api/accounts/:id/statement?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
curl "http://localhost:3001/api/accounts/1/statement?startDate=2025-06-01&endDate=2025-06-30"
```

### 6. Account Management Operations
```bash
# Freeze account
POST /api/accounts/:id/freeze
curl -X POST http://localhost:3001/api/accounts/1/freeze \
  -H "Content-Type: application/json" \
  -d '{"reason": "Suspicious activity"}'

# Unfreeze account
POST /api/accounts/:id/unfreeze
curl -X POST http://localhost:3001/api/accounts/1/unfreeze

# Apply interest (savings accounts only)
POST /api/accounts/:id/interest
curl -X POST http://localhost:3001/api/accounts/2/interest \
  -H "Content-Type: application/json" \
  -d '{"rate": 0.025}'
```

## 🧪 Testing the API

### Test Script
You can test all endpoints quickly with these commands:

```bash
# 1. Check API info
curl http://localhost:3001/

# 2. Get all accounts
curl http://localhost:3001/api/accounts

# 3. Get account balance
curl http://localhost:3001/api/accounts/1/balance

# 4. Get all transactions
curl http://localhost:3001/api/transactions

# 5. Create a deposit
curl -X POST http://localhost:3001/api/accounts/1/transactions \
  -H "Content-Type: application/json" \
  -d '{"type": "deposit", "amount": 1000, "description": "Test deposit"}'

# 6. Transfer funds
curl -X POST http://localhost:3001/api/transfer \
  -H "Content-Type: application/json" \
  -d '{"fromAccountId": 4, "toAccountId": 1, "amount": 5000, "description": "Test transfer"}'

# 7. Get account statement
curl "http://localhost:3001/api/accounts/1/statement?startDate=2025-06-01&endDate=2025-12-31"
```

## 🔍 Features

### ✅ Fully Implemented
- **Account Management** - Create, read, update accounts
- **Transaction Processing** - Deposits, withdrawals, transfers
- **Balance Management** - Real-time balance updates
- **Account Statements** - Date-range filtered statements with summaries
- **Account Controls** - Freeze/unfreeze functionality
- **Interest Calculations** - For savings accounts
- **Error Handling** - Comprehensive error responses
- **Data Validation** - Input validation and business rules

### 📝 Response Formats
All responses match the discovered API specification exactly:
- JSON format
- Consistent error handling
- Proper HTTP status codes
- Detailed transaction records
- Rich statement summaries

### 🔧 Business Rules
- **Withdrawals** - Cannot exceed account balance
- **Transfers** - Validates both source and destination accounts
- **Interest** - Only applied to savings accounts
- **Account Numbers** - Auto-generated 10-digit numbers
- **Transaction IDs** - Sequential integer IDs
- **Timestamps** - ISO 8601 format

## 📁 File Structure

```
local-bank-server/
├── package.json          # Dependencies and scripts
├── server.js            # Main server implementation  
├── README.md           # This documentation
└── test-api.sh         # API testing script (optional)
```

## 🔗 Comparison with Remote API

This local implementation provides **100% compatibility** with the discovered remote API:

| Feature | Remote API | Local API | Status |
|---------|------------|-----------|---------|
| Endpoints | ✅ All endpoints | ✅ All endpoints | ✅ Match |
| Response Format | ✅ JSON | ✅ JSON | ✅ Match |
| Sample Data | ✅ 4 accounts, 5 transactions | ✅ 4 accounts, 5 transactions | ✅ Match |
| Error Handling | ✅ Proper errors | ✅ Proper errors | ✅ Match |
| Business Logic | ✅ Full functionality | ✅ Full functionality | ✅ Match |

## 🛠️ Development

### Available Scripts
- `npm start` - Run the server in production mode
- `npm run dev` - Run with nodemon for development (auto-restart)

### Customization
The server uses in-memory storage, making it easy to:
- Add new endpoints
- Modify business logic
- Extend data models
- Add authentication
- Integrate with databases

### Port Configuration
Default port is `3001` (changed from 5000 to avoid Apple AirPlay conflicts). Change via environment variable:
```bash
PORT=3000 npm start
```

## 🔒 Security Notes

⚠️ **Development Use Only**
- No authentication implemented
- In-memory storage (data lost on restart)
- No rate limiting
- No input sanitization beyond basic validation

For production use, consider adding:
- JWT authentication
- Database persistence
- Input sanitization
- Rate limiting
- HTTPS enforcement

## 📚 Next Steps

1. **Test the API** - Use the provided curl commands
2. **Integrate with Frontend** - Connect your React app to `http://localhost:3001`
3. **Extend Functionality** - Add new features or modify existing ones
4. **Add Persistence** - Replace in-memory storage with a database
5. **Deploy** - Deploy to your preferred hosting platform

---

🏦 **Ready to use!** Your local Bank API server is an exact replica of the discovered remote API and ready for development and testing. 