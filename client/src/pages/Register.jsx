import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { registerUser, getMe } from '../services/authService'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
  }

  const validate = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return

    setLoading(true)
    try {
      const { confirmPassword, ...submitData } = formData
      const res = await registerUser(submitData)
      localStorage.setItem('token', res.token)
      const userRes = await getMe()
      login(res.token, userRes.data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-12'>
      <div className='w-full max-w-md'>
        {/* Branding */}
        <div className='text-center mb-8'>
          <div className='w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center mb-4 shadow-lg shadow-[var(--color-primary)]/20'>
            <svg xmlns='http://www.w3.org/2000/svg' className='w-9 h-9 text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-white'>Create Account</h1>
          <p className='text-[var(--color-text-muted)] mt-1'>Get started with API Security Scanner</p>
        </div>

        {/* Card */}
        <div className='bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 shadow-xl'>
          {error && (
            <div className='mb-6 p-3 rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 text-[var(--color-error)] text-sm flex items-center gap-2'>
              <svg xmlns='http://www.w3.org/2000/svg' className='w-4 h-4 shrink-0' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <circle cx='12' cy='12' r='10' />
                <line x1='15' y1='9' x2='9' y2='15' />
                <line x1='9' y1='9' x2='15' y2='15' />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='space-y-5'>
            <div>
              <label className='block text-sm font-medium text-[var(--color-text-muted)] mb-2'>Full Name</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]'>
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                    <circle cx='12' cy='7' r='4' />
                  </svg>
                </span>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  placeholder='John Doe'
                  className='w-full pl-11 pr-4 py-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-200'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-[var(--color-text-muted)] mb-2'>Email</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]'>
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <rect width='20' height='16' x='2' y='4' rx='2' />
                    <path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' />
                  </svg>
                </span>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='you@example.com'
                  className='w-full pl-11 pr-4 py-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-200'
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-[var(--color-text-muted)] mb-2'>Password</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]'>
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <rect width='18' height='11' x='3' y='11' rx='2' ry='2' />
                    <path d='M7 11V7a5 5 0 0 1 10 0v4' />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='Min. 6 characters'
                  className='w-full pl-11 pr-12 py-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-200'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-white transition-colors cursor-pointer'
                >
                  {showPassword ? (
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' />
                      <line x1='1' y1='1' x2='23' y2='23' />
                    </svg>
                  ) : (
                    <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                      <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' />
                      <circle cx='12' cy='12' r='3' />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-[var(--color-text-muted)] mb-2'>Confirm Password</label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]'>
                  <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder='Re-enter your password'
                  className='w-full pl-11 pr-4 py-3 bg-[var(--color-bg-input)] border border-[var(--color-border)] rounded-xl text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-200'
                />
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full py-3 px-4 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white font-medium rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-card)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer'
            >
              {loading ? (
                <>
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin' />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className='text-center text-sm text-[var(--color-text-muted)] mt-6'>
            Already have an account?{' '}
            <Link to='/login' className='text-[var(--color-primary-light)] hover:text-[var(--color-primary)] font-medium transition-colors'>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
