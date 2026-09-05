import type {
    CreditTransaction,
  } from "../types/marketplace";
  
  const BALANCE_KEY =
    "khoj_market_credit_balances";
  
  const TRANSACTIONS_KEY =
    "khoj_market_credit_transactions";
  
  const DEFAULT_SELLER_CREDITS =
    50;
  
  // =====================================================
  // BALANCES
  // =====================================================
  
  interface StoredBalance {
    userId: string;
    balance: number;
  }
  
  function getBalances():
    StoredBalance[] {
    try {
      return JSON.parse(
        localStorage.getItem(
          BALANCE_KEY
        ) || "[]"
      );
    } catch {
      return [];
    }
  }
  
  function saveBalances(
    balances: StoredBalance[]
  ) {
    localStorage.setItem(
      BALANCE_KEY,
      JSON.stringify(balances)
    );
  }
  
  // =====================================================
  // TRANSACTIONS
  // =====================================================
  
  export function getAllCreditTransactions():
    CreditTransaction[] {
    try {
      return JSON.parse(
        localStorage.getItem(
          TRANSACTIONS_KEY
        ) || "[]"
      );
    } catch {
      return [];
    }
  }
  
  function saveTransactions(
    transactions: CreditTransaction[]
  ) {
    localStorage.setItem(
      TRANSACTIONS_KEY,
      JSON.stringify(transactions)
    );
  }
  
  // =====================================================
  // INITIALIZE WALLET
  // =====================================================
  
  export function initializeSellerWallet(
    userId: string
  ): number {
    const balances =
      getBalances();
  
    const existing =
      balances.find(
        (item) =>
          item.userId === userId
      );
  
    if (existing) {
      return existing.balance;
    }
  
    const newBalance: StoredBalance =
      {
        userId,
        balance:
          DEFAULT_SELLER_CREDITS,
      };
  
    balances.push(newBalance);
  
    saveBalances(balances);
  
    const transactions =
      getAllCreditTransactions();
  
    const transaction: CreditTransaction =
      {
        id: crypto.randomUUID(),
  
        userId,
  
        type: "initial_balance",
  
        amount:
          DEFAULT_SELLER_CREDITS,
  
        balanceAfter:
          DEFAULT_SELLER_CREDITS,
  
        description:
          "Demo seller welcome credits",
  
        createdAt:
          new Date().toISOString(),
      };
  
    transactions.unshift(
      transaction
    );
  
    saveTransactions(
      transactions
    );
  
    return DEFAULT_SELLER_CREDITS;
  }
  
  // =====================================================
  // GET BALANCE
  // =====================================================
  
  export function getCreditBalance(
    userId: string
  ): number {
    const balances =
      getBalances();
  
    const wallet =
      balances.find(
        (item) =>
          item.userId === userId
      );
  
    if (!wallet) {
      return initializeSellerWallet(
        userId
      );
    }
  
    return wallet.balance;
  }
  
  // =====================================================
  // DEDUCT
  // =====================================================
  
  export function deductCredits(
    userId: string,
    amount: number,
    description: string,
    referenceId?: string
  ) {
    if (amount <= 0) {
      throw new Error(
        "Invalid credit amount."
      );
    }
  
    const balances =
      getBalances();
  
    let wallet =
      balances.find(
        (item) =>
          item.userId === userId
      );
  
    if (!wallet) {
      initializeSellerWallet(
        userId
      );
  
      return deductCredits(
        userId,
        amount,
        description,
        referenceId
      );
    }
  
    if (
      wallet.balance < amount
    ) {
      throw new Error(
        "Not enough credits."
      );
    }
  
    wallet = {
      ...wallet,
      balance:
        wallet.balance -
        amount,
    };
  
    const updatedBalances =
      balances.map((item) =>
        item.userId === userId
          ? wallet!
          : item
      );
  
    saveBalances(
      updatedBalances
    );
  
    const transactions =
      getAllCreditTransactions();
  
    const transaction: CreditTransaction =
      {
        id: crypto.randomUUID(),
  
        userId,
  
        type:
          "inquiry_deduction",
  
        amount: -amount,
  
        balanceAfter:
          wallet.balance,
  
        description,
  
        referenceId,
  
        createdAt:
          new Date().toISOString(),
      };
  
    transactions.unshift(
      transaction
    );
  
    saveTransactions(
      transactions
    );
  
    return wallet.balance;
  }
  
  // =====================================================
  // ADD CREDIT
  // =====================================================
  
  export function addCredits(
    userId: string,
    amount: number,
    description:
      string = "Credits added",
    type:
      | "admin_credit"
      | "refund" =
      "admin_credit"
  ) {
    if (amount <= 0) {
      throw new Error(
        "Invalid credit amount."
      );
    }
  
    const currentBalance =
      getCreditBalance(userId);
  
    const newBalance =
      currentBalance + amount;
  
    const balances =
      getBalances();
  
    const updatedBalances =
      balances.map((item) =>
        item.userId === userId
          ? {
              ...item,
              balance:
                newBalance,
            }
          : item
      );
  
    saveBalances(
      updatedBalances
    );
  
    const transactions =
      getAllCreditTransactions();
  
    transactions.unshift({
      id: crypto.randomUUID(),
  
      userId,
  
      type,
  
      amount,
  
      balanceAfter:
        newBalance,
  
      description,
  
      createdAt:
        new Date().toISOString(),
    });
  
    saveTransactions(
      transactions
    );
  
    return newBalance;
  }
  
  // =====================================================
  // USER TRANSACTIONS
  // =====================================================
  
  export function getCreditTransactionsByUser(
    userId: string
  ) {
    return getAllCreditTransactions()
      .filter(
        (item) =>
          item.userId === userId
      )
      .sort(
        (a, b) =>
          new Date(
            b.createdAt
          ).getTime() -
          new Date(
            a.createdAt
          ).getTime()
      );
  }