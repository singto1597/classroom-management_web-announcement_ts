import { api } from './api';
import type { 
  Account, 
  AccountCreate, 
  Category, 
  CategoryCreate, 
  Transaction, 
  TransactionList,
  TransactionCreate,
  TransferCreate,
  Collection,
  FeeCollectionCreate,
  CollectionStatus,
  FeeCollectionUpdate,
  PaymentConfirm,
  FinanceSummary,
  Debtor,
  StudentDebtProfile
} from '@/types/finance';

export const FinanceService = {
  // ==========================================
  // 💰 1. Accounts & Categories
  // ==========================================
  
  async getAccounts(serverId: string): Promise<Account[]> {
    return await api.get(`/api/classroom/${serverId}/finance/accounts`) as unknown as Account[];
  },

  async createAccount(serverId: string, payload: AccountCreate): Promise<any> {
    return await api.post(`/api/classroom/${serverId}/finance/accounts`, payload);
  },

  async updateAccount(serverId: string, accountId: number, name: string, userName: string): Promise<any> {
    return await api.patch(`/api/classroom/${serverId}/finance/accounts/${accountId}`, { 
      account_name: name,
      user_name: userName
    });
  },

  async deleteAccount(serverId: string, accountId: number): Promise<any> {
    return await api.delete(`/api/classroom/${serverId}/finance/accounts/${accountId}`);
  },

  async getCategories(serverId: string, type?: 'income' | 'expense'): Promise<Category[]> {
    const params = type ? { cat_type: type } : {};
    return await api.get(`/api/classroom/${serverId}/finance/categories`, { params }) as unknown as Category[];
  },

  async createCategory(serverId: string, payload: CategoryCreate): Promise<any> {
    return await api.post(`/api/classroom/${serverId}/finance/categories`, payload);
  },

  async updateCategory(serverId: string, categoryId: number, name: string, userName: string): Promise<any> {
    return await api.patch(`/api/classroom/${serverId}/finance/categories/${categoryId}`, { 
      category_name: name,
      user_name: userName
    });
  },

  async deleteCategory(serverId: string, categoryId: number): Promise<any> {
    return await api.delete(`/api/classroom/${serverId}/finance/categories/${categoryId}`);
  },

  // ==========================================
  // 💸 2. Transactions & Transfers
  // ==========================================

  async getTransactions(serverId: string, filters: any = {}): Promise<TransactionList> {
    return await api.get(`/api/classroom/${serverId}/finance/transactions`, { params: filters }) as unknown as TransactionList;
  },

  async addTransaction(serverId: string, payload: TransactionCreate): Promise<any> {
    return await api.post(`/api/classroom/${serverId}/finance/transactions`, payload);
  },

  async transferMoney(serverId: string, payload: TransferCreate): Promise<any> {
    return await api.post(`/api/classroom/${serverId}/finance/transfer`, payload);
  },

  async revertTransaction(serverId: string, transactionId: number, userName: string): Promise<any> {
    return await api.delete(`/api/classroom/${serverId}/finance/transactions/${transactionId}`, {
      data: { user_name: userName }
    });
  },

  // ==========================================
  // 📦 3. Fee Collections & Payments
  // ==========================================

  async getCollections(serverId: string): Promise<Collection[]> {
    return await api.get(`/api/classroom/${serverId}/finance/collections`) as unknown as Collection[];
  },

  async createCollection(serverId: string, payload: FeeCollectionCreate): Promise<any> {
    return await api.post(`/api/classroom/${serverId}/finance/collections`, payload);
  },

  async getCollectionStatus(serverId: string, collectionId: number): Promise<CollectionStatus> {
    return await api.get(`/api/classroom/${serverId}/finance/collections/${collectionId}`) as unknown as CollectionStatus;
  },

  async updateCollection(serverId: string, collectionId: number, payload: FeeCollectionUpdate): Promise<any> {
    return await api.put(`/api/classroom/${serverId}/finance/collections/${collectionId}`, payload);
  },

  async confirmPayment(serverId: string, paymentId: number, payload: PaymentConfirm): Promise<any> {
    return await api.put(`/api/classroom/${serverId}/finance/payments/${paymentId}/pay`, payload);
  },

  // ==========================================
  // 📊 4. Summary & Reports
  // ==========================================

  async getSummary(serverId: string, month?: number, year?: number): Promise<FinanceSummary> {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return await api.get(`/api/classroom/${serverId}/finance/summary`, { params }) as unknown as FinanceSummary;
  },

  async getAllDebtors(serverId: string): Promise<Debtor[]> {
    return await api.get(`/api/classroom/${serverId}/finance/debtors`) as unknown as Debtor[];
  },

  async getStudentDebts(serverId: string, studentId: number): Promise<StudentDebtProfile> {
    return await api.get(`/api/classroom/${serverId}/finance/students/${studentId}/debts`) as unknown as StudentDebtProfile;
  }
};
