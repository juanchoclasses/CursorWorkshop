const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// In-memory data storage (matching discovered data)
let accounts = [
  {
    id: 1,
    teamId: "demo-team",
    accountNumber: "1234567890",
    accountHolder: "John Doe",
    balance: 1500,
    accountType: "checking",
    status: "active",
    createdAt: "2025-05-24T05:01:21.435Z"
  },
  {
    id: 2,
    teamId: "demo-team",
    accountNumber: "0987654321",
    accountHolder: "Jane Smith",
    balance: 2716.5,
    accountType: "savings",
    status: "active",
    createdAt: "2025-04-24T05:01:21.435Z"
  },
  {
    id: 3,
    teamId: "demo-team",
    accountNumber: "7362141486",
    accountHolder: "El Ildaro",
    balance: 34,
    accountType: "checking",
    status: "active",
    createdAt: "2025-06-23T22:45:31.756Z"
  },
  {
    id: 4,
    teamId: "demo-team",
    accountNumber: "8370711022",
    accountHolder: "juancho",
    balance: 3000000,
    accountType: "checking",
    status: "active",
    createdAt: "2025-06-26T20:32:17.248Z"
  }
];

let transactions = [
  {
    id: 1,
    accountId: 1,
    type: "deposit",
    amount: 500,
    description: "Salary deposit",
    timestamp: "2025-06-16T05:01:21.435Z",
    balanceAfter: 1500
  },
  {
    id: 2,
    accountId: 1,
    type: "withdrawal",
    amount: 100,
    description: "ATM withdrawal",
    timestamp: "2025-06-22T05:01:21.435Z",
    balanceAfter: 1400
  },
  {
    id: 3,
    accountId: 2,
    type: "transfer_out",
    amount: 34,
    description: "Transfer to 7362141486: ddf",
    timestamp: "2025-06-23T22:45:58.921Z",
    balanceAfter: 2716.5
  },
  {
    id: 4,
    accountId: 3,
    type: "transfer_in",
    amount: 34,
    description: "Transfer from 0987654321: ddf",
    timestamp: "2025-06-23T22:45:58.921Z",
    balanceAfter: 34
  },
  {
    id: 5,
    accountId: 4,
    type: "deposit",
    amount: 3000000,
    description: "Initial deposit",
    timestamp: "2025-06-26T20:32:17.264Z",
    balanceAfter: 3000000
  }
];

// Helper functions
let nextAccountId = 5;
let nextTransactionId = 6;

function findAccountById(id) {
  return accounts.find(account => account.id === parseInt(id));
}

function findTransactionsByAccountId(accountId) {
  return transactions.filter(transaction => transaction.accountId === parseInt(accountId));
}

function generateAccountNumber() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}

// API Routes

// 1. API Information (Root endpoint)
app.get('/', (req, res) => {
  res.json({
    message: "Bank Backend API",
    version: "1.0.0",
    endpoints: {
      accounts: "/api/accounts",
      transactions: "/api/transactions",
      balance: "/api/accounts/:id/balance",
      transfer: "/api/transfer",
      freeze: "/api/accounts/:id/freeze",
      unfreeze: "/api/accounts/:id/unfreeze",
      interest: "/api/accounts/:id/interest",
      statement: "/api/accounts/:id/statement"
    }
  });
});

// 2. Get All Accounts
app.get('/api/accounts', (req, res) => {
  res.json(accounts);
});

// 3. Get Specific Account
app.get('/api/accounts/:id', (req, res) => {
  const account = findAccountById(req.params.id);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  res.json(account);
});

// 4. Get Account Balance
app.get('/api/accounts/:id/balance', (req, res) => {
  const account = findAccountById(req.params.id);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }
  res.json({
    accountId: account.id,
    accountNumber: account.accountNumber,
    balance: account.balance
  });
});

// 5. Get All Transactions
app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

// 6. Get Account Statement
app.get('/api/accounts/:id/statement', (req, res) => {
  const { startDate, endDate } = req.query;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Start date and end date are required' });
  }

  const account = findAccountById(req.params.id);
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  const accountTransactions = findTransactionsByAccountId(req.params.id);
  
  // Filter transactions by date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  const filteredTransactions = accountTransactions.filter(transaction => {
    const transactionDate = new Date(transaction.timestamp);
    return transactionDate >= start && transactionDate <= end;
  });

  // Calculate summary
  const totalDeposits = filteredTransactions
    .filter(t => t.type === 'deposit' || t.type === 'transfer_in')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalWithdrawals = filteredTransactions
    .filter(t => t.type === 'withdrawal' || t.type === 'transfer_out')
    .reduce((sum, t) => sum + t.amount, 0);

  const openingBalance = filteredTransactions.length > 0 
    ? filteredTransactions[0].balanceAfter - filteredTransactions[0].amount 
    : account.balance;
  
  const closingBalance = account.balance;

  res.json({
    account: {
      id: account.id,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
      accountType: account.accountType
    },
    period: {
      startDate: startDate,
      endDate: endDate
    },
    summary: {
      openingBalance: openingBalance,
      closingBalance: closingBalance,
      totalDeposits: totalDeposits,
      totalWithdrawals: totalWithdrawals,
      transactionCount: filteredTransactions.length
    },
    transactions: filteredTransactions
  });
});

