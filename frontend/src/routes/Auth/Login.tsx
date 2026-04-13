import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PasswordField } from '../../components/PasswordField'
import { signIn } from '../../services/auth'

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function isValidEmail(value: string) {
    return /\S+@\S+\.\S+/.test(value)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()

    if (!trimmedEmail || !password) {
      setError('Introduza o email e a palavra-passe.')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Introduza um email válido.')
      return
    }

    try {
      setIsSubmitting(true)
      await signIn(trimmedEmail, password)
      navigate('/inicio', { replace: true })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível iniciar sessão. Tente novamente.'

      if (message.toLowerCase().includes('invalid login credentials')) {
        setError('Email ou palavra-passe incorretos.')
      } else {
        setError(message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="page page--auth">
      <header className="page-header">
        <h1>Entrar</h1>
        <p>Inicie sessão para aceder à área do colaborador.</p>
      </header>

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="button button--primary" disabled={isSubmitting}>
            {isSubmitting ? 'A entrar…' : 'Entrar'}
          </button>

          <p className="form-secondary-link">
            <Link to="/auth/reset-password" className="form-link">
              Esqueci-me da palavra-passe
            </Link>
          </p>

          <p className="form-secondary-link">
            Ainda não tem conta?{' '}
            <Link to="/auth/register" className="form-link">
              Criar conta
            </Link>
          </p>
        </div>

        <div className="form-messages" aria-live="polite">
          {error && <p className="form-message form-message--error">{error}</p>}
        </div>
      </form>
    </section>
  )
}

