// hash-passwords.js
import bcrypt from 'bcryptjs';
import db from './config/db.js';

async function hashExistingPasswords() {
  try {
    console.log('🔐 Hashing existing passwords...');
    
    // Get all users with plain text passwords
    const [users] = await db.promise().query(
      'SELECT id, email, password FROM users WHERE password IS NOT NULL AND password != ""'
    );

    console.log(`📋 Found ${users.length} users to update`);

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        console.log(`✅ Password already hashed for user: ${user.email}`);
        continue;
      }

      // Hash the plain text password
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Update the user with hashed password
      await db.promise().query(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, user.id]
      );
      
      console.log(`✅ Hashed password for user: ${user.email}`);
    }

    console.log('🎉 All passwords hashed successfully!');
    
  } catch (error) {
    console.error('❌ Error hashing passwords:', error);
  } finally {
    process.exit();
  }
}

hashExistingPasswords();