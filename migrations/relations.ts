import { relations } from "drizzle-orm/relations";
import { users, donations, feedback, news, transactions, transactionApprovals } from "./schema";

export const donationsRelations = relations(donations, ({one}) => ({
	user_approvedBy: one(users, {
		fields: [donations.approvedBy],
		references: [users.id],
		relationName: "donations_approvedBy_users_id"
	}),
	user_rejectedBy: one(users, {
		fields: [donations.rejectedBy],
		references: [users.id],
		relationName: "donations_rejectedBy_users_id"
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	donations_approvedBy: many(donations, {
		relationName: "donations_approvedBy_users_id"
	}),
	donations_rejectedBy: many(donations, {
		relationName: "donations_rejectedBy_users_id"
	}),
	feedbacks: many(feedback),
	news: many(news),
	transactions_approvedByBendahara: many(transactions, {
		relationName: "transactions_approvedByBendahara_users_id"
	}),
	transactions_approvedByKetua: many(transactions, {
		relationName: "transactions_approvedByKetua_users_id"
	}),
	transactions_createdBy: many(transactions, {
		relationName: "transactions_createdBy_users_id"
	}),
	transactions_rejectedBy: many(transactions, {
		relationName: "transactions_rejectedBy_users_id"
	}),
	transactionApprovals: many(transactionApprovals),
}));

export const feedbackRelations = relations(feedback, ({one}) => ({
	user: one(users, {
		fields: [feedback.readBy],
		references: [users.id]
	}),
}));

export const newsRelations = relations(news, ({one}) => ({
	user: one(users, {
		fields: [news.authorId],
		references: [users.id]
	}),
}));

export const transactionsRelations = relations(transactions, ({one, many}) => ({
	user_approvedByBendahara: one(users, {
		fields: [transactions.approvedByBendahara],
		references: [users.id],
		relationName: "transactions_approvedByBendahara_users_id"
	}),
	user_approvedByKetua: one(users, {
		fields: [transactions.approvedByKetua],
		references: [users.id],
		relationName: "transactions_approvedByKetua_users_id"
	}),
	user_createdBy: one(users, {
		fields: [transactions.createdBy],
		references: [users.id],
		relationName: "transactions_createdBy_users_id"
	}),
	user_rejectedBy: one(users, {
		fields: [transactions.rejectedBy],
		references: [users.id],
		relationName: "transactions_rejectedBy_users_id"
	}),
	transactionApprovals: many(transactionApprovals),
}));

export const transactionApprovalsRelations = relations(transactionApprovals, ({one}) => ({
	user: one(users, {
		fields: [transactionApprovals.approverUserId],
		references: [users.id]
	}),
	transaction: one(transactions, {
		fields: [transactionApprovals.transactionId],
		references: [transactions.id]
	}),
}));