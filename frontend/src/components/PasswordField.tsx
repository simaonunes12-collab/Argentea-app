import { useState, type ChangeEvent } from 'react'

type PasswordFieldProps = {
  id: string
  name?: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  autoComplete?: string
  required?: boolean
  minLength?: number
  placeholder?: string
  /** Classe do input (ex.: form-input ou field-input). */
  inputClassName?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}

function IconEye() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function IconEyeOff() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

export function PasswordField({
  id,
  name,
  value,
  onChange,
  autoComplete,
  required,
  minLength,
  placeholder,
  inputClassName = 'form-input',
  'aria-invalid': ariaInvalid,
  'aria-describedby': ariaDescribedBy,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="password-field">
      <div className="password-field__control">
        <input
          id={id}
          name={name}
          type={visible ? 'text' : 'password'}
          className={`${inputClassName} password-field__input`}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          placeholder={placeholder}
          aria-invalid={ariaInvalid}
          aria-describedby={ariaDescribedBy}
        />
        <button
          type="button"
          className="password-field__toggle"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
          aria-pressed={visible}
        >
          {visible ? <IconEyeOff /> : <IconEye />}
        </button>
      </div>
    </div>
  )
}
