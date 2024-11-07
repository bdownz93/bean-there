const { syncBeansToSupabase } = require('../lib/supabase')

async function main() {
  try {
    console.log('Starting database sync...')
    await syncBeansToSupabase()
    console.log('Database sync completed successfully!')
  } catch (error) {
    console.error('Error syncing database:', error)
    process.exit(1)
  }
}

main()