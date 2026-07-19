const LoadingSpinner = () => {
  return (
    <div className='flex items-center justify-center min-h-screen'>
      <div className='relative'>
        <div className='w-12 h-12 rounded-full border-4 border-[var(--color-bg-input)] border-t-[var(--color-primary)] animate-spin' />
        <div className='absolute inset-0 w-12 h-12 rounded-full border-4 border-transparent border-b-[var(--color-primary-light)] animate-spin' style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
    </div>
  )
}

export default LoadingSpinner
