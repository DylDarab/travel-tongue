import { cva, type VariantProps } from 'class-variance-authority'
import type { InputHTMLAttributes } from 'react'

const textInputVariants = cva(
  [
    'mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm transition-all duration-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none',
  ],
  {
    variants: {
      isError: {
        true: 'border-red-500 focus:border-red-500 focus:ring-red-500',
      },
      readOnly: {
        true: 'cursor-not-allowed bg-gray-100 text-gray-500',
      },
    },
  },
)

export interface TextInputProps
  extends VariantProps<typeof textInputVariants>,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label: string
  isError?: boolean
  isRequired?: boolean
  errorMessage?: string
  readOnly?: boolean
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  isError,
  isRequired,
  errorMessage,
  readOnly,
  ...inputProps
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        className={textInputVariants({ isError, readOnly })}
        readOnly={readOnly}
        {...inputProps}
      />
      {errorMessage && (
        <p className="mt-1 flex items-center text-sm font-medium text-red-600">
          <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export default TextInput
