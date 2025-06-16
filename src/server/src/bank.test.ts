import { BankService } from './bank';
import type { Account, Transaction, CreateAccountRequest, CreateTransactionRequest, TransferRequest, InterestRequest } from './bank';

describe('BankService', () => {
  let bankService: BankService;

  beforeEach(() => {
    // Create a fresh instance for each test to avoid state pollution
    bankService = new BankService();
    // Clear sample data for clean tests
    (bankService as any).accounts = [];
    (bankService as any).transactions = [];
    (bankService as any).nextAccountId = 1;
    (bankService as any).nextTransactionId = 1;
  });

  describe('Account Creation', () => {
    it('should create an account with zero initial balance', () => {
      const request: CreateAccountRequest = {
        teamId: 'test-team',
        accountHolder: 'John Doe',
        accountType: 'checking'
      };

      const account = bankService.createAccount(request);

      expect(account).toMatchObject({
        id: 1,
        teamId: 'test-team',
        accountHolder: 'John Doe',
        balance: 0,
        accountType: 'checking',
        status: 'active'
      });
      expect(account.accountNumber).toMatch(/^\d{10}$/);
      expect(account.createdAt).toBeDefined();
    });

    it('should create an account with initial balance and transaction', () => {
      const request: CreateAccountRequest = {
        teamId: 'test-team',
        accountHolder: 'John Doe',
        initialBalance: 1000,
        accountType: 'savings'
      };

      const account = bankService.createAccount(request);

      expect(account.balance).toBe(1000);
      
      // Check that initial deposit transaction was created
      const transactions = bankService.getAccountTransactions(account.id);
      expect(transactions).toHaveLength(1);
      expect(transactions[0]).toMatchObject({
        type: 'deposit',
        amount: 1000,
        description: 'Initial deposit',
        balanceAfter: 1000
      });
    });

    it('should throw error for missing teamId', () => {
      const request: CreateAccountRequest = {
        teamId: '',
        accountHolder: 'John Doe'
      };

      expect(() => bankService.createAccount(request)).toThrow('Team ID is required');
    });

    it('should throw error for missing account holder name', () => {
      const request: CreateAccountRequest = {
        teamId: 'test-team',
        accountHolder: ''
      };

      expect(() => bankService.createAccount(request)).toThrow('Account holder name is required');
    });

    it('should default to checking account type', () => {
      const request: CreateAccountRequest = {
        teamId: 'test-team',
        accountHolder: 'John Doe'
      };

      const account = bankService.createAccount(request);
      expect(account.accountType).toBe('checking');
    });

    it('should trim whitespace from inputs', () => {
      const request: CreateAccountRequest = {
        teamId: '  test-team  ',
        accountHolder: '  John Doe  '
      };

      const account = bankService.createAccount(request);
      expect(account.teamId).toBe('test-team');
      expect(account.accountHolder).toBe('John Doe');
    });
  });

  describe('Account Retrieval', () => {
    beforeEach(() => {
      // Create test accounts
      bankService.createAccount({
        teamId: 'team-a',
        accountHolder: 'Alice',
        initialBalance: 1000
      });
      bankService.createAccount({
        teamId: 'team-b',
        accountHolder: 'Bob',
        initialBalance: 2000
      });
      bankService.createAccount({
        teamId: 'team-a',
        accountHolder: 'Charlie',
        initialBalance: 500
      });
    });

    it('should get all accounts without team filter', () => {
      const accounts = bankService.getAllAccounts();
      expect(accounts).toHaveLength(3);
    });

    it('should get accounts filtered by team', () => {
      const teamAAccounts = bankService.getAllAccounts('team-a');
      expect(teamAAccounts).toHaveLength(2);
      expect(teamAAccounts.every(acc => acc.teamId === 'team-a')).toBe(true);

      const teamBAccounts = bankService.getAllAccounts('team-b');
      expect(teamBAccounts).toHaveLength(1);
      expect(teamBAccounts[0].teamId).toBe('team-b');
    });

    it('should get account by ID', () => {
      const account = bankService.getAccountById(1);
      expect(account).toBeTruthy();
      expect(account!.accountHolder).toBe('Alice');
    });

    it('should get account by ID with team filter', () => {
      const account = bankService.getAccountById(1, 'team-a');
      expect(account).toBeTruthy();

      const accountWrongTeam = bankService.getAccountById(1, 'team-b');
      expect(accountWrongTeam).toBeNull();
    });

    it('should return null for non-existent account', () => {
      const account = bankService.getAccountById(999);
      expect(account).toBeNull();
    });

    it('should get accounts by team', () => {
      const teamAccounts = bankService.getAccountsByTeam('team-a');
      expect(teamAccounts).toHaveLength(2);
      expect(teamAccounts.every(acc => acc.teamId === 'team-a')).toBe(true);
    });
  });

  describe('Account Updates', () => {
    let accountId: number;

    beforeEach(() => {
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'John Doe',
        accountType: 'checking'
      });
      accountId = account.id;
    });

    it('should update account holder name', () => {
      const updated = bankService.updateAccount(accountId, {
        accountHolder: 'Jane Doe'
      }, 'test-team');

      expect(updated.accountHolder).toBe('Jane Doe');
    });

    it('should update account type', () => {
      const updated = bankService.updateAccount(accountId, {
        accountType: 'savings'
      }, 'test-team');

      expect(updated.accountType).toBe('savings');
    });

    it('should throw error for non-existent account', () => {
      expect(() => {
        bankService.updateAccount(999, { accountHolder: 'Jane' }, 'test-team');
      }).toThrow('Account not found');
    });

    it('should throw error for frozen account', () => {
      bankService.freezeAccount(accountId, 'Test freeze', 'test-team');

      expect(() => {
        bankService.updateAccount(accountId, { accountHolder: 'Jane' }, 'test-team');
      }).toThrow('Cannot update frozen account');
    });
  });

  describe('Account Status Management', () => {
    let accountId: number;

    beforeEach(() => {
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'John Doe',
        initialBalance: 1000
      });
      accountId = account.id;
    });

    describe('Freeze Account', () => {
      it('should freeze an active account', () => {
        const frozen = bankService.freezeAccount(accountId, 'Suspicious activity', 'test-team');

        expect(frozen.status).toBe('frozen');
        expect(frozen.freezeReason).toBe('Suspicious activity');
        expect(frozen.frozenAt).toBeDefined();
      });

      it('should throw error when freezing already frozen account', () => {
        bankService.freezeAccount(accountId, 'First freeze', 'test-team');

        expect(() => {
          bankService.freezeAccount(accountId, 'Second freeze', 'test-team');
        }).toThrow('Account is already frozen');
      });

      it('should throw error for non-existent account', () => {
        expect(() => {
          bankService.freezeAccount(999, 'Test', 'test-team');
        }).toThrow('Account not found');
      });
    });

    describe('Unfreeze Account', () => {
      beforeEach(() => {
        bankService.freezeAccount(accountId, 'Test freeze', 'test-team');
      });

      it('should unfreeze a frozen account', () => {
        const unfrozen = bankService.unfreezeAccount(accountId, 'test-team');

        expect(unfrozen.status).toBe('active');
        expect(unfrozen.unfrozenAt).toBeDefined();
      });

      it('should throw error when unfreezing non-frozen account', () => {
        bankService.unfreezeAccount(accountId, 'test-team');

        expect(() => {
          bankService.unfreezeAccount(accountId, 'test-team');
        }).toThrow('Account is not frozen');
      });
    });

    describe('Close Account', () => {
      it('should close account with zero balance', () => {
        // Create account with zero balance
        const zeroAccount = bankService.createAccount({
          teamId: 'test-team',
          accountHolder: 'Zero Balance'
        });

        const closed = bankService.closeAccount(zeroAccount.id, 'test-team');

        expect(closed.status).toBe('closed');
        expect(closed.closedAt).toBeDefined();
      });

      it('should throw error when closing account with non-zero balance', () => {
        expect(() => {
          bankService.closeAccount(accountId, 'test-team');
        }).toThrow('Cannot close account with non-zero balance');
      });
    });
  });

  describe('Transactions', () => {
    let accountId: number;

    beforeEach(() => {
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'John Doe',
        initialBalance: 1000
      });
      accountId = account.id;
    });

    describe('Deposits', () => {
      it('should process a deposit', () => {
        const request: CreateTransactionRequest = {
          type: 'deposit',
          amount: 500,
          description: 'Salary'
        };

        const result = bankService.createTransaction(accountId, request, 'test-team');

        expect(result.newBalance).toBe(1500);
        expect(result.transaction).toMatchObject({
          type: 'deposit',
          amount: 500,
          description: 'Salary',
          balanceAfter: 1500
        });
      });

      it('should process deposit without description', () => {
        const request: CreateTransactionRequest = {
          type: 'deposit',
          amount: 200
        };

        const result = bankService.createTransaction(accountId, request, 'test-team');

        expect(result.transaction.description).toBe('');
        expect(result.newBalance).toBe(1200);
      });
    });

    describe('Withdrawals', () => {
      it('should process a withdrawal', () => {
        const request: CreateTransactionRequest = {
          type: 'withdrawal',
          amount: 300,
          description: 'ATM withdrawal'
        };

        const result = bankService.createTransaction(accountId, request, 'test-team');

        expect(result.newBalance).toBe(700);
        expect(result.transaction).toMatchObject({
          type: 'withdrawal',
          amount: 300,
          description: 'ATM withdrawal',
          balanceAfter: 700
        });
      });

      it('should throw error for insufficient funds', () => {
        const request: CreateTransactionRequest = {
          type: 'withdrawal',
          amount: 1500
        };

        expect(() => {
          bankService.createTransaction(accountId, request, 'test-team');
        }).toThrow('Insufficient funds');
      });
    });

    describe('Transaction Validation', () => {
      it('should throw error for invalid amount', () => {
        const request: CreateTransactionRequest = {
          type: 'deposit',
          amount: 0
        };

        expect(() => {
          bankService.createTransaction(accountId, request, 'test-team');
        }).toThrow('Valid type and amount are required');
      });

      it('should throw error for negative amount', () => {
        const request: CreateTransactionRequest = {
          type: 'deposit',
          amount: -100
        };

        expect(() => {
          bankService.createTransaction(accountId, request, 'test-team');
        }).toThrow('Valid type and amount are required');
      });

      it('should throw error for frozen account', () => {
        bankService.freezeAccount(accountId, 'Test', 'test-team');

        const request: CreateTransactionRequest = {
          type: 'deposit',
          amount: 100
        };

        expect(() => {
          bankService.createTransaction(accountId, request, 'test-team');
        }).toThrow('Cannot perform transactions on frozen account');
      });

      it('should throw error for closed account', () => {
        // First withdraw all money
        bankService.createTransaction(accountId, {
          type: 'withdrawal',
          amount: 1000
        }, 'test-team');
        
        // Close the account
        bankService.closeAccount(accountId, 'test-team');

        const request: CreateTransactionRequest = {
          type: 'deposit',
          amount: 100
        };

        // The account should not be found because getAccountById filters out closed accounts
        expect(() => {
          bankService.createTransaction(accountId, request, 'test-team');
        }).toThrow('Account not found');
      });

      it('should throw error for non-existent account', () => {
        const request: CreateTransactionRequest = {
          type: 'deposit',
          amount: 100
        };

        expect(() => {
          bankService.createTransaction(999, request, 'test-team');
        }).toThrow('Account not found');
      });
    });
  });

  describe('Transfers', () => {
    let fromAccountId: number;
    let toAccountId: number;

    beforeEach(() => {
      const fromAccount = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'Sender',
        initialBalance: 1000
      });
      fromAccountId = fromAccount.id;

      const toAccount = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'Receiver',
        initialBalance: 500
      });
      toAccountId = toAccount.id;
    });

    it('should transfer funds between accounts', () => {
      const request: TransferRequest = {
        fromAccountId,
        toAccountId,
        amount: 300,
        description: 'Rent payment'
      };

      const result = bankService.transferFunds(request, 'test-team');

      expect(result.fromAccount.newBalance).toBe(700);
      expect(result.toAccount.newBalance).toBe(800);
      expect(result.transactions).toHaveLength(2);
      expect(result.transactions[0].type).toBe('transfer_out');
      expect(result.transactions[1].type).toBe('transfer_in');
      expect(result.message).toBe('Transfer completed successfully');
    });

    it('should throw error for insufficient funds', () => {
      const request: TransferRequest = {
        fromAccountId,
        toAccountId,
        amount: 1500
      };

      expect(() => {
        bankService.transferFunds(request, 'test-team');
      }).toThrow('Insufficient funds');
    });

    it('should throw error for non-existent accounts', () => {
      const request: TransferRequest = {
        fromAccountId: 999,
        toAccountId,
        amount: 100
      };

      expect(() => {
        bankService.transferFunds(request, 'test-team');
      }).toThrow('One or both accounts not found');
    });

    it('should throw error for negative amount', () => {
      const request: TransferRequest = {
        fromAccountId,
        toAccountId,
        amount: -100
      };

      expect(() => {
        bankService.transferFunds(request, 'test-team');
      }).toThrow('Transfer amount must be positive');
    });

    it('should throw error for zero amount', () => {
      const request: TransferRequest = {
        fromAccountId,
        toAccountId,
        amount: 0
      };

      expect(() => {
        bankService.transferFunds(request, 'test-team');
      }).toThrow('Transfer amount must be positive');
    });

    it('should throw error for inactive accounts', () => {
      bankService.freezeAccount(fromAccountId, 'Test', 'test-team');

      const request: TransferRequest = {
        fromAccountId,
        toAccountId,
        amount: 100
      };

      expect(() => {
        bankService.transferFunds(request, 'test-team');
      }).toThrow('Both accounts must be active for transfers');
    });

    it('should throw error for cross-team transfers', () => {
      const otherTeamAccount = bankService.createAccount({
        teamId: 'other-team',
        accountHolder: 'Other',
        initialBalance: 100
      });

      const request: TransferRequest = {
        fromAccountId,
        toAccountId: otherTeamAccount.id,
        amount: 100
      };

      // getAccountById with teamId filter returns null for accounts not in that team
      expect(() => {
        bankService.transferFunds(request, 'test-team');
      }).toThrow('One or both accounts not found');
    });
  });

  describe('Interest Calculation', () => {
    let savingsAccountId: number;
    let checkingAccountId: number;

    beforeEach(() => {
      const savingsAccount = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'Saver',
        initialBalance: 10000,
        accountType: 'savings'
      });
      savingsAccountId = savingsAccount.id;

      const checkingAccount = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'Checker',
        initialBalance: 5000,
        accountType: 'checking'
      });
      checkingAccountId = checkingAccount.id;
    });

    it('should calculate and apply monthly interest', () => {
      const request: InterestRequest = {
        interestRate: 0.05, // 5% annual
        period: 'monthly'
      };

      const result = bankService.calculateAndApplyInterest(savingsAccountId, request, 'test-team');

      const expectedInterest = 10000 * 0.05 * (1/12); // Monthly interest
      expect(result.interest.amount).toBeCloseTo(expectedInterest, 2);
      expect(result.account.newBalance).toBeCloseTo(10000 + expectedInterest, 2);
      expect(result.interest.period).toBe('monthly');
    });

    it('should calculate and apply quarterly interest', () => {
      const request: InterestRequest = {
        interestRate: 0.04, // 4% annual
        period: 'quarterly'
      };

      const result = bankService.calculateAndApplyInterest(savingsAccountId, request, 'test-team');

      const expectedInterest = 10000 * 0.04 * 0.25; // Quarterly interest
      expect(result.interest.amount).toBeCloseTo(expectedInterest, 2);
      expect(result.account.newBalance).toBeCloseTo(10000 + expectedInterest, 2);
    });

    it('should calculate and apply yearly interest', () => {
      const request: InterestRequest = {
        interestRate: 0.03, // 3% annual
        period: 'yearly'
      };

      const result = bankService.calculateAndApplyInterest(savingsAccountId, request, 'test-team');

      const expectedInterest = 10000 * 0.03; // Yearly interest
      expect(result.interest.amount).toBeCloseTo(expectedInterest, 2);
      expect(result.account.newBalance).toBeCloseTo(10000 + expectedInterest, 2);
    });

    it('should create interest transaction', () => {
      const request: InterestRequest = {
        interestRate: 0.05,
        period: 'monthly'
      };

      const result = bankService.calculateAndApplyInterest(savingsAccountId, request, 'test-team');

      expect(result.transaction.type).toBe('interest');
      expect(result.transaction.description).toContain('Monthly interest');
      expect(result.transaction.description).toContain('5.0% APR');
    });

    it('should throw error for checking account', () => {
      const request: InterestRequest = {
        interestRate: 0.05,
        period: 'monthly'
      };

      expect(() => {
        bankService.calculateAndApplyInterest(checkingAccountId, request, 'test-team');
      }).toThrow('Interest can only be applied to savings accounts');
    });

    it('should throw error for inactive account', () => {
      bankService.freezeAccount(savingsAccountId, 'Test', 'test-team');

      const request: InterestRequest = {
        interestRate: 0.05,
        period: 'monthly'
      };

      expect(() => {
        bankService.calculateAndApplyInterest(savingsAccountId, request, 'test-team');
      }).toThrow('Interest can only be applied to active accounts');
    });

    it('should throw error for non-existent account', () => {
      const request: InterestRequest = {
        interestRate: 0.05,
        period: 'monthly'
      };

      expect(() => {
        bankService.calculateAndApplyInterest(999, request, 'test-team');
      }).toThrow('Account not found');
    });
  });

  describe('Transaction History', () => {
    let accountId: number;

    beforeEach(() => {
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'John Doe',
        initialBalance: 1000
      });
      accountId = account.id;

      // Add some transactions
      bankService.createTransaction(accountId, { type: 'deposit', amount: 500 }, 'test-team');
      bankService.createTransaction(accountId, { type: 'withdrawal', amount: 200 }, 'test-team');
    });

    it('should get all transactions for an account', () => {
      const transactions = bankService.getAccountTransactions(accountId);
      expect(transactions).toHaveLength(3); // Initial + 2 new transactions
    });

    it('should get transactions sorted by timestamp (newest first)', () => {
      const transactions = bankService.getAccountTransactions(accountId);
      
      for (let i = 0; i < transactions.length - 1; i++) {
        const current = new Date(transactions[i].timestamp);
        const next = new Date(transactions[i + 1].timestamp);
        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });

    it('should get all transactions with team filter', () => {
      const teamTransactions = bankService.getAllTransactions('test-team');
      expect(teamTransactions).toHaveLength(3);
    });

    it('should throw error when getting transactions for account not in team', () => {
      expect(() => {
        bankService.getAccountTransactions(accountId, 'wrong-team');
      }).toThrow('Account not found or does not belong to team');
    });

    it('should get transaction by ID', () => {
      const transactions = bankService.getAccountTransactions(accountId);
      const firstTransaction = transactions[0];
      
      const retrieved = bankService.getTransactionById(firstTransaction.id);
      expect(retrieved).toEqual(firstTransaction);
    });

    it('should return null for non-existent transaction', () => {
      const transaction = bankService.getTransactionById(999);
      expect(transaction).toBeNull();
    });
  });

  describe('Account Statements', () => {
    let accountId: number;

    beforeEach(() => {
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'John Doe',
        initialBalance: 1000
      });
      accountId = account.id;

      // Add transactions with specific dates
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      // Mock transaction timestamps for testing
      const transactions = bankService.getAllTransactions();
      if (transactions.length > 0) {
        transactions[0].timestamp = threeDaysAgo.toISOString();
      }

      bankService.createTransaction(accountId, { 
        type: 'deposit', 
        amount: 500,
        description: 'Salary'
      }, 'test-team');
      
      const newTransactions = bankService.getAllTransactions();
      if (newTransactions.length > 1) {
        newTransactions[0].timestamp = oneDayAgo.toISOString();
      }
    });

    it('should generate account statement for date range', () => {
      const startDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const statement = bankService.getAccountStatement(accountId, startDate, endDate, 'test-team');

      expect(statement.account.accountHolder).toBe('John Doe');
      expect(statement.period.startDate).toBe(startDate);
      expect(statement.period.endDate).toBe(endDate);
      expect(statement.summary.closingBalance).toBe(1500); // 1000 + 500
      expect(statement.transactions.length).toBeGreaterThan(0);
    });

    it('should throw error for invalid date range', () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

      expect(() => {
        bankService.getAccountStatement(accountId, startDate, endDate, 'test-team');
      }).toThrow('Start date must be before end date');
    });

    it('should throw error for non-existent account', () => {
      const startDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      expect(() => {
        bankService.getAccountStatement(999, startDate, endDate, 'test-team');
      }).toThrow('Account not found');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle concurrent transactions safely', () => {
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'John Doe',
        initialBalance: 1000
      });

      // Simulate concurrent transactions
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          Promise.resolve(bankService.createTransaction(account.id, {
            type: 'deposit',
            amount: 10
          }, 'test-team'))
        );
      }

      return Promise.all(promises).then(() => {
        const finalAccount = bankService.getAccountById(account.id);
        expect(finalAccount!.balance).toBe(1100); // 1000 + (10 * 10)
      });
    });

    it('should handle floating point precision correctly', () => {
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'John Doe',
        initialBalance: 100.01
      });

      bankService.createTransaction(account.id, {
        type: 'deposit',
        amount: 0.99
      }, 'test-team');

      const updatedAccount = bankService.getAccountById(account.id);
      expect(updatedAccount!.balance).toBeCloseTo(101.00, 2);
    });

    it('should maintain data consistency after errors', () => {
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'John Doe',
        initialBalance: 100
      });

      const initialBalance = account.balance;
      const initialTransactionCount = bankService.getAllTransactions().length;

      // Try an invalid transaction
      try {
        bankService.createTransaction(account.id, {
          type: 'withdrawal',
          amount: 200 // More than available
        }, 'test-team');
      } catch (error) {
        // Expected error
      }

      // Verify data hasn't changed
      const unchangedAccount = bankService.getAccountById(account.id);
      expect(unchangedAccount!.balance).toBe(initialBalance);
      expect(bankService.getAllTransactions().length).toBe(initialTransactionCount);
    });

    it('should handle account number generation uniqueness', () => {
      const accounts = [];
      for (let i = 0; i < 10; i++) {
        accounts.push(bankService.createAccount({
          teamId: 'test-team',
          accountHolder: `User ${i}`
        }));
      }

      const accountNumbers = accounts.map(acc => acc.accountNumber);
      const uniqueNumbers = new Set(accountNumbers);
      expect(uniqueNumbers.size).toBe(accounts.length);
    });

    it('should handle zero balance account creation correctly', () => {
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'Zero User',
        initialBalance: 0
      });

      expect(account.balance).toBe(0);
      
      // Should not create any transactions for zero balance
      const transactions = bankService.getAccountTransactions(account.id);
      expect(transactions).toHaveLength(0);
    });

    it('should prevent balance from going negative in transfers', () => {
      const sender = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'Sender',
        initialBalance: 100
      });

      const receiver = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'Receiver',
        initialBalance: 0
      });

      expect(() => {
        bankService.transferFunds({
          fromAccountId: sender.id,
          toAccountId: receiver.id,
          amount: 150 // More than sender's balance
        }, 'test-team');
      }).toThrow('Insufficient funds');

      // Verify balances unchanged
      expect(bankService.getAccountById(sender.id)!.balance).toBe(100);
      expect(bankService.getAccountById(receiver.id)!.balance).toBe(0);
    });
  });

  describe('Bug Regression Tests', () => {
    it('should not double-add initial balance (Bug Fix)', () => {
      // This test specifically checks for the bug that was fixed where
      // initial balance was being set AND added via createTransaction
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'Test User',
        initialBalance: 1000
      });

      // The balance should be exactly 1000, not 2000
      expect(account.balance).toBe(1000);

      // Verify this with a fresh lookup
      const retrieved = bankService.getAccountById(account.id);
      expect(retrieved!.balance).toBe(1000);

      // Check that exactly one transaction was created
      const transactions = bankService.getAccountTransactions(account.id);
      expect(transactions).toHaveLength(1);
      expect(transactions[0].balanceAfter).toBe(1000);
    });

    it('should handle multiple sequential deposits correctly', () => {
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'Test User',
        initialBalance: 100
      });

      // Add multiple deposits
      bankService.createTransaction(account.id, { type: 'deposit', amount: 50 }, 'test-team');
      bankService.createTransaction(account.id, { type: 'deposit', amount: 25 }, 'test-team');
      bankService.createTransaction(account.id, { type: 'deposit', amount: 75 }, 'test-team');

      const finalAccount = bankService.getAccountById(account.id);
      expect(finalAccount!.balance).toBe(250); // 100 + 50 + 25 + 75

      const transactions = bankService.getAccountTransactions(account.id);
      expect(transactions).toHaveLength(4); // Initial + 3 deposits
    });
  });

  describe('Coverage Gap Tests', () => {
    it('should get transactions without team filter', () => {
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'Test User',
        initialBalance: 100
      });

      // Get transactions without specifying team (covers line in getAccountTransactions)
      const transactions = bankService.getAccountTransactions(account.id);
      expect(transactions).toHaveLength(1);
    });

    it('should handle transfer without team validation', () => {
      const sender = bankService.createAccount({
        teamId: 'team-a',
        accountHolder: 'Sender',
        initialBalance: 1000
      });

      const receiver = bankService.createAccount({
        teamId: 'team-b',
        accountHolder: 'Receiver',
        initialBalance: 500
      });

      // Transfer without teamId parameter should work (covers line 357 case)
      const result = bankService.transferFunds({
        fromAccountId: sender.id,
        toAccountId: receiver.id,
        amount: 300
      });

      expect(result.fromAccount.newBalance).toBe(700);
      expect(result.toAccount.newBalance).toBe(800);
    });

    it('should handle account statement edge cases', () => {
      const account = bankService.createAccount({
        teamId: 'test-team',
        accountHolder: 'Test User',
        initialBalance: 1000
      });

      // Add a withdrawal to test the balance adjustment logic
      bankService.createTransaction(account.id, {
        type: 'withdrawal',
        amount: 200
      }, 'test-team');

      const now = new Date();
      const startDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = now.toISOString();

      const statement = bankService.getAccountStatement(account.id, startDate, endDate, 'test-team');

      // This should cover lines in the statement generation logic
      expect(statement.summary.totalWithdrawals).toBe(200);
      expect(statement.summary.totalDeposits).toBe(1000); // Initial deposit
    });
  });
}); 