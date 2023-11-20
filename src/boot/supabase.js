import { boot } from 'quasar/wrappers'
import { createClient } from '@supabase/supabase-js'

const options = {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
}

// Create a single supabase client for interacting with your database
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  options
)

export default boot(({ app }) => {
  app.config.globalProperties.$supabase = supabase
})

export { supabase }
