import { db } from './db';
import {
  users,
  transactions,
  transactionApprovals,
  news,
  donations,
  bankAccounts,
  feedback,
  type User,
  type InsertUser,
  type Transaction,
  type InsertTransaction,
  type News,
  type InsertNews,
  type Donation,
  type InsertDonation,
  type BankAccount,
  type InsertBankAccount,
  type Feedback,
  type InsertFeedback,
} from '@shared/schema';
import { eq, desc, and, or } from 'drizzle-orm';

// Storage interface for all CRUD operations
export interface IStorage {
  // User operations
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Transaction operations
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  getAllTransactions(): Promise<Transaction[]>;
  getTransactionsByStatus(status: string): Promise<Transaction[]>;
  updateTransactionStatus(id: number, status: string, userId: number): Promise<void>;
  
  // Donation operations
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationById(id: number): Promise<Donation | undefined>;
  getAllDonations(): Promise<Donation[]>;
  getPendingDonations(): Promise<Donation[]>;
  approveDonation(id: number, userId: number): Promise<void>;
  rejectDonation(id: number, userId: number, reason: string): Promise<void>;
  
  


  // News operations
  createNews(news: InsertNews): Promise<News>;
  getNewsById(id: number): Promise<News | undefined>;
  getAllNews(): Promise<News[]>;
  getPublishedNews(): Promise<News[]>;
  updateNews(id: number, updates: Partial<News>): Promise<void>;
  deleteNews(id: number): Promise<void>;
  
  // Bank Account operations
  createBankAccount(account: InsertBankAccount): Promise<BankAccount>;
  getAllBankAccounts(): Promise<BankAccount[]>;
  getActiveBankAccounts(): Promise<BankAccount[]>;
  updateBankAccount(id: number, updates: Partial<BankAccount>): Promise<void>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;
  markFeedbackAsRead(id: number, userId: number): Promise<void>;
}

// Database storage implementation
export class DBStorage implements IStorage {
  // ==================== USER OPERATIONS ====================
  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).$returningId();
    const createdUser = await this.getUserById(user.id);
    if (!createdUser) throw new Error('Failed to create user');
    return createdUser;
  }

  // ==================== TRANSACTION OPERATIONS ====================
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [result] = await db.insert(transactions).values(transaction).$returningId();
    const created = await this.getTransactionById(result.id);
    if (!created) throw new Error('Failed to create transaction');
    return created;
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id))
      .limit(1);
    return transaction;
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  }

  async getTransactionsByStatus(status: string): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.status, status as any))
      .orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(id: number, status: string, userId: number): Promise<void> {
    await db
      .update(transactions)
      .set({ status: status as any })
      .where(eq(transactions.id, id));
  }

  // ==================== DONATION OPERATIONS ====================
  async createDonation(donation: InsertDonation): Promise<Donation> {
    const [result] = await db.insert(donations).values(donation).$returningId();
    const created = await this.getDonationById(result.id);
    if (!created) throw new Error('Failed to create donation');
    return created;
  }

  async getDonationById(id: number): Promise<Donation | undefined> {
    const [donation] = await db.select().from(donations).where(eq(donations.id, id)).limit(1);
    return donation;
  }

  async getAllDonations(): Promise<Donation[]> {
    return await db.select().from(donations).orderBy(desc(donations.createdAt));
  }

  async getPendingDonations(): Promise<Donation[]> {
    return await db
      .select()
      .from(donations)
      .where(eq(donations.status, 'pending'))
      .orderBy(desc(donations.createdAt));
  }

  async approveDonation(id: number, userId: number): Promise<void> {
    await db
      .update(donations)
      .set({
        status: 'approved',
        approvedBy: userId,
        approvedAt: new Date(),
      })
      .where(eq(donations.id, id));
  }

  async rejectDonation(id: number, userId: number, reason: string): Promise<void> {
    await db
      .update(donations)
      .set({
        status: 'rejected',
        rejectedBy: userId,
        rejectedAt: new Date(),
        rejectionReason: reason,
      })
      .where(eq(donations.id, id));
  }

  // ==================== NEWS CATEGORY ====================
  async getNewsByCategory(category?: string) {
    const validCategories = ["update-pembangunan", "kegiatan", "pengumuman"] as const;

    if (!category || !validCategories.includes(category as any)) {
      return await db
        .select()
        .from(news)
        .where(eq(news.status, "published"))
        .orderBy(desc(news.publishedAt));
    }

    return await db
      .select()
      .from(news)
      .where(
        and(
          eq(news.category, category as (typeof validCategories)[number]),
          eq(news.status, "published")
        )
      )
      .orderBy(desc(news.publishedAt));
  }



  // ==================== NEWS OPERATIONS ====================
  async createNews(insertNews: InsertNews): Promise<News> {
    const [result] = await db.insert(news).values(insertNews).$returningId();
    const created = await this.getNewsById(result.id);
    if (!created) throw new Error('Failed to create news');
    return created;
  }

  async getNewsById(id: number): Promise<News | undefined> {
    const [article] = await db.select().from(news).where(eq(news.id, id)).limit(1);
    return article;
  }

  async getAllNews(): Promise<News[]> {
    return await db.select().from(news).orderBy(desc(news.createdAt));
  }

  async getPublishedNews(): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .where(eq(news.status, 'published'))
      .orderBy(desc(news.publishedAt));
  }

  async updateNews(id: number, updates: Partial<News>): Promise<void> {
    await db.update(news).set(updates).where(eq(news.id, id));
  }

  async deleteNews(id: number): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // ==================== BANK ACCOUNT OPERATIONS ====================
  async createBankAccount(account: InsertBankAccount): Promise<BankAccount> {
    const [result] = await db.insert(bankAccounts).values(account).$returningId();
    const [created] = await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.id, result.id))
      .limit(1);
    if (!created) throw new Error('Failed to create bank account');
    return created;
  }

  async getAllBankAccounts(): Promise<BankAccount[]> {
    return await db.select().from(bankAccounts).orderBy(bankAccounts.displayOrder);
  }

  async getActiveBankAccounts(): Promise<BankAccount[]> {
    return await db
      .select()
      .from(bankAccounts)
      .where(eq(bankAccounts.isActive, 1))
      .orderBy(bankAccounts.displayOrder);
  }

  async updateBankAccount(id: number, updates: Partial<BankAccount>): Promise<void> {
    await db.update(bankAccounts).set(updates).where(eq(bankAccounts.id, id));
  }

  // ==================== FEEDBACK OPERATIONS ====================
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [result] = await db.insert(feedback).values(insertFeedback).$returningId();
    const [created] = await db
      .select()
      .from(feedback)
      .where(eq(feedback.id, result.id))
      .limit(1);
    if (!created) throw new Error('Failed to create feedback');
    return created;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  async markFeedbackAsRead(id: number, userId: number): Promise<void> {
    await db
      .update(feedback)
      .set({
        status: 'read',
        readBy: userId,
        readAt: new Date(),
      })
      .where(eq(feedback.id, id));
  }
}

export const storage = new DBStorage();
