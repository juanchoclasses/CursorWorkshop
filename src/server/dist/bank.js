"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankService = void 0;
class BankService {
    constructor() {
        this.accounts = [];
        this.transactions = [];
        this.nextAccountId = 1;
        this.nextTransactionId = 1;
        // Initialize with sample data
        this.initializeSampleData();
    }
    initializeSampleData() {
        const account1 = {
            id: 1,
            teamId: "demo-team",
            accountNumber: "1234567890",
            accountHolder: "John Doe",
            balance: 1500.00,
            accountType: "checking",
            status: "active",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
        };
        const account2 = {
            id: 2,
            teamId: "demo-team",
            accountNumber: "0987654321",
            accountHolder: "Jane Smith",
            balance: 2750.50,
            accountType: "savings",
            status: "active",
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days ago
        };
        this.accounts = [account1, account2];
        this.nextAccountId = 3;
        // Add some sample transactions
        const transaction1 = {
            id: 1,
            accountId: 1,
            type: "deposit",
            amount: 500.00,
            description: "Salary deposit",
            timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            balanceAfter: 1500.00
        };
        const transaction2 = {
            id: 2,
            accountId: 1,
            type: "withdrawal",
            amount: 100.00,
            description: "ATM withdrawal",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            balanceAfter: 1400.00
        };
        this.transactions = [transaction1, transaction2];
        this.nextTransactionId = 3;
    }
    generateAccountNumber() {
        return Math.random().toString().substring(2, 12);
    }
    // Account Management
    getAllAccounts(teamId) {
        return this.accounts.filter(account => account.status !== 'closed' &&
            (!teamId || account.teamId === teamId));
    }
    getAccountById(id, teamId) {
        const account = this.accounts.find(acc => acc.id === id &&
            acc.status !== 'closed' &&
            (!teamId || acc.teamId === teamId));
        return account || null;
    }
    getAccountsByTeam(teamId) {
        return this.accounts.filter(account => account.teamId === teamId && account.status !== 'closed');
    }
    createAccount(request) {
        if (!request.teamId || request.teamId.trim() === '') {
            throw new Error('Team ID is required');
        }
        if (!request.accountHolder || request.accountHolder.trim() === '') {
            throw new Error('Account holder name is required');
        }
        const initialBalance = request.initialBalance || 0;
        const newAccount = {
            id: this.nextAccountId++,
            teamId: request.teamId.trim(),
            accountNumber: this.generateAccountNumber(),
            accountHolder: request.accountHolder.trim(),
            balance: 0, // Start with 0, let createTransaction handle the balance
            accountType: request.accountType || 'checking',
            status: 'active',
            createdAt: new Date().toISOString()
        };
        this.accounts.push(newAccount);
        // Create initial deposit transaction if there's an initial balance
        if (initialBalance > 0) {
            this.createTransaction(newAccount.id, {
                type: 'deposit',
                amount: initialBalance,
                description: 'Initial deposit'
            }, newAccount.teamId);
        }
        return newAccount;
    }
    updateAccount(id, updates, teamId) {
        const account = this.getAccountById(id, teamId);
        if (!account) {
            throw new Error('Account not found');
        }
        if (account.status === 'frozen') {
            throw new Error('Cannot update frozen account');
        }
        if (updates.accountHolder) {
            account.accountHolder = updates.accountHolder.trim();
        }
        if (updates.accountType) {
            account.accountType = updates.accountType;
        }
        return account;
    }
    freezeAccount(id, reason, teamId) {
        const account = this.getAccountById(id, teamId);
        if (!account) {
            throw new Error('Account not found');
        }
        if (account.status === 'frozen') {
            throw new Error('Account is already frozen');
        }
        account.status = 'frozen';
        account.freezeReason = reason;
        account.frozenAt = new Date().toISOString();
        return account;
    }
    unfreezeAccount(id, teamId) {
        const account = this.getAccountById(id, teamId);
        if (!account) {
            throw new Error('Account not found');
        }
        if (account.status !== 'frozen') {
            throw new Error('Account is not frozen');
        }
        account.status = 'active';
        account.unfrozenAt = new Date().toISOString();
        return account;
    }
    closeAccount(id, teamId) {
        const account = this.getAccountById(id, teamId);
        if (!account) {
            throw new Error('Account not found');
        }
        if (account.balance !== 0) {
            throw new Error(`Cannot close account with non-zero balance. Current balance: $${account.balance.toFixed(2)}`);
        }
        account.status = 'closed';
        account.closedAt = new Date().toISOString();
        return account;
    }
    // Transaction Management
    getAccountTransactions(accountId, teamId) {
        // Verify account belongs to team if teamId is provided
        if (teamId) {
            const account = this.getAccountById(accountId, teamId);
            if (!account) {
                throw new Error('Account not found or does not belong to team');
            }
        }
        return this.transactions.filter(t => t.accountId === accountId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    getAllTransactions(teamId) {
        if (teamId) {
            const teamAccountIds = this.getAccountsByTeam(teamId).map(acc => acc.id);
            return this.transactions
                .filter(t => teamAccountIds.includes(t.accountId))
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        }
        return this.transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    getTransactionById(id) {
        return this.transactions.find(t => t.id === id) || null;
    }
    createTransaction(accountId, request, teamId) {
        const account = this.getAccountById(accountId, teamId);
        if (!account) {
            throw new Error('Account not found');
        }
        if (account.status === 'frozen') {
            throw new Error('Cannot perform transactions on frozen account');
        }
        if (account.status === 'closed') {
            throw new Error('Cannot perform transactions on closed account');
        }
        if (!request.type || !request.amount || request.amount <= 0) {
            throw new Error('Valid type and amount are required');
        }
        if (request.type === 'withdrawal' && account.balance < request.amount) {
            throw new Error('Insufficient funds');
        }
        // Update account balance
        if (request.type === 'deposit') {
            account.balance += request.amount;
        }
        else if (request.type === 'withdrawal') {
            account.balance -= request.amount;
        }
        const transaction = {
            id: this.nextTransactionId++,
            accountId,
            type: request.type,
            amount: request.amount,
            description: request.description || '',
            timestamp: new Date().toISOString(),
            balanceAfter: account.balance
        };
        this.transactions.push(transaction);
        return {
            transaction,
            newBalance: account.balance
        };
    }
    transferFunds(request, teamId) {
        const fromAccount = this.getAccountById(request.fromAccountId, teamId);
        const toAccount = this.getAccountById(request.toAccountId, teamId);
        if (!fromAccount || !toAccount) {
            throw new Error('One or both accounts not found');
        }
        // Ensure both accounts belong to the same team if teamId is specified
        if (teamId && (fromAccount.teamId !== teamId || toAccount.teamId !== teamId)) {
            throw new Error('Cannot transfer between accounts of different teams');
        }
        if (fromAccount.status !== 'active' || toAccount.status !== 'active') {
            throw new Error('Both accounts must be active for transfers');
        }
        if (fromAccount.balance < request.amount) {
            throw new Error('Insufficient funds');
        }
        if (request.amount <= 0) {
            throw new Error('Transfer amount must be positive');
        }
        // Update balances
        fromAccount.balance -= request.amount;
        toAccount.balance += request.amount;
        // Create transfer transactions
        const withdrawalTransaction = {
            id: this.nextTransactionId++,
            accountId: fromAccount.id,
            type: 'transfer_out',
            amount: request.amount,
            description: `Transfer to ${toAccount.accountNumber}: ${request.description || ''}`,
            timestamp: new Date().toISOString(),
            balanceAfter: fromAccount.balance
        };
        const depositTransaction = {
            id: this.nextTransactionId++,
            accountId: toAccount.id,
            type: 'transfer_in',
            amount: request.amount,
            description: `Transfer from ${fromAccount.accountNumber}: ${request.description || ''}`,
            timestamp: new Date().toISOString(),
            balanceAfter: toAccount.balance
        };
        this.transactions.push(withdrawalTransaction, depositTransaction);
        return {
            message: 'Transfer completed successfully',
            fromAccount: { id: fromAccount.id, newBalance: fromAccount.balance },
            toAccount: { id: toAccount.id, newBalance: toAccount.balance },
            transactions: [withdrawalTransaction, depositTransaction]
        };
    }
    // Interest Calculation
    calculateAndApplyInterest(accountId, request, teamId) {
        const account = this.getAccountById(accountId, teamId);
        if (!account) {
            throw new Error('Account not found');
        }
        if (account.status !== 'active') {
            throw new Error('Interest can only be applied to active accounts');
        }
        if (account.accountType !== 'savings') {
            throw new Error('Interest can only be applied to savings accounts');
        }
        const previousBalance = account.balance;
        // Calculate interest based on period
        let periodMultiplier = 1;
        switch (request.period) {
            case 'monthly':
                periodMultiplier = 1 / 12;
                break;
            case 'quarterly':
                periodMultiplier = 1 / 4;
                break;
            case 'yearly':
                periodMultiplier = 1;
                break;
        }
        const interestAmount = previousBalance * request.interestRate * periodMultiplier;
        account.balance += interestAmount;
        const appliedAt = new Date().toISOString();
        const transaction = {
            id: this.nextTransactionId++,
            accountId: account.id,
            type: 'interest',
            amount: interestAmount,
            description: `${request.period.charAt(0).toUpperCase() + request.period.slice(1)} interest - ${(request.interestRate * 100).toFixed(1)}% APR`,
            timestamp: appliedAt,
            balanceAfter: account.balance
        };
        this.transactions.push(transaction);
        return {
            account: {
                id: account.id,
                accountNumber: account.accountNumber,
                accountHolder: account.accountHolder,
                previousBalance,
                newBalance: account.balance,
                accountType: account.accountType
            },
            interest: {
                rate: request.interestRate,
                period: request.period,
                amount: interestAmount,
                appliedAt
            },
            transaction
        };
    }
    // Account Statement
    getAccountStatement(accountId, startDate, endDate, teamId) {
        const account = this.getAccountById(accountId, teamId);
        if (!account) {
            throw new Error('Account not found');
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (start >= end) {
            throw new Error('Start date must be before end date');
        }
        const periodTransactions = this.transactions
            .filter(t => t.accountId === accountId)
            .filter(t => {
            const transactionDate = new Date(t.timestamp);
            return transactionDate >= start && transactionDate <= end;
        })
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        // Calculate opening balance (balance before the first transaction in period)
        let openingBalance = account.balance;
        for (let i = this.transactions.length - 1; i >= 0; i--) {
            const transaction = this.transactions[i];
            if (transaction.accountId === accountId && new Date(transaction.timestamp) <= end) {
                openingBalance = transaction.balanceAfter;
                if (new Date(transaction.timestamp) < start) {
                    break;
                }
            }
        }
        // If we have transactions in the period, adjust opening balance
        if (periodTransactions.length > 0) {
            const firstTransaction = periodTransactions[0];
            openingBalance = firstTransaction.balanceAfter - firstTransaction.amount;
            if (firstTransaction.type === 'withdrawal' || firstTransaction.type === 'transfer_out') {
                openingBalance = firstTransaction.balanceAfter + firstTransaction.amount;
            }
        }
        const totalDeposits = periodTransactions
            .filter(t => t.type === 'deposit' || t.type === 'transfer_in' || t.type === 'interest')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalWithdrawals = periodTransactions
            .filter(t => t.type === 'withdrawal' || t.type === 'transfer_out')
            .reduce((sum, t) => sum + t.amount, 0);
        return {
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
                openingBalance,
                closingBalance: account.balance,
                totalDeposits,
                totalWithdrawals,
                transactionCount: periodTransactions.length
            },
            transactions: periodTransactions
        };
    }
}
// Export singleton instance
exports.bankService = new BankService();
//# sourceMappingURL=bank.js.map