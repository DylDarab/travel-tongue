import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

const buttonVariants = cva(
  [
    'flex cursor-pointer items-center justify-center gap-3 rounded-md px-4 py-2 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none',
  ],
  {
    variants: {
      variant: {
        primary:
          'flex bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500 focus:ring-offset-white',
        outline:
          'border border-gray-300 bg-white text-black hover:bg-gray-100 focus:ring-teal-500 focus:ring-offset-white',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 focus:ring-offset-white',
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
  variant = 'primary',
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
