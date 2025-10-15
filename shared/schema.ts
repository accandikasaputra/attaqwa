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
  id: int("id", { unsigned: true }).primaryKey().autoincrement(),

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
  isActive: int("is_active", { unsigned: true }).notNull().default(1), // 1 = active, 0 = inactive
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
  createdBy: int("created_by" , { unsigned: true }).notNull().references(() => users.id),
  createdByTeam: mysqlEnum("created_by_team", [
    "admin",
    "tim_konstruksi",
    "tim_procurement"
  ]).notNull(),
  
  // Approval tracking
  approvedByBendahara: int("approved_by_bendahara" , { unsigned: true }).references(() => users.id),
  approvedByKetuaAt: datetime("approved_by_ketua_at"),
  approvedByKetua: int("approved_by_ketua" , { unsigned: true }).references(() => users.id),
  approvedAt: datetime("approved_at"),
  
  rejectedBy: int("rejected_by" , { unsigned: true }).references(() => users.id),
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
  approverUserId: int("approver_user_id" , { unsigned: true }).notNull().references(() => users.id),
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
  
  category: mysqlEnum("category", ["update-pembangunan", "kegiatan", "pengumuman"]).notNull().default("pengumuman"),

  status: mysqlEnum("status", ["draft", "published"]).notNull().default("draft"),
  publishedAt: datetime("published_at"),
  
  authorId: int("author_id" , { unsigned: true }).notNull().references(() => users.id),
  
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
// Update existing donations table with new fields:
export const donations = mysqlTable("donations", {
  id: int("id").primaryKey().autoincrement(),
  
  // Donor information
  donorName: varchar("donor_name", { length: 255 }).notNull(),
  donorEmail: varchar("donor_email", { length: 255 }),
  donorPhone: varchar("donor_phone", { length: 50 }),
  donorType: mysqlEnum("donor_type", ["warga", "luar_warga"]).notNull().default("warga"),
  
  // Donation details
  donationType: mysqlEnum("donation_type", ["sumbangan", "iuran"]).notNull().default("sumbangan"),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  
  // Privacy setting - NEW
  showName: int("show_name").notNull().default(1), // 1 = show name, 0 = use alias "Hamba Allah"
  
  // Approval workflow
  status: mysqlEnum("status", [
    "draft",
    "pending_review",      // NEW - waiting bendahara review (if created by tim_pendanaan)
    "approved_bendahara",  // NEW - approved by bendahara (if created by tim_pendanaan)
    "approved",            // Final approved by ketua
    "rejected"
  ]).notNull().default("draft"),
  
  // Creator tracking - NEW
  createdBy: int("created_by" , { unsigned: true }).notNull().references(() => users.id),
  createdByRole: mysqlEnum("created_by_role", ["bendahara", "tim_pendanaan"]).notNull(),
  
  // Approval tracking
  reviewedByBendahara: int("reviewed_by_bendahara" , { unsigned: true }).references(() => users.id),
  reviewedByBendaharaAt: datetime("reviewed_by_bendahara_at"),
  
  approvedBy: int("approved_by" , { unsigned: true }).references(() => users.id),
  approvedAt: datetime("approved_at"),
  
  // Rejection
  rejectedBy: int("rejected_by" , { unsigned: true }).references(() => users.id),
  rejectedAt: datetime("rejected_at"),
  rejectionReason: text("rejection_reason"),
  
  // Payment info
  paymentMethod: varchar("payment_method", { length: 100 }),
  paymentProofUrl: varchar("payment_proof_url", { length: 500 }),
  notes: text("notes"),
  
  // Reference to cash flow
  cashFlowId: int("cash_flow_id"), // Reference to transactions table
  
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
// Table: feedback (already exists, just ensure it's complete)
export const feedback = mysqlTable("feedback", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 255 }).notNull(),
  message: text("message").notNull(),
  
  status: mysqlEnum("status", ["new", "read", "replied"]).notNull().default("new"),
  reply: text("reply"), // Admin reply
  readBy: int("read_by" , { unsigned: true }).references(() => users.id),
  readAt: datetime("read_at"),
  repliedBy: int("replied_by" , { unsigned: true }).references(() => users.id),
  repliedAt: datetime("replied_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;


//==================== FAQ ===================
// Table: faqs (NEW)
export const faqs = mysqlTable("faqs", {
  id: int("id").primaryKey().autoincrement(),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }).notNull().default("Umum"),
  displayOrder: int("display_order").notNull().default(0),
  isActive: int("is_active").notNull().default(1), // 1 = active, 0 = inactive
  
  createdBy: int("created_by" , { unsigned: true }).notNull().references(() => users.id),
  updatedBy: int("updated_by" , { unsigned: true }).references(() => users.id),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const insertFAQSchema = createInsertSchema(faqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type FAQ = typeof faqs.$inferSelect;
export type InsertFAQ = z.infer<typeof insertFAQSchema>;

// ==================== PURCHASE ORDERS ====================
export const purchaseOrders = mysqlTable("purchase_orders", {
  id: int("id").primaryKey().autoincrement(),
  poNumber: varchar("po_number", { length: 50 }).notNull().unique(), // PO/DDMMYYYY/XXX
  category: mysqlEnum("category", ["material", "tenaga_kerja", "operasional", "lainnya"]).notNull(),
  totalAmount: decimal("total_amount", { precision: 15, scale: 2 }).notNull().default("0"),
  
  // Status workflow
  status: mysqlEnum("status", [
    "draft",
    "pending_review",
    "approved_bendahara",
    "approved_ketua",
    "rejected"
  ]).notNull().default("draft"),
  
  // Creator tracking
  createdBy: int("created_by" , { unsigned: true }).notNull().references(() => users.id),
  createdByRole: mysqlEnum("created_by_role", ["tim_konstruksi", "tim_procurement"]).notNull(),
  
  // Approval tracking
  reviewedByBendahara: int("reviewed_by_bendahara" , { unsigned: true }).references(() => users.id),
  reviewedByBendaharaAt: datetime("reviewed_by_bendahara_at"),
  
  approvedByKetua: int("approved_by_ketua" , { unsigned: true }).references(() => users.id),
  approvedByKetuaAt: datetime("approved_by_ketua_at"),
  
  // Rejection
  rejectedBy: int("rejected_by" , { unsigned: true }).references(() => users.id),
  rejectedAt: datetime("rejected_at"),
  rejectionReason: text("rejection_reason"),
  
  // Metadata
  notes: text("notes"),
  cashFlowId: int("cash_flow_id"), // Reference to transactions table after approved
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PurchaseOrder = typeof purchaseOrders.$inferSelect;
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;

// ==================== PO ITEMS ====================
export const poItems = mysqlTable("po_items", {
  id: int("id").primaryKey().autoincrement(),
  poId: int("po_id").notNull().references(() => purchaseOrders.id, { onDelete: "cascade" }),
  
  itemName: varchar("item_name", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  unit: varchar("unit", { length: 50 }).notNull(), // pcs, kg, m3, dll
  
  unitPrice: decimal("unit_price", { precision: 15, scale: 2 }), // Nullable untuk tim_konstruksi
  totalPrice: decimal("total_price", { precision: 15, scale: 2 }), // quantity * unit_price
  
  isSelectedByBendahara: int("is_selected_by_bendahara").notNull().default(1), // 1 = selected, 0 = unselected
  notes: text("notes"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export const insertPOItemSchema = createInsertSchema(poItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type POItem = typeof poItems.$inferSelect;
export type InsertPOItem = z.infer<typeof insertPOItemSchema>;
