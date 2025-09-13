import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  [
    'flex cursor-pointer items-center justify-center gap-3 rounded-md px-4 py-2 transition-all duration-200',
  ],
  {
    variants: {
      variant: {
        primary: 'flex bg-teal-600 text-white hover:bg-teal-700',
        outline: 'border border-gray-300 text-black hover:bg-gray-100',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'py-3 text-lg',
      },
      fullWidth: {
        true: 'w-full',
      },
      isDisabled: {
        true: 'cursor-not-allowed opacity-50',
      },
      loading: {
        true: 'cursor-not-allowed opacity-50',
      },
    },
  },
)

export interface ButtonProps
  extends VariantProps<typeof buttonVariants>,
    ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onClick?: () => void
  loading?: boolean
}

const Button: React.FC<ButtonProps> = ({
  label,
  fullWidth,
  leftIcon,
  rightIcon,
  loading,
  onClick,
  size,
  variant,
  disabled,
  className,
  ...buttonProps
}) => {
  return (
    <button
      className={twMerge(
        buttonVariants({
          variant,
          size,
          fullWidth,
          isDisabled: disabled,
          loading,
        }),
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      {...buttonProps}
    >
      {leftIcon}
      {label}
      {rightIcon}
    </button>
  )
}

export default Button
