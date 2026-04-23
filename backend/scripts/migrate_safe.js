import pool from '../db.js';

async function migrateSafe() {
  console.log('Checking and creating missing tables...');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`documents\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`user_id\` INT NOT NULL,
        \`filename\` VARCHAR(255) DEFAULT NULL,
        \`mime_type\` VARCHAR(100) DEFAULT NULL,
        \`text_content\` LONGTEXT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_documents_user_id\` (\`user_id\`),
        CONSTRAINT \`fk_documents_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      );
    `);
    console.log('Ensured documents table exists.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`point_histories\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`user_id\` INT NOT NULL,
        \`type\` ENUM('quiz', 'exam', 'streak', 'login', 'onboarding', 'study', 'redemption') NOT NULL,
        \`label\` VARCHAR(255) NOT NULL,
        \`amount\` INT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_point_histories_user_id\` (\`user_id\`),
        CONSTRAINT \`fk_point_histories_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
      );
    `);
    console.log('Ensured point_histories table exists.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`quizzes\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`user_id\` INT NOT NULL,
        \`session_id\` INT DEFAULT NULL,
        \`quiz_data\` JSON NOT NULL,
        \`score\` INT NOT NULL DEFAULT 0,
        \`total_questions\` INT NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_quizzes_user_id\` (\`user_id\`),
        KEY \`idx_quizzes_session_id\` (\`session_id\`),
        CONSTRAINT \`fk_quizzes_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_quizzes_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\` (\`id\`) ON DELETE SET NULL
      );
    `);
    console.log('Ensured quizzes table exists.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS \`exams\` (
        \`id\` INT NOT NULL AUTO_INCREMENT,
        \`user_id\` INT NOT NULL,
        \`session_id\` INT DEFAULT NULL,
        \`exam_data\` JSON NOT NULL,
        \`score\` INT NOT NULL DEFAULT 0,
        \`total_questions\` INT NOT NULL DEFAULT 0,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`),
        KEY \`idx_exams_user_id\` (\`user_id\`),
        KEY \`idx_exams_session_id\` (\`session_id\`),
        CONSTRAINT \`fk_exams_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`fk_exams_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\` (\`id\`) ON DELETE SET NULL
      );
    `);
    console.log('Ensured exams table exists.');
    
    // Also make sure session has document_url column
    try {
      await pool.query(`ALTER TABLE \`sessions\` ADD COLUMN \`document_url\` TEXT DEFAULT NULL;`);
      console.log('Added document_url to sessions.');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
         console.log('sessions table already has document_url column.');
      } else {
         console.warn('Could not add document_url to sessions:', e.message);
      }
    }

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

migrateSafe();
