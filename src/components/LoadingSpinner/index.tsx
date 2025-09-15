import clsx from 'clsx'

export const LoadingSpinner = ({
  size = 'md',
  className,
  ...props
}: {
  size?: 'sm' | 'md' | 'lg'
} & React.HTMLAttributes<HTMLDivElement>) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  return (
    <div
      className={clsx(
        'animate-spin rounded-full border-2 border-gray-300 border-t-teal-500',
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  )
}

export const LoadingButton = ({
  loading,
  children,
  className,
  ...props
}: {
  loading: boolean
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={clsx(
        'relative inline-flex items-center justify-center',
        loading && 'cursor-not-allowed opacity-75',
        className,
      )}
      disabled={loading}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" className="absolute" />}
      <span className={clsx(loading && 'opacity-0')}>{children}</span>
    </button>
  )
}

export const LoadingOverlay = ({
  loading,
  children,
  className,
  ...props
}: {
  loading: boolean
  children: React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={clsx('relative', className)} {...props}>
      {children}
      {loading && (
        <div className="bg-opacity-75 absolute inset-0 flex items-center justify-center bg-white">
          <LoadingSpinner size="lg" />
        </div>
      )}
    </div>
  )
}
