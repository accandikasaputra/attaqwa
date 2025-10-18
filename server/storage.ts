import { db } from './db';
import {
  users,
  transactions,
  transactionApprovals,
  news,
  donations,
  bankAccounts,
  feedback,
  purchaseOrders,
  poItems,
  faqs,
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
  type PurchaseOrder,
  type InsertPurchaseOrder,
  type POItem,
  type InsertPOItem,
  type FAQ,
  type InsertFAQ,
} from '@shared/schema';
import { eq, desc, and, or, gte, lt, sql } from 'drizzle-orm';

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
  // Donation operations - UPDATE
  createDonation(donation: InsertDonation): Promise<Donation>;
  getDonationById(id: number): Promise<Donation | undefined>;
  getAllDonations(): Promise<Donation[]>;
  getDonationsByStatus(status: string): Promise<Donation[]>;
  updateDonation(id: number, updates: Partial<Donation>): Promise<void>;
  deleteDonation(id: number): Promise<void>;
  submitDonation(id: number): Promise<void>;
  
  


  // News operations
  createNews(news: InsertNews): Promise<News>;
  getNewsById(id: number): Promise<News | null>;
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
  getFeedbackById(id: number): Promise<Feedback | undefined>;
  markFeedbackAsRead(id: number, userId: number): Promise<void>;
  replyFeedback(id: number, reply: string, userId: number): Promise<void>;
  deleteFeedback(id: number): Promise<void>;
  
  // FAQ operations
  createFAQ(faq: InsertFAQ): Promise<FAQ>;
  getAllFAQs(): Promise<FAQ[]>;
  getActiveFAQs(): Promise<FAQ[]>;
  getFAQById(id: number): Promise<FAQ | undefined>;
  updateFAQ(id: number, updates: Partial<FAQ>): Promise<void>;
  deleteFAQ(id: number): Promise<void>;
  reorderFAQs(orders: { id: number; displayOrder: number }[]): Promise<void>;


   // Purchase Order operations
  createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder>;
  getPurchaseOrderById(id: number): Promise<PurchaseOrder | undefined>;
  getAllPurchaseOrders(): Promise<PurchaseOrder[]>;
  getPurchaseOrdersByStatus(status: string): Promise<PurchaseOrder[]>;
  getPurchaseOrdersByRole(role: string): Promise<PurchaseOrder[]>;
  updatePurchaseOrder(id: number, updates: Partial<PurchaseOrder>): Promise<void>;
  deletePurchaseOrder(id: number): Promise<void>;
  generatePONumber(): Promise<string>;
  
  // PO Item operations
  createPOItem(item: InsertPOItem): Promise<POItem>;
  getPOItemsByPOId(poId: number): Promise<POItem[]>;
  updatePOItem(id: number, updates: Partial<POItem>): Promise<void>;
  deletePOItem(id: number): Promise<void>;
  updatePOItemSelection(id: number, isSelected: boolean): Promise<void>;
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
    const [donation] = await db
      .select()
      .from(donations)
      .where(eq(donations.id, id))
      .limit(1);
    return donation;
  }
  
  async getAllDonations(): Promise<Donation[]> {
    return await db
      .select()
      .from(donations)
      .orderBy(desc(donations.createdAt));
  }
  
  async getDonationsByStatus(status: string): Promise<Donation[]> {
    return await db
      .select()
      .from(donations)
      .where(eq(donations.status, status as any))
      .orderBy(desc(donations.createdAt));
  }
  
  async updateDonation(id: number, updates: Partial<Donation>): Promise<void> {
    await db
      .update(donations)
      .set(updates)
      .where(eq(donations.id, id));
  }
  
  async deleteDonation(id: number): Promise<void> {
    await db.delete(donations).where(eq(donations.id, id));
  }
  
  async submitDonation(id: number): Promise<void> {
    const donation = await this.getDonationById(id);
    if (!donation) throw new Error('Donation not found');
    
    // If created by bendahara, can directly approve
    // If created by tim_pendanaan, need review
    const newStatus = donation.createdByRole === 'bendahara' 
      ? 'approved_bendahara' 
      : 'pending_review';
    
    await db
      .update(donations)
      .set({ status: newStatus as any })
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
  // Get all news (including drafts)
  async getAllNews(): Promise<News[]> {
    return db.select().from(news).orderBy(desc(news.createdAt));
  }

  // Get published news only
  async getPublishedNews(): Promise<News[]> {
    return db
      .select()
      .from(news)
      .where(eq(news.status, "published"))
      .orderBy(desc(news.publishedAt));
  }

  // Get news by ID
  async getNewsById(id: number): Promise<News | null> {
    const result = await db.select().from(news).where(eq(news.id, id)).limit(1);
    return result[0] || null;
  }


 // Create news
  async createNews(data: InsertNews): Promise<News> {
    const [result] = await db.insert(news).values(data);
    const created = await this.getNewsById(result.insertId);
    
    if (!created) {
      throw new Error("Failed to create news");
    }
    
    return created; // ← Sekarang tidak akan error karena sudah di-check
  }

  // Update news
  async updateNews(id: number, data: Partial<InsertNews>): Promise<void> {
    await db.update(news).set(data).where(eq(news.id, id));
  }

  // Delete news
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

  async getFeedbackById(id: number): Promise<Feedback | undefined> {
    const [result] = await db
      .select()
      .from(feedback)
      .where(eq(feedback.id, id))
      .limit(1);
    return result;
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

  async replyFeedback(id: number, reply: string, userId: number): Promise<void> {
    await db
      .update(feedback)
      .set({
        status: 'replied',
        reply,
        repliedBy: userId,
        repliedAt: new Date(),
      })
      .where(eq(feedback.id, id));
  }

  async deleteFeedback(id: number): Promise<void> {
    await db.delete(feedback).where(eq(feedback.id, id));
  }
  
  // ==================== FAQ OPERATIONS ====================
  
  async createFAQ(faq: InsertFAQ): Promise<FAQ> {
    const [result] = await db.insert(faqs).values(faq).$returningId();
    const [created] = await db
      .select()
      .from(faqs)
      .where(eq(faqs.id, result.id))
      .limit(1);
    if (!created) throw new Error('Failed to create FAQ');
    return created;
  }

  async getAllFAQs(): Promise<FAQ[]> {
    return await db
      .select()
      .from(faqs)
      .orderBy(faqs.displayOrder, desc(faqs.createdAt));
  }

  async getActiveFAQs(): Promise<FAQ[]> {
    return await db
      .select()
      .from(faqs)
      .where(eq(faqs.isActive, 1))
      .orderBy(faqs.displayOrder);
  }

  async getFAQById(id: number): Promise<FAQ | undefined> {
    const [faq] = await db
      .select()
      .from(faqs)
      .where(eq(faqs.id, id))
      .limit(1);
    return faq;
  }

  async updateFAQ(id: number, updates: Partial<FAQ>): Promise<void> {
    await db
      .update(faqs)
      .set(updates)
      .where(eq(faqs.id, id));
  }

  async deleteFAQ(id: number): Promise<void> {
    await db.delete(faqs).where(eq(faqs.id, id));
  }

  async reorderFAQs(orders: { id: number; displayOrder: number }[]): Promise<void> {
    for (const order of orders) {
      await db
        .update(faqs)
        .set({ displayOrder: order.displayOrder })
        .where(eq(faqs.id, order.id));
    }
  }


   // ==================== PURCHASE ORDER OPERATIONS ====================
  
  async generatePONumber(): Promise<string> {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    // Use CURDATE() for MySQL
    const todayPOs = await db
      .select()
      .from(purchaseOrders)
      .where(sql`DATE(${purchaseOrders.createdAt}) = CURDATE()`);
    
    const sequence = String(todayPOs.length + 1).padStart(3, '0');
    return `PO/${day}${month}${year}/${sequence}`;
  }
  
  async createPurchaseOrder(po: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const [result] = await db.insert(purchaseOrders).values(po).$returningId();
    const created = await this.getPurchaseOrderById(result.id);
    if (!created) throw new Error('Failed to create purchase order');
    return created;
  }
  
  async getPurchaseOrderById(id: number): Promise<PurchaseOrder | undefined> {
    const [po] = await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .limit(1);
    return po;
  }
  
  async getAllPurchaseOrders(): Promise<PurchaseOrder[]> {
    return await db
      .select()
      .from(purchaseOrders)
      .orderBy(desc(purchaseOrders.createdAt));
  }
  
  async getPurchaseOrdersByStatus(status: string): Promise<PurchaseOrder[]> {
    return await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.status, status as any))
      .orderBy(desc(purchaseOrders.createdAt));
  }
  
  async getPurchaseOrdersByRole(role: string): Promise<PurchaseOrder[]> {
    return await db
      .select()
      .from(purchaseOrders)
      .where(eq(purchaseOrders.createdByRole, role as any))
      .orderBy(desc(purchaseOrders.createdAt));
  }
  
  async updatePurchaseOrder(id: number, updates: Partial<PurchaseOrder>): Promise<void> {
    await db
      .update(purchaseOrders)
      .set(updates)
      .where(eq(purchaseOrders.id, id));
  }
  
  async deletePurchaseOrder(id: number): Promise<void> {
    // Items will be deleted automatically due to CASCADE
    await db.delete(purchaseOrders).where(eq(purchaseOrders.id, id));
  }
  
  // ==================== PO ITEM OPERATIONS ====================
  
  async createPOItem(item: InsertPOItem): Promise<POItem> {
    const [result] = await db.insert(poItems).values(item).$returningId();
    const [created] = await db
      .select()
      .from(poItems)
      .where(eq(poItems.id, result.id))
      .limit(1);
    if (!created) throw new Error('Failed to create PO item');
    return created;
  }
  
  async getPOItemsByPOId(poId: number): Promise<POItem[]> {
    return await db
      .select()
      .from(poItems)
      .where(eq(poItems.poId, poId))
      .orderBy(poItems.id);
  }
  
  async updatePOItem(id: number, updates: Partial<POItem>): Promise<void> {
    await db.update(poItems).set(updates).where(eq(poItems.id, id));
  }
  
  async deletePOItem(id: number): Promise<void> {
    await db.delete(poItems).where(eq(poItems.id, id));
  }
  
  async updatePOItemSelection(id: number, isSelected: boolean): Promise<void> {
    await db
      .update(poItems)
      .set({ isSelectedByBendahara: isSelected ? 1 : 0 })
      .where(eq(poItems.id, id));
  }
}

export const storage = new DBStorage();
