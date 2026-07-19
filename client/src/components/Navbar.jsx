import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className='border-b border-[var(--color-border)] bg-[var(--color-bg-card)]/80 backdrop-blur-md sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-light)] flex items-center justify-center'>
              <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5 text-white' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
              </svg>
            </div>
            <span className='text-lg font-semibold text-white'>API Scanner</span>
          </div>

          <div className='flex items-center gap-4'>
            <span className='text-sm text-[var(--color-text-muted)] hidden sm:block'>
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className='px-4 py-2 text-sm font-medium rounded-lg border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-primary)] transition-all duration-200 cursor-pointer'
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
