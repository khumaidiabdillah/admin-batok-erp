import { createClient } from '@supabase/supabase-js'

const adminUrl = process.env.NEXT_PUBLIC_DB_ADMIN_URL || 'https://placeholder.supabase.co'
const adminKey = process.env.DB_ADMIN_SERVICE_ROLE_KEY || 'placeholder-service-role-key'
const userUrl = process.env.NEXT_PUBLIC_DB_USER_URL || 'https://placeholder.supabase.co'
const userKey = process.env.DB_USER_SERVICE_ROLE_KEY || 'placeholder-service-role-key'

// Client for DB_ADMIN (Control Plane - verified data)
export const supabaseAdminDB = createClient(
  adminUrl,
  adminKey,
  { db: { schema: 'schema_batok' } }
)

// Client for DB_USER (Data Plane - raw employee data)
export const supabaseUserDB = createClient(
  userUrl,
  userKey,
  { db: { schema: 'schema_batok' } }
)
