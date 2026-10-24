// Preview-only validation; this does not establish a future authentication policy.
export function validateIdentity({ name, email }, requireName = false) {
  const errors = {}
  if (requireName && (!name || name.trim().length < 2)) errors.name = 'Enter your full name (at least 2 characters).'
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Enter a valid email address.'
  return errors
}

export function validateAccount(values, mode) {
  const errors = validateIdentity(values, mode === 'register')
  if (mode !== 'recovery') {
    if (!values.password) errors.password = 'Enter your password.'
    else if (mode === 'register' && (values.password.length < 8 || !/[a-z]/i.test(values.password) || !/\d/.test(values.password))) errors.password = 'Use at least 8 characters, including a letter and a number.'
    if (mode === 'register' && (!values.confirm || values.confirm !== values.password)) errors.confirm = 'Passwords must match.'
  }
  return errors
}
