import { cva, type VariantProps } from 'class-variance-authority'
import { Select } from 'radix-ui'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

const selectTriggerVariants = cva(
  [
    'mt-1 flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm transition-all duration-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:outline-none',
  ],
  {
    variants: {
      isError: {
        true: 'border-red-500 focus:border-red-500 focus:ring-red-500',
      },
    },
  },
)

const selectContentVariants = cva(
  'relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md',
)

const selectItemVariants = cva(
  'relative flex w-full cursor-default items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none select-none focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
)

export interface SelectOption {
  value: string
  label: string
}

export interface SelectInputProps
  extends VariantProps<typeof selectTriggerVariants> {
  label: string
  isError?: boolean
  isRequired?: boolean
  errorMessage?: string
  options: SelectOption[]
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  isError,
  isRequired,
  errorMessage,
  options,
  placeholder,
  value,
  onValueChange,
  disabled,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>
      <Select.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <Select.Trigger className={selectTriggerVariants({ isError })}>
          <Select.Value placeholder={placeholder} />
          <Select.Icon className="h-4 w-4 opacity-50">
            <ChevronDownIcon />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className={selectContentVariants()}>
            <Select.ScrollUpButton className="flex h-6 items-center justify-center bg-white text-gray-500">
              <ChevronUpIcon />
            </Select.ScrollUpButton>
            <Select.Viewport className="p-1">
              {options.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className={selectItemVariants()}
                >
                  <Select.ItemText>{option.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
            <Select.ScrollDownButton className="flex h-6 items-center justify-center bg-white text-gray-500">
              <ChevronDownIcon />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
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

export default SelectInput
