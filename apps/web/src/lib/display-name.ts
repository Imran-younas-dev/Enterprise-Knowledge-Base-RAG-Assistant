export function displayNameFromEmail(email: string): string {
  if (email === 'imran@localhost') {
    return 'Imran'
  }
  const [local] = email.split('@')
  if (!local) {
    return email
  }
  return `${local.charAt(0).toUpperCase()}${local.slice(1)}`
}
