import { useState, type FormEvent } from 'react'
import { login, type AuthUser } from '../lib/api'

export function SignInPage({
  onSuccess,
}: {
  onSuccess: (session: { token: string; user: AuthUser }) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setPending(true)
    try {
      const data = await login(email, password)
      onSuccess({ token: data.token, user: data.user })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Sign in failed'
      setError(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="panel sign-in" onSubmit={handleSubmit}>
      <h1>Sign in</h1>
      <label>
        Email
        <input
          type="email"
          name="email"
          autoComplete="username"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>
      <label>
        Password
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="primary-button" type="submit" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
