'use server'

import { supabaseAdminDB, supabaseUserDB } from '@/lib/supabase'

interface RegisterResult {
  success: boolean
  message: string
}

export async function registerEmployee(formData: FormData): Promise<RegisterResult> {
  const namaLengkap = formData.get('nama_lengkap') as string
  const nik = formData.get('nik') as string
  const divisi = formData.get('divisi') as string
  const noHp = formData.get('no_hp') as string
  const pinLogin = formData.get('pin_login') as string

  if (!namaLengkap || !nik || !divisi || !noHp || !pinLogin) {
    return { success: false, message: 'Semua field wajib diisi.' }
  }

  if (pinLogin.length < 4 || pinLogin.length > 6) {
    return { success: false, message: 'PIN Login harus 4-6 digit.' }
  }

  try {
    // Step 1: Write to DB_USER.schema_batok.employees (so employee can login)
    const { data: employee, error: empError } = await supabaseUserDB
      .from('employees')
      .insert({
        nama_lengkap: namaLengkap,
        nik,
        tim_divisi: divisi,
        no_hp: noHp,
        pin_login: pinLogin,
        is_active: true,
      })
      .select('id')
      .single()

    if (empError) {
      console.error('Error inserting employee:', empError)
      return {
        success: false,
        message: `Gagal mendaftarkan karyawan: ${empError.message}`,
      }
    }

    // Step 2: Write log to DB_ADMIN.schema_batok.employee_registry_logs
    const { error: logError } = await supabaseAdminDB
      .from('employee_registry_logs')
      .insert({
        employee_user_id: employee.id,
        nama_lengkap: namaLengkap,
        nik,
        tim_divisi: divisi,
      })

    if (logError) {
      console.error('Error inserting registry log:', logError)
      return {
        success: true,
        message: 'Karyawan berhasil didaftarkan di DB_USER, namun log registrasi di DB_ADMIN gagal dicatat.',
      }
    }

    return {
      success: true,
      message: `Karyawan "${namaLengkap}" berhasil didaftarkan.`,
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    return { success: false, message: error?.message || 'Terjadi kesalahan sistem. Coba lagi.' }
  }
}

export async function fetchRegistryLogs() {
  const { data, error } = await supabaseAdminDB
    .from('employee_registry_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching registry logs:', error)
    return []
  }

  return data ?? []
}
