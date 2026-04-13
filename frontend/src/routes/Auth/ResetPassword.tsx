import { type FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PasswordField } from '../../components/PasswordField'
import {
  clearPasswordRecoveryStorage,
  getAuthSession,
  markPasswordRecoveryPending,
  onAuthStateChange,
  readPasswordRecoveryPending,
  resetPassword,
  updatePassword,
} from '../../services/auth'

export function ResetPassword() {
  const navigate = useNavigate()

  const [inRecoveryFlow, setInRecoveryFlow] = useState(() => readPasswordRecoveryPending())

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const { data } = onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        markPasswordRecoveryPending()
        setInRecoveryFlow(true)
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const session = await getAuthSession()
        if (cancelled) return
        if (readPasswordRecoveryPending() && !session) {
          clearPasswordRecoveryStorage()
          setInRecoveryFlow(false)
        }
      } catch {
        if (cancelled) return
        if (readPasswordRecoveryPending()) {
          clearPasswordRecoveryStorage()
          setInRecoveryFlow(false)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  function isValidEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value)
  }

  const passwordsMismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword

  async function handleRequestEmail(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('Introduza o email associado à sua conta.')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Introduza um email válido.')
      return
    }

    try {
      setIsSubmitting(true)
      await resetPassword(trimmedEmail)

      setSuccessMessage(
        'Se o email estiver registado, irá receber em breve um email com instruções para definir uma nova palavra-passe.',
      )
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível processar o pedido. Tente novamente mais tarde.'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSetNewPassword(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!newPassword || !confirmPassword) {
      setError('Preencha a nova palavra-passe e a confirmação.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As palavras-passe não coincidem.')
      return
    }

    if (newPassword.length < 8) {
      setError('A palavra-passe deve ter pelo menos 8 caracteres.')
      return
    }

    try {
      setIsSubmitting(true)
      await updatePassword(newPassword)
      clearPasswordRecoveryStorage()
      navigate('/inicio', { replace: true })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível atualizar a palavra-passe. Tente novamente.'

      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (inRecoveryFlow) {
    return (
      <section className="page page--auth">
        <header className="page-header">
          <h1>Definir nova palavra-passe</h1>
          <p>Escolha uma nova palavra-passe para a sua conta.</p>
        </header>

        <form className="auth-form" onSubmit={handleSetNewPassword} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="newPassword">
              Nova palavra-passe
            </label>
            <PasswordField
              id="newPassword"
              name="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength={8}
            />
            <p className="field-hint">Mínimo de 8 caracteres.</p>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="confirmNewPassword">
              Confirmar palavra-passe
            </label>
            <PasswordField
              id="confirmNewPassword"
              name="confirmNewPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={8}
              aria-invalid={passwordsMismatch}
              aria-describedby={
                passwordsMismatch ? 'reset-confirm-password-mismatch' : undefined
              }
            />
            {passwordsMismatch && (
              <p id="reset-confirm-password-mismatch" className="field-hint form-message--error">
                As palavras-passe não coincidem.
              </p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="button button--primary"
              disabled={isSubmitting || passwordsMismatch}
            >
              {isSubmitting ? 'A guardar…' : 'Guardar nova palavra-passe'}
            </button>
            <p className="form-secondary-link">
              <Link to="/" className="form-link">
                Voltar ao login
              </Link>
            </p>
          </div>

          <div className="form-messages" aria-live="polite">
            {error && <p className="form-message form-message--error">{error}</p>}
            {successMessage && (
              <p className="form-message form-message--success">{successMessage}</p>
            )}
          </div>
        </form>
      </section>
    )
  }

  return (
    <section className="page page--auth">
      <header className="page-header">
        <h1>Recuperar palavra-passe</h1>
        <p>
          Introduza o email associado à sua conta para receber um link de recuperação de
          palavra-passe.
        </p>
      </header>

      <form className="auth-form" onSubmit={handleRequestEmail} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <p className="field-hint">
            Vamos enviar um email apenas se existir uma conta associada a este endereço.
          </p>
        </div>

        <div className="form-actions">
          <button type="submit" className="button button--primary" disabled={isSubmitting}>
            {isSubmitting ? 'A enviar email…' : 'Enviar link de recuperação'}
          </button>
          <p className="form-secondary-link">
            Lembrou-se da password?{' '}
            <Link to="/" className="form-link">
              Voltar ao login
            </Link>
          </p>
        </div>

        <div className="form-messages" aria-live="polite">
          {error && <p className="form-message form-message--error">{error}</p>}
          {successMessage && (
            <p className="form-message form-message--success">{successMessage}</p>
          )}
        </div>
      </form>
    </section>
  )
}
