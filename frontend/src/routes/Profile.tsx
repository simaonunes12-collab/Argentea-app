import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getAvatarSignedUrl,
  getCurrentUser,
  getMyProfile,
  signOut,
  updatePassword,
  uploadAvatar,
  upsertMyProfile,
} from '../services/auth'
import { appContent } from '../config/content'

export function Profile() {
  const { title, description } = appContent.profile
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setLoadingProfile(true)
      setError(null)
      try {
        const user = await getCurrentUser()
        const profile = await getMyProfile()

        if (!active) return

        const displayName = profile?.name ?? (user.user_metadata?.name as string | undefined) ?? ''
        setName(displayName)

        if (profile?.avatar_path) {
          const signedUrl = await getAvatarSignedUrl(profile.avatar_path)
          if (!active) return
          setAvatarSrc(signedUrl)
        } else {
          setAvatarSrc(null)
        }
      } catch (err) {
        if (!active) return
        const nextError = err instanceof Error ? err.message : 'Não foi possível carregar o perfil.'
        setError(nextError)
      } finally {
        if (active) setLoadingProfile(false)
      }
    }

    void loadProfile()
    return () => {
      active = false
    }
  }, [])

  const handleAvatarChange = async (file: File | null) => {
    if (!file) return

    setError(null)
    setMessage(null)
    setSavingAvatar(true)
    try {
      const avatarPath = await uploadAvatar(file)
      await upsertMyProfile({ avatarPath })
      const signedUrl = await getAvatarSignedUrl(avatarPath)
      setAvatarSrc(signedUrl)
      setMessage('Avatar atualizado com sucesso.')
    } catch (err) {
      const nextError = err instanceof Error ? err.message : 'Não foi possível atualizar o avatar.'
      setError(nextError)
    } finally {
      setSavingAvatar(false)
    }
  }

  const handleSaveName = async (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    setError(null)
    setMessage(null)
    setSavingProfile(true)
    try {
      await upsertMyProfile({ name: trimmedName || null })
      setName(trimmedName)
      setMessage('Nome atualizado com sucesso.')
    } catch (err) {
      const nextError = err instanceof Error ? err.message : 'Não foi possível atualizar o nome.'
      setError(nextError)
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!newPassword) return
    if (newPassword !== confirmPassword) {
      setError('As palavras-passe não coincidem.')
      return
    }
    if (newPassword.length < 8) {
      setError('A palavra-passe deve ter pelo menos 8 caracteres.')
      return
    }

    setSavingPassword(true)
    try {
      await updatePassword(newPassword)
      setNewPassword('')
      setConfirmPassword('')
      setMessage('Password atualizada com sucesso.')
    } catch (err) {
      const nextError = err instanceof Error ? err.message : 'Não foi possível atualizar a password.'
      setError(nextError)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await signOut()
    } catch (err) {
      // Mesmo que falhe, redirecionamos para manter UX coerente.
      console.error(err)
    } finally {
      navigate('/', { replace: true })
    }
  }

  return (
    <section className="page page--profile">
      <div className="profile-layout">
        <header className="profile-header">
          <h1>{title}</h1>
          <p>{description}</p>
        </header>

        <div className="profile-card" aria-label="Dados do perfil">
          {loadingProfile && (
            <div className="form-messages" aria-live="polite">
              <p className="form-message">A carregar perfil...</p>
            </div>
          )}

          <div className="profile-avatar">
            {avatarSrc ? (
              <img className="profile-avatar-img" src={avatarSrc} alt="Avatar" />
            ) : (
              <div className="profile-avatar-fallback" aria-hidden="true" />
            )}

            <label className="button button--secondary profile-avatar-upload">
              {savingAvatar ? 'A guardar avatar...' : 'Alterar avatar'}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={savingAvatar}
                onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <form className="profile-form" onSubmit={handleSaveName}>
            <label className="field">
              <span className="field-label">Nome</span>
              <input
                className="field-input"
                value={name}
                placeholder="O seu nome"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <button
              type="submit"
              className="button button--primary profile-submit-btn"
              disabled={savingProfile}
            >
              {savingProfile ? 'A guardar nome...' : 'Guardar Alterações'}
            </button>
          </form>

          <form className="profile-password" onSubmit={handleUpdatePassword}>
            <label className="field">
              <span className="field-label">Nova palavra-passe</span>
              <input
                className="field-input"
                type="password"
                value={newPassword}
                placeholder="••••••••"
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>

            <label className="field">
              <span className="field-label">Confirmar palavra-passe</span>
              <input
                className="field-input"
                type="password"
                value={confirmPassword}
                placeholder="••••••••"
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </label>

            <button
              type="submit"
              className="button button--primary profile-submit-btn"
              disabled={savingPassword || !newPassword}
            >
              {savingPassword ? 'A atualizar...' : 'Atualizar password'}
            </button>
          </form>

          <div className="form-messages" aria-live="polite">
            {error && <p className="form-message form-message--error">{error}</p>}
            {message && <p className="form-message form-message--success">{message}</p>}
          </div>

          <div className="profile-actions">
            <button
              type="button"
              className="button button--secondary profile-logout"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? 'A sair...' : 'Logout'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}


