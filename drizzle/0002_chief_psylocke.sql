CREATE TABLE `matching_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`profileType` enum('mentor','peer','expert','companion') NOT NULL,
	`traits` json,
	`availability` json,
	`visibility` enum('public','private','connections') NOT NULL DEFAULT 'private',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `matching_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `matching_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`profileId` int NOT NULL,
	`score` int NOT NULL,
	`dimensions` json,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `matching_scores_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_matching_user_profile` UNIQUE(`userId`,`profileId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`category` enum('system','match','insight','progress','reminder') NOT NULL DEFAULT 'system',
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`status` enum('unread','read','archived') NOT NULL DEFAULT 'unread',
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`readAt` timestamp,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onboarding_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`step` int NOT NULL,
	`status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
	`responses` json,
	`notes` text,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `onboarding_responses_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_onboarding_user_step` UNIQUE(`userId`,`step`)
);
--> statement-breakpoint
CREATE TABLE `progress_global` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`overallScore` int NOT NULL DEFAULT 0,
	`level` varchar(64),
	`streak` int NOT NULL DEFAULT 0,
	`milestones` json,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `progress_global_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_progress_user` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `second_brain_core` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`identity` json,
	`lifeContext` json,
	`goals` json,
	`strategies` json,
	`score` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `second_brain_core_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_second_brain_core_user` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `second_brain_domains` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`coreId` int,
	`domainKey` varchar(64) NOT NULL,
	`title` varchar(128) NOT NULL,
	`description` text,
	`status` enum('active','paused','archived') NOT NULL DEFAULT 'active',
	`priority` int NOT NULL DEFAULT 1,
	`metrics` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `second_brain_domains_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_domain_user_key` UNIQUE(`userId`,`domainKey`)
);
--> statement-breakpoint
CREATE TABLE `second_brain_micro_modules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`domainId` int,
	`moduleKey` varchar(64) NOT NULL,
	`title` varchar(128) NOT NULL,
	`depth` int NOT NULL DEFAULT 1,
	`status` enum('draft','active','completed','archived') NOT NULL DEFAULT 'draft',
	`triggers` json,
	`state` json,
	`progress` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `second_brain_micro_modules_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_micro_modules_user_key` UNIQUE(`userId`,`moduleKey`)
);
--> statement-breakpoint
CREATE TABLE `timeline` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('insight','module','goal','notification','checkin','system') NOT NULL DEFAULT 'system',
	`entityType` varchar(64),
	`entityId` int,
	`payload` json,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timeline_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`domainId` int,
	`source` enum('system','user','signal','analysis') NOT NULL DEFAULT 'system',
	`category` varchar(64) NOT NULL,
	`summary` text NOT NULL,
	`confidence` int NOT NULL DEFAULT 50,
	`details` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`insightId` int,
	`role` enum('user','assistant','system') NOT NULL DEFAULT 'user',
	`channel` enum('timeline','chat','notification','system') NOT NULL DEFAULT 'timeline',
	`content` text NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`locale` varchar(16) NOT NULL DEFAULT 'pt-BR',
	`timezone` varchar(64) NOT NULL DEFAULT 'UTC',
	`theme` enum('light','dark','system') NOT NULL DEFAULT 'system',
	`notificationsOptIn` boolean NOT NULL DEFAULT true,
	`preferences` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_settings_user` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `weekly_evolution` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`weekStart` date NOT NULL,
	`focus` text,
	`summary` text,
	`metrics` json,
	`sentiment` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weekly_evolution_id` PRIMARY KEY(`id`),
	CONSTRAINT `uq_weekly_period` UNIQUE(`userId`,`weekStart`)
);
--> statement-breakpoint
DROP TABLE `conversations`;--> statement-breakpoint
DROP TABLE `personalities`;--> statement-breakpoint
ALTER TABLE `matching_profiles` ADD CONSTRAINT `matching_profiles_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `matching_scores` ADD CONSTRAINT `matching_scores_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `matching_scores` ADD CONSTRAINT `matching_scores_profileId_matching_profiles_id_fk` FOREIGN KEY (`profileId`) REFERENCES `matching_profiles`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `onboarding_responses` ADD CONSTRAINT `onboarding_responses_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `progress_global` ADD CONSTRAINT `progress_global_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `second_brain_core` ADD CONSTRAINT `second_brain_core_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `second_brain_domains` ADD CONSTRAINT `second_brain_domains_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `second_brain_domains` ADD CONSTRAINT `second_brain_domains_coreId_second_brain_core_id_fk` FOREIGN KEY (`coreId`) REFERENCES `second_brain_core`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `second_brain_micro_modules` ADD CONSTRAINT `second_brain_micro_modules_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `second_brain_micro_modules` ADD CONSTRAINT `second_brain_micro_modules_domainId_second_brain_domains_id_fk` FOREIGN KEY (`domainId`) REFERENCES `second_brain_domains`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `timeline` ADD CONSTRAINT `timeline_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_insights` ADD CONSTRAINT `user_insights_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_insights` ADD CONSTRAINT `user_insights_domainId_second_brain_domains_id_fk` FOREIGN KEY (`domainId`) REFERENCES `second_brain_domains`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_messages` ADD CONSTRAINT `user_messages_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_messages` ADD CONSTRAINT `user_messages_insightId_user_insights_id_fk` FOREIGN KEY (`insightId`) REFERENCES `user_insights`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_settings` ADD CONSTRAINT `user_settings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `weekly_evolution` ADD CONSTRAINT `weekly_evolution_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_matching_user` ON `matching_profiles` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_matching_scores_user` ON `matching_scores` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_notifications_user` ON `notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_notifications_status` ON `notifications` (`status`);--> statement-breakpoint
CREATE INDEX `idx_onboarding_user` ON `onboarding_responses` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_domains_user` ON `second_brain_domains` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_domains_core` ON `second_brain_domains` (`coreId`);--> statement-breakpoint
CREATE INDEX `idx_micro_modules_user` ON `second_brain_micro_modules` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_micro_modules_domain` ON `second_brain_micro_modules` (`domainId`);--> statement-breakpoint
CREATE INDEX `idx_timeline_user` ON `timeline` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_timeline_event_type` ON `timeline` (`eventType`);--> statement-breakpoint
CREATE INDEX `idx_timeline_occurred` ON `timeline` (`occurredAt`);--> statement-breakpoint
CREATE INDEX `idx_insights_user` ON `user_insights` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_insights_domain` ON `user_insights` (`domainId`);--> statement-breakpoint
CREATE INDEX `idx_messages_user` ON `user_messages` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_messages_insight` ON `user_messages` (`insightId`);--> statement-breakpoint
CREATE INDEX `idx_messages_role` ON `user_messages` (`role`);--> statement-breakpoint
CREATE INDEX `idx_weekly_user` ON `weekly_evolution` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);