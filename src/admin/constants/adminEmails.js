// Admin emails from environment variable
// Set VITE_ADMIN_EMAILS in .env file (comma-separated)
// Example: VITE_ADMIN_EMAILS=admin1@gmail.com,admin2@gmail.com

const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || "";

export const ADMIN_EMAILS = adminEmailsEnv
  .split(",")
  .map(email => email.trim().toLowerCase())
  .filter(email => email.length > 0);
