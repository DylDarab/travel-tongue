import { cva, type VariantProps } from 'class-variance-authority'
import type { TextareaHTMLAttributes } from 'react'

const textareaVariants = cva(
  [
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none',
  ],
  {
    variants: {
      isError: {
        true: 'border-red-500',
      },
    },
  },
)

export interface TextareaProps
  extends VariantProps<typeof textareaVariants>,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {
  label: string
  isError?: boolean
  isRequired?: boolean
  errorMessage?: string
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  isError,
  isRequired,
  errorMessage,
  ...textareaProps
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>
      <textarea className={textareaVariants({ isError })} {...textareaProps} />
      {errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}

export default Textarea
