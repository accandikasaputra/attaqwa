import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, timestamp, foreignKey, decimal, mysqlEnum, datetime, text, unique } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const bankAccounts = mysqlTable("bank_accounts", {
	id: int().autoincrement().notNull(),
	bankName: varchar("bank_name", { length: 100 }).notNull(),
	accountNumber: varchar("account_number", { length: 50 }).notNull(),
	accountHolder: varchar("account_holder", { length: 255 }).notNull(),
	isActive: int("is_active").default(1).notNull(),
	displayOrder: int("display_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const donations = mysqlTable("donations", {
	id: int().autoincrement().notNull(),
	donorName: varchar("donor_name", { length: 255 }).notNull(),
	donorEmail: varchar("donor_email", { length: 255 }).default('NULL'),
	donorPhone: varchar("donor_phone", { length: 50 }).default('NULL'),
	amount: decimal({ precision: 15, scale: 2 }).notNull(),
	status: mysqlEnum(['pending','approved','rejected']).default('\'pending\'').notNull(),
	approvedBy: int("approved_by").default('NULL').references(() => users.id),
	approvedAt: datetime("approved_at", { mode: 'string'}).default('NULL'),
	rejectedBy: int("rejected_by").default('NULL').references(() => users.id),
	rejectedAt: datetime("rejected_at", { mode: 'string'}).default('NULL'),
	rejectionReason: text("rejection_reason").default('NULL'),
	paymentMethod: varchar("payment_method", { length: 100 }).default('NULL'),
	paymentProofUrl: varchar("payment_proof_url", { length: 500 }).default('NULL'),
	notes: text().default('NULL'),
	donationDate: datetime("donation_date", { mode: 'string'}).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const feedback = mysqlTable("feedback", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 255 }).default('NULL'),
	phone: varchar({ length: 50 }).default('NULL'),
	subject: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	status: mysqlEnum(['new','read','replied']).default('\'new\'').notNull(),
	readBy: int("read_by").default('NULL').references(() => users.id),
	readAt: datetime("read_at", { mode: 'string'}).default('NULL'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const news = mysqlTable("news", {
	id: int().autoincrement().notNull(),
	title: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	excerpt: text().notNull(),
	content: text().notNull(),
	imageUrl: varchar("image_url", { length: 500 }).default('NULL'),
	status: mysqlEnum(['draft','published']).default('\'draft\'').notNull(),
	publishedAt: datetime("published_at", { mode: 'string'}).default('NULL'),
	authorId: int("author_id").notNull().references(() => users.id),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	category: mysqlEnum(['update-pembangunan','kegiatan','pengumuman']).default('\'pengumuman\'').notNull(),
},
(table) => [
	unique("news_slug_unique").on(table.slug),
]);

export const transactions = mysqlTable("transactions", {
	id: int().autoincrement().notNull(),
	type: mysqlEnum(['pemasukan','pengeluaran']).notNull(),
	category: varchar({ length: 100 }).notNull(),
	description: text().notNull(),
	amount: decimal({ precision: 15, scale: 2 }).notNull(),
	status: mysqlEnum(['draft','pending','approved_bendahara','approved','rejected']).default('\'draft\'').notNull(),
	createdBy: int("created_by").notNull().references(() => users.id),
	createdByTeam: mysqlEnum("created_by_team", ['admin','tim_konstruksi','tim_procurement']).notNull(),
	approvedByBendahara: int("approved_by_bendahara").default('NULL').references(() => users.id),
	approvedByKetuaAt: datetime("approved_by_ketua_at", { mode: 'string'}).default('NULL'),
	approvedByKetua: int("approved_by_ketua").default('NULL').references(() => users.id),
	approvedAt: datetime("approved_at", { mode: 'string'}).default('NULL'),
	rejectedBy: int("rejected_by").default('NULL').references(() => users.id),
	rejectedAt: datetime("rejected_at", { mode: 'string'}).default('NULL'),
	rejectionReason: text("rejection_reason").default('NULL'),
	transactionDate: datetime("transaction_date", { mode: 'string'}).notNull(),
	receiptUrl: varchar("receipt_url", { length: 500 }).default('NULL'),
	notes: text().default('NULL'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const transactionApprovals = mysqlTable("transaction_approvals", {
	id: int().autoincrement().notNull(),
	transactionId: int("transaction_id").notNull().references(() => transactions.id),
	approverUserId: int("approver_user_id").notNull().references(() => users.id),
	approverRole: mysqlEnum("approver_role", ['bendahara','ketua']).notNull(),
	action: mysqlEnum(['approved','rejected']).notNull(),
	comments: text().default('NULL'),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
});

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }).notNull(),
	fullName: varchar("full_name", { length: 255 }).notNull(),
	role: mysqlEnum(['admin','bendahara','ketua','tim_konstruksi','tim_procurement']).default('\'admin\'').notNull(),
	isActive: int("is_active").default(1).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).default('current_timestamp()').notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).default('current_timestamp()').notNull(),
},
(table) => [
	unique("users_email_unique").on(table.email),
]);