// 7. Create New Account
app.post('/api/accounts', (req, res) => {
  const { accountHolder, initialBalance = 0, accountType = 'checking' } = req.body;
  
  if (!accountHolder) {
    return res.status(400).json({ error: 'Account holder name is required' });
  }

  const newAccount = {
    id: nextAccountId++,
    teamId: "demo-team",
    accountNumber: generateAccountNumber(),
    accountHolder: accountHolder,
    balance: initialBalance,
    accountType: accountType,
    status: "active",
    createdAt: new Date().toISOString()
  };

  accounts.push(newAccount);

  // Create initial deposit transaction if there's an initial balance
  if (initialBalance > 0) {
    const initialTransaction = {
      id: nextTransactionId++,
      accountId: newAccount.id,
      type: "deposit",
      amount: initialBalance,
      description: "Initial deposit",
      timestamp: new Date().toISOString(),
      balanceAfter: initialBalance
    };
    transactions.push(initialTransaction);
  }

  res.status(201).json(newAccount);
});

// 8. Create Transaction (Deposit/Withdrawal)
app.post('/api/accounts/:id/transactions', (req, res) => {
  const { type, amount, description } = req.body;
  const account = findAccountById(req.params.id);
  
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  if (!type || !amount) {
    return res.status(400).json({ error: 'Transaction type and amount are required' });
  }

  if (amount <= 0) {
    return res.status(400).json({ error: 'Amount must be positive' });
  }

  if (type === 'withdrawal' && account.balance < amount) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  // Update account balance
  if (type === 'deposit') {
    account.balance += amount;
  } else if (type === 'withdrawal') {
    account.balance -= amount;
  } else {
    return res.status(400).json({ error: 'Invalid transaction type. Use "deposit" or "withdrawal"' });
  }

  // Create transaction record
  const newTransaction = {
    id: nextTransactionId++,
    accountId: account.id,
    type: type,
    amount: amount,
    description: description || `${type.charAt(0).toUpperCase() + type.slice(1)} transaction`,
    timestamp: new Date().toISOString(),
    balanceAfter: account.balance
  };

  transactions.push(newTransaction);

  res.status(201).json({
    transaction: newTransaction,
    newBalance: account.balance
  });
});

// 9. Transfer Funds
app.post('/api/transfer', (req, res) => {
  const { fromAccountId, toAccountId, amount, description } = req.body;
  
  if (!fromAccountId || !toAccountId || !amount) {
    return res.status(400).json({ error: 'From account, to account, and amount are required' });
  }

  const fromAccount = findAccountById(fromAccountId);
  const toAccount = findAccountById(toAccountId);

  if (!fromAccount) {
    return res.status(404).json({ error: 'Source account not found' });
  }

  if (!toAccount) {
    return res.status(404).json({ error: 'Destination account not found' });
  }

  if (fromAccount.balance < amount) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  // Update balances
  fromAccount.balance -= amount;
  toAccount.balance += amount;

  // Create transfer transactions
  const transferOutTransaction = {
    id: nextTransactionId++,
    accountId: fromAccount.id,
    type: "transfer_out",
    amount: amount,
    description: `Transfer to ${toAccount.accountNumber}: ${description || 'Transfer'}`,
    timestamp: new Date().toISOString(),
    balanceAfter: fromAccount.balance
  };

  const transferInTransaction = {
    id: nextTransactionId++,
    accountId: toAccount.id,
    type: "transfer_in",
    amount: amount,
    description: `Transfer from ${fromAccount.accountNumber}: ${description || 'Transfer'}`,
    timestamp: new Date().toISOString(),
    balanceAfter: toAccount.balance
  };

  transactions.push(transferOutTransaction);
  transactions.push(transferInTransaction);

  res.json({
    message: 'Transfer completed successfully',
    transferId: transferOutTransaction.id,
    fromAccount: {
      id: fromAccount.id,
      newBalance: fromAccount.balance
    },
    toAccount: {
      id: toAccount.id,
      newBalance: toAccount.balance
    }
  });
});

// 10. Freeze Account
app.post('/api/accounts/:id/freeze', (req, res) => {
  const account = findAccountById(req.params.id);
  
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  account.status = 'frozen';
  account.frozenAt = new Date().toISOString();
  account.freezeReason = req.body.reason || 'Administrative action';

  res.json({
    message: 'Account frozen successfully',
    account: account
  });
});

// 11. Unfreeze Account
app.post('/api/accounts/:id/unfreeze', (req, res) => {
  const account = findAccountById(req.params.id);
  
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  account.status = 'active';
  delete account.frozenAt;
  delete account.freezeReason;
  account.unfrozenAt = new Date().toISOString();

  res.json({
    message: 'Account unfrozen successfully',
    account: account
  });
});

// 12. Calculate Interest
app.post('/api/accounts/:id/interest', (req, res) => {
  const { rate = 0.02 } = req.body; // Default 2% annual rate
  const account = findAccountById(req.params.id);
  
  if (!account) {
    return res.status(404).json({ error: 'Account not found' });
  }

  if (account.accountType !== 'savings') {
    return res.status(400).json({ error: 'Interest can only be applied to savings accounts' });
  }

  const interestAmount = account.balance * rate;
  account.balance += interestAmount;

  // Create interest transaction
  const interestTransaction = {
    id: nextTransactionId++,
    accountId: account.id,
    type: "interest",
    amount: interestAmount,
    description: `Interest applied at ${(rate * 100).toFixed(2)}% rate`,
    timestamp: new Date().toISOString(),
    balanceAfter: account.balance
  };

  transactions.push(interestTransaction);

  res.json({
    message: 'Interest applied successfully',
    interestAmount: interestAmount,
    newBalance: account.balance,
    transaction: interestTransaction
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏦 Local Bank API Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
  console.log(`🧪 Test with: curl http://localhost:${PORT}/`);
  console.log(`📊 Sample accounts: ${accounts.length} accounts loaded`);
  console.log(`💳 Sample transactions: ${transactions.length} transactions loaded`);
});

module.exports = app; 