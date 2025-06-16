import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { 
  bankService, 
  CreateAccountRequest, 
  CreateTransactionRequest, 
  TransferRequest,
  InterestRequest
} from './bank';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('combined'));

// 1. Get API Information
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Bank Backend API', 
    version: '1.0.0',
    endpoints: {
      accounts: '/api/accounts',
      transactions: '/api/transactions',
      balance: '/api/accounts/:id/balance',
      transfer: '/api/transfer',
      freeze: '/api/accounts/:id/freeze',
      unfreeze: '/api/accounts/:id/unfreeze',
      interest: '/api/accounts/:id/interest',
      statement: '/api/accounts/:id/statement'
    }
  });
});

// Development endpoint (keep for backwards compatibility)
app.get('/get', (req: Request, res: Response) => {
  res.json({ 
    message: 'This is to be developed',
    status: 'Under Development',
    timestamp: new Date().toISOString()
  });
});

// 2. Get all accounts (optionally filtered by team)
app.get('/api/accounts', (req: Request, res: Response) => {
  try {
    const teamId = req.query.teamId as string;
    const accounts = bankService.getAllAccounts(teamId);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 3. Get account by ID
app.get('/api/accounts/:id', (req: Request, res: Response) => {
  try {
    const teamId = req.query.teamId as string;
    const account = bankService.getAccountById(parseInt(req.params.id), teamId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    return res.json(account);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// 4. Create new account
app.post('/api/accounts', (req: Request<{}, {}, CreateAccountRequest>, res: Response) => {
  try {
    const newAccount = bankService.createAccount(req.body);
    res.status(201).json(newAccount);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// 5. Update account details
app.put('/api/accounts/:id', (req: Request, res: Response) => {
  try {
    const teamId = req.query.teamId as string || req.body.teamId;
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }
    const updatedAccount = bankService.updateAccount(parseInt(req.params.id), req.body, teamId);
    return res.json(updatedAccount);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

// 6. Get account balance
app.get('/api/accounts/:id/balance', (req: Request, res: Response) => {
  try {
    const teamId = req.query.teamId as string;
    const account = bankService.getAccountById(parseInt(req.params.id), teamId);
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    return res.json({ 
      accountId: account.id,
      accountNumber: account.accountNumber,
      balance: account.balance 
    });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// 7. Get account transactions
app.get('/api/accounts/:id/transactions', (req: Request, res: Response) => {
  try {
    const teamId = req.query.teamId as string;
    const transactions = bankService.getAccountTransactions(parseInt(req.params.id), teamId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 8. Create transaction (deposit/withdrawal)
app.post('/api/accounts/:id/transactions', (req: Request<{ id: string }, {}, CreateTransactionRequest>, res: Response) => {
  try {
    const teamId = req.query.teamId as string || req.body.teamId;
    const result = bankService.createTransaction(parseInt(req.params.id), req.body, teamId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// 9. Transfer funds between accounts
app.post('/api/transfer', (req: Request<{}, {}, TransferRequest>, res: Response) => {
  try {
    const teamId = req.query.teamId as string || req.body.teamId;
    const result = bankService.transferFunds(req.body, teamId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// 10. Get all transactions
app.get('/api/transactions', (req: Request, res: Response) => {
  try {
    const teamId = req.query.teamId as string;
    const transactions = bankService.getAllTransactions(teamId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// 11. Get transaction by ID
app.get('/api/transactions/:id', (req: Request, res: Response) => {
  try {
    const transaction = bankService.getTransactionById(parseInt(req.params.id));
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    return res.json(transaction);
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
});

// 12. Freeze account
app.put('/api/accounts/:id/freeze', (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    const teamId = req.query.teamId as string || req.body.teamId;
    if (!reason) {
      return res.status(400).json({ error: 'Freeze reason is required' });
    }
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }
    const account = bankService.freezeAccount(parseInt(req.params.id), reason, teamId);
    return res.json(account);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

// 13. Unfreeze account
app.put('/api/accounts/:id/unfreeze', (req: Request, res: Response) => {
  try {
    const teamId = req.query.teamId as string || req.body.teamId;
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }
    const account = bankService.unfreezeAccount(parseInt(req.params.id), teamId);
    return res.json(account);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

// 14. Get account statement
app.get('/api/accounts/:id/statement', (req: Request, res: Response) => {
  try {
    const { startDate, endDate, teamId } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }
    const statement = bankService.getAccountStatement(
      parseInt(req.params.id), 
      startDate as string, 
      endDate as string,
      teamId as string
    );
    return res.json(statement);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

// 15. Calculate and apply interest
app.post('/api/accounts/:id/interest', (req: Request<{ id: string }, {}, InterestRequest>, res: Response) => {
  try {
    const teamId = req.query.teamId as string || req.body.teamId;
    const result = bankService.calculateAndApplyInterest(parseInt(req.params.id), req.body, teamId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

// 16. Close account
app.delete('/api/accounts/:id', (req: Request, res: Response) => {
  try {
    const teamId = req.query.teamId as string;
    if (!teamId) {
      return res.status(400).json({ error: 'Team ID is required' });
    }
    const account = bankService.closeAccount(parseInt(req.params.id), teamId);
    return res.json({
      message: 'Account closed successfully',
      closedAccount: {
        id: account.id,
        accountNumber: account.accountNumber,
        accountHolder: account.accountHolder,
        finalBalance: account.balance,
        closedAt: account.closedAt
      }
    });
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🏦 Bank Backend Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/get`);
}); 