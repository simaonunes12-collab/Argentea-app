import {
  createClient,
  type AuthChangeEvent,
  type Session,
  type SupabaseClient,
} from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set',
  )
}

let supabaseClient: SupabaseClient | null = null
const AVATAR_BUCKET = 'avatars'

function getSupabaseClient(): SupabaseClient {
  if (!supabaseClient) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return supabaseClient
}

type ProfileRecord = {
  id: string
  name: string | null
  avatar_path: string | null
}

export type CourseRecord = {
  id: string
  title: string
  short_description: string
  long_description: string | null
  image_url: string | null
  contact_email: string | null
  contact_phone: string | null
  sort_order: number
  target_audience: string | null
  duration: string | null
  price_label: string | null
}

type ProductRecord = {
  id: string
  name: string
  short_description: string
  long_description: string | null
  image_url: string | null
  price_cents: number
  currency: string
  stock: number
  sort_order: number
}

export async function signUp(name: string, email: string, password: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${window.location.origin}/auth/reset-password`,
    },
  })

  if (error) {
    throw error
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function resetPassword(email: string) {
  const supabase = getSupabaseClient()

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  })

  if (error) {
    throw error
  }

  return data
}

/** Marca o fluxo “definir nova palavra-passe” após link do email (sessionStorage). */
export const PASSWORD_RECOVERY_STORAGE_KEY = 'argentea-password-recovery'

export function clearPasswordRecoveryStorage() {
  try {
    sessionStorage.removeItem(PASSWORD_RECOVERY_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function markPasswordRecoveryPending() {
  try {
    sessionStorage.setItem(PASSWORD_RECOVERY_STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function readPasswordRecoveryPending(): boolean {
  try {
    return sessionStorage.getItem(PASSWORD_RECOVERY_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  return getSupabaseClient().auth.onAuthStateChange(callback)
}

export async function getAuthSession() {
  const { data, error } = await getSupabaseClient().auth.getSession()
  if (error) {
    throw error
  }
  return data.session
}

export async function signOut() {
  const supabase = getSupabaseClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

export async function getCurrentUser() {
  const supabase = getSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error('Sessão inválida. Inicie sessão novamente.')
  }

  return user
}

export async function getMyProfile() {
  const supabase = getSupabaseClient()
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, avatar_path')
    .eq('id', user.id)
    .maybeSingle<ProfileRecord>()

  if (error) {
    throw error
  }

  return data
}

export async function upsertMyProfile(payload: { name?: string | null; avatarPath?: string | null }) {
  const supabase = getSupabaseClient()
  const user = await getCurrentUser()

  const profileUpdate: { id: string; name?: string | null; avatar_path?: string | null } = { id: user.id }

  if (payload.name !== undefined) {
    profileUpdate.name = payload.name
  }
  if (payload.avatarPath !== undefined) {
    profileUpdate.avatar_path = payload.avatarPath
  }

  const { error } = await supabase.from('profiles').upsert(profileUpdate)

  if (error) {
    throw error
  }
}

function getFileExtension(file: File) {
  const fromType = file.type.split('/')[1]
  if (fromType) return fromType

  const parts = file.name.split('.')
  const fromName = parts[parts.length - 1]
  return fromName || 'png'
}

export async function uploadAvatar(file: File) {
  const supabase = getSupabaseClient()
  const user = await getCurrentUser()
  const extension = getFileExtension(file)
  const filePath = `${user.id}/avatar-${Date.now()}.${extension}`

  const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(filePath, file, {
    upsert: false,
  })

  if (error) {
    throw error
  }

  return filePath
}

export async function getAvatarSignedUrl(path: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.storage.from(AVATAR_BUCKET).createSignedUrl(path, 60 * 60)

  if (error) {
    throw error
  }

  return data.signedUrl
}

export async function updatePassword(newPassword: string) {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    throw error
  }

  return data
}

function mapCourseRow(row: Record<string, unknown>): CourseRecord {
  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    short_description: String(row.short_description ?? ''),
    long_description: row.long_description != null ? String(row.long_description) : null,
    image_url: row.image_url != null ? String(row.image_url) : null,
    contact_email: row.contact_email != null ? String(row.contact_email) : null,
    contact_phone: row.contact_phone != null ? String(row.contact_phone) : null,
    sort_order: typeof row.sort_order === 'number' ? row.sort_order : Number(row.sort_order ?? 0),
    target_audience: row.target_audience != null ? String(row.target_audience) : null,
    duration: row.duration != null ? String(row.duration) : null,
    price_label: row.price_label != null ? String(row.price_label) : null,
  }
}

/**
 * Usa select('*') para não falhar quando faltam colunas opcionais (ex.: price_label).
 * Antes, uma coluna em falta na query "completa" ativava o fallback legacy e anulava
 * target_audience e duration mesmo estando preenchidos na base de dados.
 */
export async function getCourses(): Promise<CourseRecord[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []).map((row) => mapCourseRow(row as Record<string, unknown>))
}

export async function getProducts() {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('products')
    .select('id, name, short_description, long_description, image_url, price_cents, currency, stock, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .returns<ProductRecord[]>()

  if (error) {
    throw error
  }

  return data
}

