import { db } from '../src/utils/db';
import { users } from '../src/schemas';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';
import { stdin as input, stdout as output } from 'process';

const rl = readline.createInterface({ input, output });

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function createAdmin() {
  try {
    console.log('🚀 Création du compte administrateur...');
    
    const adminEmail = 'admin@bloodsky.fr';
    
    const existingAdmin = await db.select()
      .from(users)
      .where(eq(users.email, adminEmail))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      console.log('⚠️ Le compte administrateur existe déjà!');
      rl.close();
      return;
    }
    
    const password = await question('Entrez le mot de passe pour l\'administrateur: ');
    if (!password || password.length < 8) {
      console.log('❌ Le mot de passe doit contenir au moins 8 caractères');
      rl.close();
      return;
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    await db.insert(users).values({
      userId,
      email: adminEmail,
      password: hashedPassword,
      userName: 'Admin',
      userFirstname: 'BloodSky',
      userStatus: 'active',
    });
    
    console.log('✅ Compte administrateur créé avec succès!');
    console.log(`Email: ${adminEmail}`);
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  } finally {
    rl.close();
    process.exit();
  }
}

createAdmin();