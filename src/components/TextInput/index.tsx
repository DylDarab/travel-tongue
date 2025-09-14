import { cva, type VariantProps } from 'class-variance-authority'
import type { InputHTMLAttributes } from 'react'

const textInputVariants = cva(
  [
    'mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none',
  ],
  {
    variants: {
      isError: {
        true: 'border-red-500',
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
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}

export default TextInput
