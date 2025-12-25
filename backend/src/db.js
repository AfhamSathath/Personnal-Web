// db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Configuration with additional options
const poolConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "skillmatch",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  timezone: '+00:00', // Use UTC
  charset: 'utf8mb4', // Support emojis and special characters
  multipleStatements: false // Security: prevent SQL injection via multiple statements
};

// Create connection pool
export const db = mysql.createPool(poolConfig);

// Test connection with better diagnostics
export const testConnection = async () => {
  try {
    const connection = await db.getConnection();
    console.log("✅ Connected to MySQL successfully!");
    console.log(`📊 Database: ${poolConfig.database}`);
    console.log(`🌐 Host: ${poolConfig.host}`);
    
    // Test query to verify database structure
    const [rows] = await connection.query("SELECT VERSION() as version");
    console.log(`🔧 MySQL Version: ${rows[0].version}`);
    
    // Check if personnel table exists and show structure
    try {
      const [tables] = await connection.query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = ? 
        AND TABLE_NAME = 'personnel'
      `, [poolConfig.database]);
      
      if (tables.length > 0) {
        console.log("✅ Personnel table exists");
        
      
        
        
        // Check for any data issues
        const [data] = await connection.query("SELECT COUNT(*) as count, MIN(id) as minId, MAX(id) as maxId FROM personnel");
        console.log("📊 Personnel data summary:", data[0]);
        
        // Check AUTO_INCREMENT value
        const [status] = await connection.query("SHOW TABLE STATUS LIKE 'personnel'");
        console.log("🔢 AUTO_INCREMENT value:", status[0].Auto_increment);
      } else {
        console.log("⚠️ Personnel table does not exist");
      }
    } catch (tableError) {
      console.log("⚠️ Could not check table structure:", tableError.message);
    }
    
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ MySQL connection failed:", error.message);
    console.error("Error code:", error.code);
    console.error("Error number:", error.errno);
    console.error("SQL State:", error.sqlState);
    
    // Provide troubleshooting tips
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log("💡 Hint: Database might not exist. Create it with:");
      console.log(`   CREATE DATABASE ${poolConfig.database};`);
      console.log(`   USE ${poolConfig.database};`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log("💡 Hint: Check your username and password");
      console.log("   Current user:", poolConfig.user);
    } else if (error.code === 'ER_HOST_NOT_PRIVILEGED' || error.code === 'ECONNREFUSED') {
      console.log("💡 Hint: MySQL might not be running or host is incorrect");
      console.log("   Try: sudo service mysql start (on Linux/Mac)");
      console.log("   Or: net start MySQL (on Windows)");
    }
    
    return false;
  }
};

// Function to fix the duplicate ID issue
export const fixDuplicateIdIssue = async () => {
  let connection;
  try {
    connection = await db.getConnection();
    
    console.log("🔧 Attempting to fix duplicate ID issue...");
    
    // Step 1: Check for id = 0
    const [zeroIdRows] = await connection.query("SELECT * FROM personnel WHERE id = 0");
    
    if (zeroIdRows.length > 0) {
      console.log(`⚠️ Found ${zeroIdRows.length} record(s) with id = 0`);
      
      // Step 2: Find the maximum id
      const [maxResult] = await connection.query("SELECT MAX(id) as maxId FROM personnel");
      const maxId = maxResult[0].maxId || 0;
      const newId = maxId + 1;
      
      console.log(`🔄 Changing id = 0 to id = ${newId}`);
      
      // Step 3: Update the record(s) with id = 0
      await connection.query("UPDATE personnel SET id = ? WHERE id = 0", [newId]);
      
      // Step 4: Set AUTO_INCREMENT properly
      await connection.query("ALTER TABLE personnel AUTO_INCREMENT = ?", [newId + 1]);
      
      console.log("✅ Fixed duplicate ID issue");
      return { fixed: true, newId, nextAutoIncrement: newId + 1 };
    } else {
      console.log("✅ No records found with id = 0");
      
      // Still ensure AUTO_INCREMENT is set properly
      const [maxResult] = await connection.query("SELECT MAX(id) as maxId FROM personnel");
      const maxId = maxResult[0].maxId || 0;
      
      if (maxId > 0) {
        await connection.query("ALTER TABLE personnel AUTO_INCREMENT = ?", [maxId + 1]);
        console.log(`✅ Set AUTO_INCREMENT to ${maxId + 1}`);
      }
      
      return { fixed: false, message: "No duplicate ID found" };
    }
  } catch (error) {
    console.error("❌ Error fixing duplicate ID:", error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
};

// Initialize connection on import
testConnection().then(isConnected => {
  if (isConnected) {
    // Try to fix the duplicate ID issue automatically on startup
    fixDuplicateIdIssue().catch(err => {
      console.error("Failed to auto-fix duplicate ID:", err.message);
    });
  }
});

export default db;