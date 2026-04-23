CREATE DATABASE IF NOT EXISTS `study_points`;
USE `study_points`;

-- Drop old tables first (safe order for FK constraints)
DROP TABLE IF EXISTS `exams`;
DROP TABLE IF EXISTS `quizzes`;
DROP TABLE IF EXISTS `point_histories`;
DROP TABLE IF EXISTS `messages`;
DROP TABLE IF EXISTS `documents`;
DROP TABLE IF EXISTS `sessions`;
DROP TABLE IF EXISTS `users`;

-- ══════════════════════════════════════════════════════════════
-- MIGRATION for existing databases (run once manually):
--   ALTER TABLE users
--     CHANGE COLUMN streak current_streak INT NOT NULL DEFAULT 0,
--     ADD COLUMN longest_streak INT NOT NULL DEFAULT 0 AFTER current_streak,
--     CHANGE COLUMN last_login_date last_activity_date DATE DEFAULT NULL;
--   ALTER TABLE point_histories
--     MODIFY COLUMN type ENUM('quiz','exam','streak','login','onboarding','study','redemption','streak_bonus','quiz_correct','exam_bonus') NOT NULL;
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `level` VARCHAR(100) DEFAULT NULL,
  `goal` VARCHAR(255) DEFAULT NULL,
  `daily_time_commitment` VARCHAR(100) DEFAULT NULL,
  `plan` ENUM('free', 'premium', 'weekly', 'monthly', 'yearly') NOT NULL DEFAULT 'free',
  `plan_expiry_date` DATETIME DEFAULT NULL,
  `points` INT NOT NULL DEFAULT 0,
  `current_streak` INT NOT NULL DEFAULT 0,
  `longest_streak` INT NOT NULL DEFAULT 0,
  `last_activity_date` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(120) NOT NULL,
  `document_url` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sessions_user_id` (`user_id`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `documents` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `filename` VARCHAR(255) DEFAULT NULL,
  `mime_type` VARCHAR(100) DEFAULT NULL,
  `text_content` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_documents_user_id` (`user_id`),
  CONSTRAINT `fk_documents_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `session_id` INT NOT NULL,
  `role` ENUM('user', 'ai') NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_messages_session_id` (`session_id`),
  CONSTRAINT `fk_messages_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `point_histories` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `type` ENUM('quiz', 'exam', 'streak', 'login', 'onboarding', 'study', 'redemption', 'streak_bonus', 'quiz_correct', 'exam_bonus') NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `amount` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_point_histories_user_id` (`user_id`),
  CONSTRAINT `fk_point_histories_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS `quizzes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `session_id` INT DEFAULT NULL,
  `quiz_data` JSON NOT NULL,
  `score` INT NOT NULL DEFAULT 0,
  `total_questions` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_quizzes_user_id` (`user_id`),
  KEY `idx_quizzes_session_id` (`session_id`),
  CONSTRAINT `fk_quizzes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quizzes_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS `exams` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `session_id` INT DEFAULT NULL,
  `exam_data` JSON NOT NULL,
  `score` INT NOT NULL DEFAULT 0,
  `total_questions` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_exams_user_id` (`user_id`),
  KEY `idx_exams_session_id` (`session_id`),
  CONSTRAINT `fk_exams_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_exams_session` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE SET NULL
);