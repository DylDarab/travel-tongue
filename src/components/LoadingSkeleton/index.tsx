import clsx from 'clsx'

export const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={clsx('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  )
}

export const CardSkeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={clsx(
        'rounded-lg border border-gray-200 bg-white p-6',
        className,
      )}
      {...props}
    >
      <div className="space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

export const ScenarioCardSkeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={clsx(
        'rounded-lg border border-gray-200 bg-white p-6',
        className,
      )}
      {...props}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}

export const ListSkeleton = ({
  count = 3,
  className,
  ...props
}: { count?: number } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={clsx('space-y-4', className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export const ProfileSkeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={clsx('space-y-6', className)} {...props}>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

export const ButtonSkeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <Skeleton className={clsx('h-10 w-24', className)} {...props} />
}

export const InputSkeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={clsx('space-y-2', className)} {...props}>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}

export const FormSkeleton = ({
  count = 3,
  className,
  ...props
}: { count?: number } & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={clsx('space-y-6', className)} {...props}>
      {Array.from({ length: count }).map((_, i) => (
        <InputSkeleton key={i} />
      ))}
    </div>
  )
}
