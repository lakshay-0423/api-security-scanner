import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const Dashboard = () => {
  const { user } = useAuth()

  const stats = [
    { label: 'Total Scans', value: '0', icon: '🔍' },
    { label: 'Vulnerabilities', value: '0', icon: '⚠️' },
    { label: 'APIs Tested', value: '0', icon: '🌐' },
    { label: 'Security Score', value: 'N/A', icon: '🛡️' },
  ]

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className='min-h-screen'>
      <Navbar />

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Welcome Section */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-white mb-2'>
            Welcome back, <span className='text-[var(--color-primary-light)]'>{user?.name}</span>
          </h1>
          <p className='text-[var(--color-text-muted)]'>Here&apos;s your security overview</p>
        </div>

        {/* Stats Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className='bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 hover:border-[var(--color-primary)]/50 transition-all duration-300'
            >
              <div className='text-2xl mb-3'>{stat.icon}</div>
              <p className='text-2xl font-bold text-white'>{stat.value}</p>
              <p className='text-sm text-[var(--color-text-muted)] mt-1'>{stat.label}</p>
            </div>
          ))}
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* New Scan Card */}
          <div className='lg:col-span-2 bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-primary-light)]/5 border border-[var(--color-primary)]/30 rounded-2xl p-8'>
            <h2 className='text-xl font-semibold text-white mb-2'>Start a New Scan</h2>
            <p className='text-[var(--color-text-muted)] mb-6'>
              Analyze your API endpoints for security vulnerabilities, misconfigurations, and best practice violations.
            </p>
            <button
              className='px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)] text-white font-medium rounded-xl hover:opacity-90 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-[var(--color-primary)]/20 cursor-pointer'
              onClick={() => alert('Scanning feature coming in Week 2!')}
            >
              <svg xmlns='http://www.w3.org/2000/svg' className='w-5 h-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
              </svg>
              New Scan
            </button>
          </div>

          {/* User Info Card */}
          <div className='bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6'>
            <h2 className='text-lg font-semibold text-white mb-4'>Profile</h2>
            <div className='space-y-4'>
              <div>
                <p className='text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1'>Name</p>
                <p className='text-white font-medium'>{user?.name}</p>
              </div>
              <div>
                <p className='text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1'>Email</p>
                <p className='text-white font-medium'>{user?.email}</p>
              </div>
              <div>
                <p className='text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1'>Member Since</p>
                <p className='text-white font-medium'>{user?.createdAt ? formatDate(user.createdAt) : '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
