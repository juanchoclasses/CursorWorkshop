export interface Account {
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
export interface Transaction {
    id: number;
    accountId: number;
    type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'interest';
    amount: number;
    description: string;
    timestamp: string;
    balanceAfter: number;
}
export interface CreateAccountRequest {
    teamId: string;
    accountHolder: string;
    initialBalance?: number;
    accountType?: 'checking' | 'savings';
}
export interface CreateTransactionRequest {
    type: 'deposit' | 'withdrawal';
    amount: number;
    description?: string;
    teamId?: string;
}
export interface TransferRequest {
    fromAccountId: number;
    toAccountId: number;
    amount: number;
    description?: string;
    teamId?: string;
}
export interface InterestRequest {
    interestRate: number;
    period: 'monthly' | 'quarterly' | 'yearly';
    teamId?: string;
}
export interface AccountStatement {
    account: {
        id: number;
        accountNumber: string;
        accountHolder: string;
        accountType: string;
    };
    period: {
        startDate: string;
        endDate: string;
    };
    summary: {
        openingBalance: number;
        closingBalance: number;
        totalDeposits: number;
        totalWithdrawals: number;
        transactionCount: number;
    };
    transactions: Transaction[];
}
declare class BankService {
    private accounts;
    private transactions;
    private nextAccountId;
    private nextTransactionId;
    constructor();
    private initializeSampleData;
    private generateAccountNumber;
    getAllAccounts(teamId?: string): Account[];
    getAccountById(id: number, teamId?: string): Account | null;
    getAccountsByTeam(teamId: string): Account[];
    createAccount(request: CreateAccountRequest): Account;
    updateAccount(id: number, updates: Partial<Pick<Account, 'accountHolder' | 'accountType'>>, teamId: string): Account;
    freezeAccount(id: number, reason: string, teamId: string): Account;
    unfreezeAccount(id: number, teamId: string): Account;
    closeAccount(id: number, teamId: string): Account;
    getAccountTransactions(accountId: number, teamId?: string): Transaction[];
    getAllTransactions(teamId?: string): Transaction[];
    getTransactionById(id: number): Transaction | null;
    createTransaction(accountId: number, request: CreateTransactionRequest, teamId?: string): {
        transaction: Transaction;
        newBalance: number;
    };
    transferFunds(request: TransferRequest, teamId?: string): {
        message: string;
        fromAccount: {
            id: number;
            newBalance: number;
        };
        toAccount: {
            id: number;
            newBalance: number;
        };
        transactions: Transaction[];
    };
    calculateAndApplyInterest(accountId: number, request: InterestRequest, teamId?: string): {
        account: {
            id: number;
            accountNumber: string;
            accountHolder: string;
            previousBalance: number;
            newBalance: number;
            accountType: string;
        };
        interest: {
            rate: number;
            period: string;
            amount: number;
            appliedAt: string;
        };
        transaction: Transaction;
    };
    getAccountStatement(accountId: number, startDate: string, endDate: string, teamId?: string): AccountStatement;
}
export declare const bankService: BankService;
export {};
//# sourceMappingURL=bank.d.ts.map