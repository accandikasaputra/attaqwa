import { sql } from "drizzle-orm";
import { 
  mysqlTable, 
  varchar, 
  text, 
  decimal,
  datetime,
  int,
  mysqlEnum,
  timestamp
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ==================== USERS ====================
export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  role: mysqlEnum("role", [
    "admin",
    "bendahara", 
    "ketua",
    "tim_konstruksi",
    "tim_procurement"
  ]).notNull().default("admin"),
  isActive: int("is_active").notNull().default(1), // 1 = active, 0 = inactive
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// ==================== TRANSACTIONS ====================
export const transactions = mysqlTable("transactions", {
  id: int("id").primaryKey().autoincrement(),
  type: mysqlEnum("type", ["pemasukan", "pengeluaran"]).notNull(),
  category: varchar("category", { length: 100 }).notNull(), // Donasi, Material, Upah, dll
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  
  // Workflow tracking
  status: mysqlEnum("status", [
    "draft",
    "pending",
    "approved_bendahara",
    "approved",
    "rejected"
  ]).notNull().default("draft"),
  
  // Team origin (untuk tracking workflow)
  createdBy: int("created_by").notNull().references(() => users.id),
  createdByTeam: mysqlEnum("created_by_team", [
    "admin",
    "tim_konstruksi",
    "tim_procurement"
  ]).notNull(),
  
  // Approval tracking
  approvedByBendahara: int("approved_by_bendahara").references(() => users.id),
  approvedByKetuaAt: datetime("approved_by_ketua_at"),
  approvedByKetua: int("approved_by_ketua").references(() => users.id),
  approvedAt: datetime("approved_at"),
  
  rejectedBy: int("rejected_by").references(() => users.id),
  rejectedAt: datetime("rejected_at"),
  rejectionReason: text("rejection_reason"),
  
  // Metadata
  transactionDate: datetime("transaction_date").notNull(),
  receiptUrl: varchar("receipt_url", { length: 500 }),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// ==================== TRANSACTION APPROVALS (Audit Log) ====================
export const transactionApprovals = mysqlTable("transaction_approvals", {
  id: int("id").primaryKey().autoincrement(),
  transactionId: int("transaction_id").notNull().references(() => transactions.id),
  approverUserId: int("approver_user_id").notNull().references(() => users.id),
  approverRole: mysqlEnum("approver_role", ["bendahara", "ketua"]).notNull(),
  action: mysqlEnum("action", ["approved", "rejected"]).notNull(),
  comments: text("comments"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTransactionApprovalSchema = createInsertSchema(transactionApprovals).omit({
  id: true,
  createdAt: true,
});

export type TransactionApproval = typeof transactionApprovals.$inferSelect;
export type InsertTransactionApproval = z.infer<typeof insertTransactionApprovalSchema>;

// ==================== NEWS ====================
export const news = mysqlTable("news", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  imageUrl: varchar("image_url", { length: 500 }),
  
  status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
  publishedAt: datetime("published_at"),
  
  authorId: int("author_id").notNull().references(() => users.id),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type News = typeof news.$inferSelect;
export type InsertNews = z.infer<typeof insertNewsSchema>;

// ==================== DONATIONS ====================
export const donations = mysqlTable("donations", {
  id: int("id").primaryKey().autoincrement(),
  donorName: varchar("donor_name", { length: 255 }).notNull(),
  donorEmail: varchar("donor_email", { length: 255 }),
  donorPhone: varchar("donor_phone", { length: 50 }),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  
  // Approval workflow untuk donasi
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).notNull().default("pending"),
  
  approvedBy: int("approved_by").references(() => users.id),
  approvedAt: datetime("approved_at"),
  
  rejectedBy: int("rejected_by").references(() => users.id),
  rejectedAt: datetime("rejected_at"),
  rejectionReason: text("rejection_reason"),
  
  paymentMethod: varchar("payment_method", { length: 100 }),
  paymentProofUrl: varchar("payment_proof_url", { length: 500 }),
  notes: text("notes"),
  
  donationDate: datetime("donation_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const insertDonationSchema = createInsertSchema(donations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = z.infer<typeof insertDonationSchema>;

// ==================== BANK ACCOUNTS ====================
export const bankAccounts = mysqlTable("bank_accounts", {
  id: int("id").primaryKey().autoincrement(),
  bankName: varchar("bank_name", { length: 100 }).notNull(),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  accountHolder: varchar("account_holder", { length: 255 }).notNull(),
  isActive: int("is_active").notNull().default(1),
  displayOrder: int("display_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const insertBankAccountSchema = createInsertSchema(bankAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = z.infer<typeof insertBankAccountSchema>;

// ==================== FEEDBACK ====================
export const feedback = mysqlTable("feedback", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  status: mysqlEnum("status", ["new", "read", "replied"]).notNull().default("new"),
  readBy: int("read_by").references(() => users.id),
  readAt: datetime("read_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
