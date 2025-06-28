import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { Grid } from '@mui/material';
import {
  AccountBalance,
  Person,
  SwapHoriz,
  History,
  Add,
  Refresh,
  AccountBalanceWallet,
  TrendingUp,
  Block,
  LockOpen,
  Settings,
  Computer,
  Cloud
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface Account {
  id: number;
  teamId: string;
  accountNumber: string;
  accountHolder: string;
  balance: number;
  accountType: 'checking' | 'savings';
  status: 'active' | 'frozen' | 'closed';
  createdAt: string;
  frozenAt?: string;
  freezeReason?: string;
  unfrozenAt?: string;
  closedAt?: string;
}

interface Transaction {
  id: number;
  accountId: number;
  type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'interest';
  amount: number;
  description: string;
  timestamp: string;
  balanceAfter: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SERVER_OPTIONS = {
  localhost: 'http://localhost:3001',
  render: 'https://cursorworkshopserver.onrender.com'
};

const getStoredServer = (): 'localhost' | 'render' => {
  const stored = localStorage.getItem('selectedServer');
  return (stored === 'localhost' || stored === 'render') ? stored : 'render';
};

function App() {
  const [teamId, setTeamId] = useState('demo-team');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState('');
  const [selectedServer, setSelectedServer] = useState<'localhost' | 'render'>(getStoredServer());
  const [serverChangeCount, setServerChangeCount] = useState(0);

  const API_BASE = SERVER_OPTIONS[selectedServer];

  // Helper function to handle localhost connection errors
  const handleApiError = (err: unknown, defaultMessage: string): string => {
    if (selectedServer === 'localhost' && err instanceof TypeError && err.message.includes('fetch')) {
      return '🚫 No local server running. Go to your project terminal and run: npm run dev';
    }
    return err instanceof Error ? err.message : defaultMessage;
  };

  // Server change handler
  const handleServerChange = (server: 'localhost' | 'render') => {
    setSelectedServer(server);
    localStorage.setItem('selectedServer', server);
    setSuccess(`Switched to ${server === 'localhost' ? 'Local Development' : 'Render Production'} server`);
    
    // Force a refresh by incrementing the counter
    setServerChangeCount(prev => prev + 1);
    
    // Clear existing data immediately
    setAccounts([]);
    setTransactions([]);
    setError(null);
    
    // Refresh data from new server
    setTimeout(() => {
      fetchAccounts();
      fetchTransactions();
    }, 500);
  };

  // Form states
  const [newAccount, setNewAccount] = useState({
    accountHolder: '',
    initialBalance: '',
    accountType: 'checking' as 'checking' | 'savings'
  });
  const [transaction, setTransaction] = useState({
    accountId: '',
    type: 'deposit' as 'deposit' | 'withdrawal',
    amount: '',
    description: ''
  });
  const [transfer, setTransfer] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: '',
    description: ''
  });
  const [freezeData, setFreezeData] = useState({
    accountId: '',
    reason: ''
  });
  const [interest, setInterest] = useState({
    accountId: '',
    interestRate: '',
    period: 'monthly' as 'monthly' | 'quarterly' | 'yearly'
  });

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/accounts?teamId=${teamId}`);
      if (response.ok) {
        const data = await response.json();
        setAccounts(data);
      } else {
        throw new Error('Failed to fetch accounts');
      }
    } catch (err) {
      setError(handleApiError(err, 'Failed to fetch accounts'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/transactions?teamId=${teamId}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        throw new Error('Failed to fetch transactions');
      }
    } catch (err) {
      setError(handleApiError(err, 'Failed to fetch transactions'));
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          accountHolder: newAccount.accountHolder,
          initialBalance: newAccount.initialBalance ? parseFloat(newAccount.initialBalance) : 0,
          accountType: newAccount.accountType
        })
      });
      
      if (response.ok) {
        setSuccess('Account created successfully!');
        setNewAccount({ accountHolder: '', initialBalance: '', accountType: 'checking' });
        setOpenDialog('');
        fetchAccounts();
        fetchTransactions();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create account');
      }
    } catch (err) {
      setError(handleApiError(err, 'Failed to create account'));
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/accounts/${transaction.accountId}/transactions?teamId=${teamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: transaction.type,
          amount: parseFloat(transaction.amount),
          description: transaction.description
        })
      });
      
      if (response.ok) {
        setSuccess(`${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} completed successfully!`);
        setTransaction({ accountId: '', type: 'deposit', amount: '', description: '' });
        setOpenDialog('');
        fetchAccounts();
        fetchTransactions();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create transaction');
      }
    } catch (err) {
      setError(handleApiError(err, 'Failed to create transaction'));
    } finally {
      setLoading(false);
    }
  };

  const transferFunds = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/transfer?teamId=${teamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromAccountId: parseInt(transfer.fromAccountId),
          toAccountId: parseInt(transfer.toAccountId),
          amount: parseFloat(transfer.amount),
          description: transfer.description
        })
      });
      
      if (response.ok) {
        setSuccess('Transfer completed successfully!');
        setTransfer({ fromAccountId: '', toAccountId: '', amount: '', description: '' });
        setOpenDialog('');
        fetchAccounts();
        fetchTransactions();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to transfer funds');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer funds');
    } finally {
      setLoading(false);
    }
  };

  const freezeAccount = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/accounts/${freezeData.accountId}/freeze?teamId=${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: freezeData.reason })
      });
      
      if (response.ok) {
        setSuccess('Account frozen successfully!');
        setFreezeData({ accountId: '', reason: '' });
        setOpenDialog('');
        fetchAccounts();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to freeze account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to freeze account');
    } finally {
      setLoading(false);
    }
  };

  const unfreezeAccount = async (accountId: number) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/accounts/${accountId}/unfreeze?teamId=${teamId}`, {
        method: 'PUT'
      });
      
      if (response.ok) {
        setSuccess('Account unfrozen successfully!');
        fetchAccounts();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to unfreeze account');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unfreeze account');
    } finally {
      setLoading(false);
    }
  };

  const applyInterest = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/accounts/${interest.accountId}/interest?teamId=${teamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interestRate: parseFloat(interest.interestRate) / 100,
          period: interest.period
        })
      });
      
      if (response.ok) {
        setSuccess('Interest applied successfully!');
        setInterest({ accountId: '', interestRate: '', period: 'monthly' });
        setOpenDialog('');
        fetchAccounts();
        fetchTransactions();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to apply interest');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply interest');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, [teamId]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '$0.00';
    }
    return `$${amount.toFixed(2)}`;
  };
  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();

  // Auto-refresh data when server changes or when switching to relevant tabs
  useEffect(() => {
    if (activeTab === 0 || activeTab === 1 || activeTab === 2) { // Accounts, Transactions, or Operations tabs
      fetchAccounts();
      fetchTransactions();
    }
  }, [serverChangeCount, activeTab]); // Trigger when server changes or tab changes

  const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
      case 'active': return 'success';
      case 'frozen': return 'warning';
      case 'closed': return 'error';
      default: return 'default';
    }
  };

  const getTransactionColor = (type: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (type) {
      case 'deposit':
      case 'transfer_in':
      case 'interest': return 'success';
      case 'withdrawal':
      case 'transfer_out': return 'error';
      default: return 'default';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <AccountBalance sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Banking System Test Interface
          </Typography>
          <TextField
            label="Team ID"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            size="small"
            sx={{ bgcolor: 'white', borderRadius: 1, mr: 2 }}
          />
          <Tooltip title="Refresh Data">
            <IconButton color="inherit" onClick={() => { fetchAccounts(); fetchTransactions(); }}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => {
              setActiveTab(newValue);
              // Immediately refresh data when switching to data tabs
              if (newValue === 0 || newValue === 1 || newValue === 2) {
                fetchAccounts();
                fetchTransactions();
              }
            }}
          >
            <Tab icon={<AccountBalanceWallet />} label="Accounts" />
            <Tab icon={<History />} label="Transactions" />
            <Tab icon={<SwapHoriz />} label="Operations" />
            <Tab icon={<Settings />} label="Settings" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Team Accounts ({teamId})</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog('createAccount')}
            >
              Create Account
            </Button>
          </Box>

          <Grid container spacing={3}>
            {accounts.map((account) => (
              <Grid item xs={12} md={6} lg={4} key={account.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        {account.accountHolder}
                      </Typography>
                      <Chip 
                        label={account.status} 
                        color={getStatusColor(account.status)}
                        size="small"
                      />
                    </Box>
                    <Typography color="text.secondary" gutterBottom>
                      #{account.accountNumber}
                    </Typography>
                    <Typography variant="h4" color="primary" gutterBottom>
                      {formatCurrency(account.balance)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Created: {formatDate(account.createdAt)}
                    </Typography>
                    {account.status === 'frozen' && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="warning.main">
                          Frozen: {account.freezeReason}
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<LockOpen />}
                          onClick={() => unfreezeAccount(account.id)}
                          sx={{ ml: 1 }}
                        >
                          Unfreeze
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="h5" gutterBottom>Recent Transactions</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Account</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Balance After</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => {
                  const account = accounts.find(acc => acc.id === transaction.accountId);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                      <TableCell>
                        {account ? `${account.accountHolder} (${account.accountNumber})` : `Account ${transaction.accountId}`}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={transaction.type.replace('_', ' ')} 
                          color={getTransactionColor(transaction.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell align="right">
                        <Typography color={getTransactionColor(transaction.type) === 'success' ? 'success.main' : 'error.main'}>
                          {getTransactionColor(transaction.type) === 'success' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{formatCurrency(transaction.balanceAfter)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography variant="h5" gutterBottom>Banking Operations</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Account Operations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setOpenDialog('createAccount')}
                  >
                    Create New Account
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Block />}
                    onClick={() => setOpenDialog('freezeAccount')}
                    color="warning"
                  >
                    Freeze Account
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <SwapHoriz sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Transaction Operations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<AccountBalanceWallet />}
                    onClick={() => setOpenDialog('transaction')}
                  >
                    Deposit / Withdraw
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SwapHoriz />}
                    onClick={() => setOpenDialog('transfer')}
                  >
                    Transfer Funds
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    onClick={() => setOpenDialog('interest')}
                    color="success"
                  >
                    Apply Interest
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Typography variant="h5" gutterBottom>Server Settings</Typography>
          <Paper sx={{ p: 4, maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>
              <Settings sx={{ mr: 1, verticalAlign: 'middle' }} />
              API Server Configuration
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Choose which server to connect to for API requests. Students can use this to test their local backend development against the deployed frontend.
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Server: <strong>{selectedServer === 'localhost' ? 'Local Development' : 'Render Production'}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                API Endpoint: <code>{API_BASE}</code>
              </Typography>
            </Box>

            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant={selectedServer === 'localhost' ? 'contained' : 'outlined'}
                size="large"
                startIcon={<Computer />}
                onClick={() => handleServerChange('localhost')}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="button" display="block">
                    Local Development Server
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    http://localhost:8080 - For backend development
                  </Typography>
                </Box>
              </Button>

              <Button
                variant={selectedServer === 'render' ? 'contained' : 'outlined'}
                size="large"
                startIcon={<Cloud />}
                onClick={() => handleServerChange('render')}
                sx={{ justifyContent: 'flex-start', p: 2 }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="button" display="block">
                    Render Production Server
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    https://cursorworkshopserver.onrender.com - Deployed backend
                  </Typography>
                </Box>
              </Button>
            </Box>

            <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
              <Typography variant="body2" color="info.contrastText">
                <strong>For Students:</strong> Set this to "Local Development Server" to test your local backend code. 
                Make sure your server is running on port 8080.
              </Typography>
            </Box>
          </Paper>
        </TabPanel>
      </Container>

      {/* Create Account Dialog */}
      <Dialog open={openDialog === 'createAccount'} onClose={() => setOpenDialog('')} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Account</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Account Holder Name"
              value={newAccount.accountHolder}
              onChange={(e) => setNewAccount({ ...newAccount, accountHolder: e.target.value })}
              fullWidth
            />
            <TextField
              label="Initial Balance"
              type="number"
              value={newAccount.initialBalance}
              onChange={(e) => setNewAccount({ ...newAccount, initialBalance: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={newAccount.accountType}
                onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value as 'checking' | 'savings' })}
              >
                <MenuItem value="checking">Checking</MenuItem>
                <MenuItem value="savings">Savings</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog('')}>Cancel</Button>
          <Button onClick={createAccount} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog open={openDialog === 'transaction'} onClose={() => setOpenDialog('')} maxWidth="sm" fullWidth>
        <DialogTitle>Deposit / Withdrawal</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Account</InputLabel>
              <Select
                value={transaction.accountId}
                onChange={(e) => setTransaction({ ...transaction, accountId: e.target.value })}
              >
                {accounts.filter(acc => acc.status === 'active').map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountHolder} - {account.accountNumber} ({formatCurrency(account.balance)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={transaction.type}
                onChange={(e) => setTransaction({ ...transaction, type: e.target.value as 'deposit' | 'withdrawal' })}
              >
                <MenuItem value="deposit">Deposit</MenuItem>
                <MenuItem value="withdrawal">Withdrawal</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Amount"
              type="number"
              value={transaction.amount}
              onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={transaction.description}
              onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog('')}>Cancel</Button>
          <Button onClick={createTransaction} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={openDialog === 'transfer'} onClose={() => setOpenDialog('')} maxWidth="sm" fullWidth>
        <DialogTitle>Transfer Funds</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>From Account</InputLabel>
              <Select
                value={transfer.fromAccountId}
                onChange={(e) => setTransfer({ ...transfer, fromAccountId: e.target.value })}
              >
                {accounts.filter(acc => acc.status === 'active').map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountHolder} - {account.accountNumber} ({formatCurrency(account.balance)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>To Account</InputLabel>
              <Select
                value={transfer.toAccountId}
                onChange={(e) => setTransfer({ ...transfer, toAccountId: e.target.value })}
              >
                {accounts.filter(acc => acc.status === 'active' && acc.id.toString() !== transfer.fromAccountId).map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountHolder} - {account.accountNumber} ({formatCurrency(account.balance)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Amount"
              type="number"
              value={transfer.amount}
              onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={transfer.description}
              onChange={(e) => setTransfer({ ...transfer, description: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog('')}>Cancel</Button>
          <Button onClick={transferFunds} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Transfer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Freeze Account Dialog */}
      <Dialog open={openDialog === 'freezeAccount'} onClose={() => setOpenDialog('')} maxWidth="sm" fullWidth>
        <DialogTitle>Freeze Account</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Account</InputLabel>
              <Select
                value={freezeData.accountId}
                onChange={(e) => setFreezeData({ ...freezeData, accountId: e.target.value })}
              >
                {accounts.filter(acc => acc.status === 'active').map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountHolder} - {account.accountNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Reason for Freezing"
              value={freezeData.reason}
              onChange={(e) => setFreezeData({ ...freezeData, reason: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog('')}>Cancel</Button>
          <Button onClick={freezeAccount} variant="contained" color="warning" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Freeze Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Interest Dialog */}
      <Dialog open={openDialog === 'interest'} onClose={() => setOpenDialog('')} maxWidth="sm" fullWidth>
        <DialogTitle>Apply Interest</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Savings Account</InputLabel>
              <Select
                value={interest.accountId}
                onChange={(e) => setInterest({ ...interest, accountId: e.target.value })}
              >
                {accounts.filter(acc => acc.status === 'active' && acc.accountType === 'savings').map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountHolder} - {account.accountNumber} ({formatCurrency(account.balance)})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Interest Rate (%)"
              type="number"
              value={interest.interestRate}
              onChange={(e) => setInterest({ ...interest, interestRate: e.target.value })}
              fullWidth
              helperText="Annual percentage rate (e.g., 2.5 for 2.5%)"
            />
            <FormControl fullWidth>
              <InputLabel>Period</InputLabel>
              <Select
                value={interest.period}
                onChange={(e) => setInterest({ ...interest, period: e.target.value as 'monthly' | 'quarterly' | 'yearly' })}
              >
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="quarterly">Quarterly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog('')}>Cancel</Button>
          <Button onClick={applyInterest} variant="contained" color="success" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Apply Interest'}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}

export default App;
