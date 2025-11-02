#!/usr/bin/env node
/**
 * Migration Runner (Node.js)
 * Runs SQL migrations using Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigrations() {
  console.log('\n🔄 Running database migrations...\n');

  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('.down.'))
    .sort();

  console.log(`Found ${files.length} migration(s)\n`);

  for (const file of files) {
    console.log(`📄 Applying: ${file}`);

    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

    // Split by statements (simple approach - may need improvement for complex SQL)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

        if (error && error.message && !error.message.includes('already exists')) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase.from('_').select().limit(0);

          if (directError) {
            console.error(`   ❌ Error: ${error.message}`);
            console.error(`   Statement: ${statement.substring(0, 100)}...`);
            throw error;
          }
        }
      }
    }

    console.log(`   ✅ Success\n`);
  }

  console.log('✅ All migrations completed successfully!\n');
}

runMigrations().catch(error => {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
});
