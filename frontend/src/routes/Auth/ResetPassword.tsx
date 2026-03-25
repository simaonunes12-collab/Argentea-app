import { type FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import { requestPasswordReset } from '../../services/auth'

export function ResetPassword() {
  const [email, setEmail] = useState('')
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
      await requestPasswordReset(trimmedEmail)

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

  return (
    <section className="page page--auth">
      <header className="page-header">
        <h1>Recuperar palavra-passe</h1>
        <p>
          Introduza o email associado à sua conta para receber um link de recuperação de
          palavra-passe.
        </p>
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

