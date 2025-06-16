import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { AccountBalance, Add, SwapHoriz, History } from '@mui/icons-material';
import axios from 'axios';

// Types
interface Account {
  id: number;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  accountType: 'checking' | 'savings';
}

interface Transaction {
  id: number;
  accountId: number;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out';
  amount: number;
  description: string;
  timestamp: string;
}

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [openNewAccount, setOpenNewAccount] = useState(false);
  const [openTransaction, setOpenTransaction] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [newAccountForm, setNewAccountForm] = useState({
    accountHolder: '',
    initialBalance: 0,
    accountType: 'checking' as 'checking' | 'savings'
  });

  const [transactionForm, setTransactionForm] = useState({
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: 0,
    description: ''
  });

  const [transferForm, setTransferForm] = useState({
    fromAccountId: 0,
    toAccountId: 0,
    amount: 0,
    description: ''
  });

  // Fetch accounts
  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts`);
      setAccounts(response.data);
    } catch (err) {
      setError('Failed to fetch accounts');
      console.error(err);
    }
  };

  // Fetch transactions for selected account
  const fetchTransactions = async (accountId: number) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/accounts/${accountId}/transactions`);
      setTransactions(response.data);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error(err);
    }
  };

  // Create new account
  const createAccount = async () => {
    try {
      await axios.post(`${API_BASE_URL}/accounts`, newAccountForm);
      setSuccess('Account created successfully!');
      setOpenNewAccount(false);
      setNewAccountForm({ accountHolder: '', initialBalance: 0, accountType: 'checking' });
      fetchAccounts();
    } catch (err) {
      setError('Failed to create account');
      console.error(err);
    }
  };

  // Create transaction
  const createTransaction = async () => {
    if (!selectedAccount) return;
    
    try {
      await axios.post(`${API_BASE_URL}/accounts/${selectedAccount.id}/transactions`, transactionForm);
      setSuccess('Transaction completed successfully!');
      setOpenTransaction(false);
      setTransactionForm({ type: 'deposit', amount: 0, description: '' });
      fetchAccounts();
      fetchTransactions(selectedAccount.id);
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to create transaction');
      console.error(err);
    }
  };

  // Transfer funds
  const transferFunds = async () => {
    try {
      await axios.post(`${API_BASE_URL}/transfer`, transferForm);
      setSuccess('Transfer completed successfully!');
      setOpenTransfer(false);
      setTransferForm({ fromAccountId: 0, toAccountId: 0, amount: 0, description: '' });
      fetchAccounts();
      if (selectedAccount) {
        fetchTransactions(selectedAccount.id);
      }
    } catch (err) {
      const error = err as { response?: { data?: { error?: string } } };
      setError(error.response?.data?.error || 'Failed to transfer funds');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAccounts().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchTransactions(selectedAccount.id);
    }
  }, [selectedAccount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" sx={{ mt: 4, textAlign: 'center' }}>
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <AccountBalance sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Bank Management System
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Accounts Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5">Accounts</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setOpenNewAccount(true)}
                >
                  New Account
                </Button>
              </Box>
              
              <Grid container spacing={2}>
                {accounts.map((account) => (
                  <Grid item xs={12} key={account.id}>
                    <Card 
                      sx={{ 
                        cursor: 'pointer',
                        border: selectedAccount?.id === account.id ? '2px solid #1976d2' : 'none'
                      }}
                      onClick={() => setSelectedAccount(account)}
                    >
                      <CardContent>
                        <Typography variant="h6">{account.accountHolder}</Typography>
                        <Typography color="text.secondary">
                          {account.accountNumber} ({account.accountType})
                        </Typography>
                        <Typography variant="h5" color="primary">
                          {formatCurrency(account.balance)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>

          {/* Actions Section */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h5" mb={2}>Actions</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setOpenTransaction(true)}
                    disabled={!selectedAccount}
                  >
                    Deposit/Withdraw
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<SwapHoriz />}
                    onClick={() => setOpenTransfer(true)}
                    disabled={accounts.length < 2}
                  >
                    Transfer Funds
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Transactions Section */}
          {selectedAccount && (
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <History sx={{ mr: 1 }} />
                  <Typography variant="h5">
                    Transactions - {selectedAccount.accountHolder}
                  </Typography>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Description</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                          <TableCell>
                            <Typography
                              color={
                                transaction.type === 'deposit' || transaction.type === 'transfer_in'
                                  ? 'success.main'
                                  : 'error.main'
                              }
                            >
                              {transaction.type.replace('_', ' ').toUpperCase()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              color={
                                transaction.type === 'deposit' || transaction.type === 'transfer_in'
                                  ? 'success.main'
                                  : 'error.main'
                              }
                            >
                              {formatCurrency(transaction.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* New Account Dialog */}
      <Dialog open={openNewAccount} onClose={() => setOpenNewAccount(false)}>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Account Holder Name"
            fullWidth
            variant="outlined"
            value={newAccountForm.accountHolder}
            onChange={(e) => setNewAccountForm({ ...newAccountForm, accountHolder: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Initial Balance"
            type="number"
            fullWidth
            variant="outlined"
            value={newAccountForm.initialBalance}
            onChange={(e) => setNewAccountForm({ ...newAccountForm, initialBalance: Number(e.target.value) })}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Account Type</InputLabel>
            <Select
              value={newAccountForm.accountType}
              label="Account Type"
              onChange={(e) => setNewAccountForm({ ...newAccountForm, accountType: e.target.value as 'checking' | 'savings' })}
            >
              <MenuItem value="checking">Checking</MenuItem>
              <MenuItem value="savings">Savings</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewAccount(false)}>Cancel</Button>
          <Button onClick={createAccount} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog open={openTransaction} onClose={() => setOpenTransaction(false)}>
        <DialogTitle>New Transaction</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Transaction Type</InputLabel>
            <Select
              value={transactionForm.type}
              label="Transaction Type"
              onChange={(e) => setTransactionForm({ ...transactionForm, type: e.target.value as 'deposit' | 'withdrawal' })}
            >
              <MenuItem value="deposit">Deposit</MenuItem>
              <MenuItem value="withdrawal">Withdrawal</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={transactionForm.amount}
            onChange={(e) => setTransactionForm({ ...transactionForm, amount: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            value={transactionForm.description}
            onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransaction(false)}>Cancel</Button>
          <Button onClick={createTransaction} variant="contained">
            {transactionForm.type === 'deposit' ? 'Deposit' : 'Withdraw'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={openTransfer} onClose={() => setOpenTransfer(false)}>
        <DialogTitle>Transfer Funds</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>From Account</InputLabel>
            <Select
              value={transferForm.fromAccountId}
              label="From Account"
              onChange={(e) => setTransferForm({ ...transferForm, fromAccountId: Number(e.target.value) })}
            >
              {accounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.accountHolder} - {account.accountNumber} ({formatCurrency(account.balance)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>To Account</InputLabel>
            <Select
              value={transferForm.toAccountId}
              label="To Account"
              onChange={(e) => setTransferForm({ ...transferForm, toAccountId: Number(e.target.value) })}
            >
              {accounts.filter(acc => acc.id !== transferForm.fromAccountId).map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.accountHolder} - {account.accountNumber}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={transferForm.amount}
            onChange={(e) => setTransferForm({ ...transferForm, amount: Number(e.target.value) })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            value={transferForm.description}
            onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTransfer(false)}>Cancel</Button>
          <Button onClick={transferFunds} variant="contained">Transfer</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
