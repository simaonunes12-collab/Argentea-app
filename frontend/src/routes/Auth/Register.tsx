import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { PasswordField } from '../../components/PasswordField'
import { signUp } from '../../services/auth'

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function isValidEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    if (password !== confirmPassword) {
      setError('As palavras-passe não coincidem.')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Introduza um email válido.')
      return
    }

    if (password.length < 8) {
      setError('A palavra-passe deve ter pelo menos 8 caracteres.')
      return
    }

    try {
      setIsSubmitting(true)
      await signUp(trimmedName, trimmedEmail, password)

      setSuccessMessage(
        'Enviámos um email de confirmação. Confirme a sua conta para aceder à área do colaborador.',
      )
      setName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Não foi possível criar a conta. Tente novamente mais tarde.'

      // Mensagens mais amigáveis para alguns erros comuns
      if (message.toLowerCase().includes('already registered')) {
        setError('Este email já se encontra registado. Tente fazer login ou recuperar a password.')
      } else {
        setError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  return (
    <section className="page page--auth">
      <header className="page-header">
        <h1>Criar conta de colaborador</h1>
        <p>
          Crie a sua conta para aceder à área do colaborador e acompanhar as formações de segurança
          da sua empresa.
        </p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="name">
            Nome completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="form-input"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>

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
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="password">
            Palavra-passe
          </label>
          <PasswordField
            id="password"
            name="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
          />
          <p className="field-hint">Mínimo de 8 caracteres.</p>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="confirmPassword">
            Repetir palavra-passe
          </label>
          <PasswordField
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            aria-invalid={passwordsMismatch}
            aria-describedby={
              passwordsMismatch ? 'confirm-password-mismatch' : undefined
            }
          />
          {passwordsMismatch && (
            <p id="confirm-password-mismatch" className="field-hint form-message--error">
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
            {isSubmitting ? 'A criar conta…' : 'Criar conta'}
          </button>
          <p className="form-secondary-link">
            Já tem conta?{' '}
            <Link to="/" className="form-link">
              Entrar
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

