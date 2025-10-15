-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `bank_accounts` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`bank_name` varchar(100) NOT NULL,
	`account_number` varchar(50) NOT NULL,
	`account_holder` varchar(255) NOT NULL,
	`is_active` int(11) NOT NULL DEFAULT 1,
	`display_order` int(11) NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`donor_name` varchar(255) NOT NULL,
	`donor_email` varchar(255) DEFAULT 'NULL',
	`donor_phone` varchar(50) DEFAULT 'NULL',
	`amount` decimal(15,2) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT '''pending''',
	`approved_by` int(11) DEFAULT 'NULL',
	`approved_at` datetime DEFAULT 'NULL',
	`rejected_by` int(11) DEFAULT 'NULL',
	`rejected_at` datetime DEFAULT 'NULL',
	`rejection_reason` text DEFAULT 'NULL',
	`payment_method` varchar(100) DEFAULT 'NULL',
	`payment_proof_url` varchar(500) DEFAULT 'NULL',
	`notes` text DEFAULT 'NULL',
	`donation_date` datetime NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) DEFAULT 'NULL',
	`phone` varchar(50) DEFAULT 'NULL',
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','read','replied') NOT NULL DEFAULT '''new''',
	`read_by` int(11) DEFAULT 'NULL',
	`read_at` datetime DEFAULT 'NULL',
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`image_url` varchar(500) DEFAULT 'NULL',
	`status` enum('draft','published') NOT NULL DEFAULT '''draft''',
	`published_at` datetime DEFAULT 'NULL',
	`author_id` int(11) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`category` enum('update-pembangunan','kegiatan','pengumuman') NOT NULL DEFAULT '''pengumuman''',
	CONSTRAINT `news_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`type` enum('pemasukan','pengeluaran') NOT NULL,
	`category` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`amount` decimal(15,2) NOT NULL,
	`status` enum('draft','pending','approved_bendahara','approved','rejected') NOT NULL DEFAULT '''draft''',
	`created_by` int(11) NOT NULL,
	`created_by_team` enum('admin','tim_konstruksi','tim_procurement') NOT NULL,
	`approved_by_bendahara` int(11) DEFAULT 'NULL',
	`approved_by_ketua_at` datetime DEFAULT 'NULL',
	`approved_by_ketua` int(11) DEFAULT 'NULL',
	`approved_at` datetime DEFAULT 'NULL',
	`rejected_by` int(11) DEFAULT 'NULL',
	`rejected_at` datetime DEFAULT 'NULL',
	`rejection_reason` text DEFAULT 'NULL',
	`transaction_date` datetime NOT NULL,
	`receipt_url` varchar(500) DEFAULT 'NULL',
	`notes` text DEFAULT 'NULL',
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `transaction_approvals` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`transaction_id` int(11) NOT NULL,
	`approver_user_id` int(11) NOT NULL,
	`approver_role` enum('bendahara','ketua') NOT NULL,
	`action` enum('approved','rejected') NOT NULL,
	`comments` text DEFAULT 'NULL',
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()'
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int(11) AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`role` enum('admin','bendahara','ketua','tim_konstruksi','tim_procurement') NOT NULL DEFAULT '''admin''',
	`is_active` int(11) NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	`updated_at` timestamp NOT NULL DEFAULT 'current_timestamp()',
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `donations` ADD CONSTRAINT `donations_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `donations` ADD CONSTRAINT `donations_rejected_by_users_id_fk` FOREIGN KEY (`rejected_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_read_by_users_id_fk` FOREIGN KEY (`read_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `news` ADD CONSTRAINT `news_author_id_users_id_fk` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_approved_by_bendahara_users_id_fk` FOREIGN KEY (`approved_by_bendahara`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_approved_by_ketua_users_id_fk` FOREIGN KEY (`approved_by_ketua`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_created_by_users_id_fk` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_rejected_by_users_id_fk` FOREIGN KEY (`rejected_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction_approvals` ADD CONSTRAINT `transaction_approvals_approver_user_id_users_id_fk` FOREIGN KEY (`approver_user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `transaction_approvals` ADD CONSTRAINT `transaction_approvals_transaction_id_transactions_id_fk` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON DELETE no action ON UPDATE no action;
*/