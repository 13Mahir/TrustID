const db = require('../config/db');

async function setupSchema() {
    console.log("🛠️  Initializing Database Schema...");

    /* 
       Note: We use IF NOT EXISTS. 
       However, for a fresh database (Vercel/PlanetScale), these will run.
       We match columns to server.js usage.
    */

    const queries = [
        // 1. Users
        `CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            unique_id VARCHAR(50) UNIQUE NOT NULL,
            role ENUM('Citizen', 'Service Provider', 'Government', 'Regulatory Authority', 'Admin') NOT NULL,
            full_name VARCHAR(150),
            email VARCHAR(150),
            password_hash VARCHAR(255),
            status ENUM('active', 'pending', 'suspended') DEFAULT 'pending',
            
            -- Profile Fields
            dob DATE,
            gender VARCHAR(20),
            address_city VARCHAR(100),
            address_state VARCHAR(100),
            
            -- Healthcare Fields
            health_id VARCHAR(50),
            blood_group VARCHAR(10),
            allergies TEXT,
            past_major_illnesses TEXT,
            current_medications TEXT,
            known_conditions TEXT,
            life_threatening_conditions TEXT,
            emergency_contact VARCHAR(100),
            insurance_policy_number VARCHAR(50),
            city_id VARCHAR(50),
            
            -- Vitals
            clinical_height VARCHAR(20),
            clinical_weight VARCHAR(20),
            clinical_vitals_date DATE,
            last_verification_date DATE,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        // 2. Sessions (Auth)
        `CREATE TABLE IF NOT EXISTS sessions (
            token VARCHAR(255) PRIMARY KEY,
            user_id INT NOT NULL,
            role VARCHAR(50) NOT NULL,
            ip_address VARCHAR(45),
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )`,

        // 3. OTP Sessions (Citizen Login)
        `CREATE TABLE IF NOT EXISTS otp_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            mobile_number VARCHAR(20) NOT NULL,
            otp_code VARCHAR(10) NOT NULL,
            expires_at DATETIME NOT NULL,
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        // 4. Two Factor Sessions (Entity Login)
        `CREATE TABLE IF NOT EXISTS two_factor_sessions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            actor_type VARCHAR(50) NOT NULL,
            actor_id VARCHAR(50) NOT NULL,
            verification_code VARCHAR(10) NOT NULL,
            expires_at DATETIME NOT NULL,
            is_verified BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        // 5. Consents (Core Governance)
        `CREATE TABLE IF NOT EXISTS consents (
            id VARCHAR(50) PRIMARY KEY, -- UUID
            owner_identity_id VARCHAR(50) NOT NULL, -- Citizen
            requester_identity_id VARCHAR(50) NOT NULL, -- Service Provider
            purpose VARCHAR(255) NOT NULL,
            service_type VARCHAR(100) DEFAULT 'General',
            allowed_attributes JSON NOT NULL,
            status ENUM('pending', 'active', 'revoked', 'expired') DEFAULT 'pending',
            valid_from DATETIME,
            valid_until DATETIME,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        // 6. Workflow Cases (Gov Services)
        `CREATE TABLE IF NOT EXISTS workflow_cases (
            id VARCHAR(50) PRIMARY KEY,
            type VARCHAR(100) NOT NULL,
            domain VARCHAR(100), -- Healthcare, Transport, etc.
            citizen_identity_id VARCHAR(50) NOT NULL,
            service_identity_id VARCHAR(50),     -- Initiator
            government_identity_id VARCHAR(50),  -- Reviewer
            purpose VARCHAR(255),
            required_attributes JSON,
            status ENUM('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED') DEFAULT 'SUBMITTED',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        // 7. Audit Logs
        `CREATE TABLE IF NOT EXISTS audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            actor_identity_id VARCHAR(50) NOT NULL,
            actor_role VARCHAR(50),
            target_identity_id VARCHAR(50),
            action_type VARCHAR(50) NOT NULL,
            purpose VARCHAR(255),
            accessed_attributes JSON,
            metadata JSON,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`,

        // 8. System Settings
        `CREATE TABLE IF NOT EXISTS system_settings (
            setting_key VARCHAR(100) PRIMARY KEY,
            setting_value TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
    ];

    try {
        const conn = await db.getConnection();

        for (const query of queries) {
            await conn.query(query);
            // Simple logging of creation (extracting table name)
            const match = query.match(/CREATE TABLE IF NOT EXISTS (\w+)/);
            if (match) console.log(`   ✅ Checked/Created Table: ${match[1]}`);
        }

        conn.release();
        console.log("\n✨ Schema Initialization Complete.");
        process.exit(0);

    } catch (err) {
        console.error("❌ Schema Setup Failed:", err);
        process.exit(1);
    }
}

setupSchema();
