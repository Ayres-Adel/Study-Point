import pool from "../db.js";

async function main() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS documents (
      id INT NOT NULL AUTO_INCREMENT,
      user_id INT NOT NULL,
      filename VARCHAR(255) DEFAULT NULL,
      mime_type VARCHAR(100) DEFAULT NULL,
      text_content LONGTEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_documents_user_id (user_id),
      CONSTRAINT fk_documents_user
        FOREIGN KEY (user_id) REFERENCES users (id)
        ON DELETE CASCADE
    );
  `);

  console.log("OK: documents table ensured");
  await pool.end();
}

main().catch(async (err) => {
  console.error("Migration failed:", err);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});

