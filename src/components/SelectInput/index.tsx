import { cva, type VariantProps } from 'class-variance-authority'
import { Select } from 'radix-ui'
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react'

const selectTriggerVariants = cva(
  [
    'mt-1 flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none',
  ],
  {
    variants: {
      isError: {
        true: 'border-red-500',
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
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  )
}

export default SelectInput
