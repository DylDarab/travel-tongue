import { cva, type VariantProps } from 'class-variance-authority'
import { twMerge } from 'tailwind-merge'

const chipVariants = cva(
  [
    'inline-flex cursor-pointer items-center rounded-full border px-3 py-1 text-sm font-medium transition-all duration-200',
  ],
  {
    variants: {
      isSelected: {
        true: 'border-teal-500 bg-teal-50 text-teal-700',
        false: 'border-gray-300 bg-white text-gray-700 hover:border-gray-400',
      },
    },
  },
)

export interface ChipOption {
  value: string
  label: string
}

export interface MultipleSelectChipsProps
  extends VariantProps<typeof chipVariants> {
  label: string
  options: ChipOption[]
  selectedValues: string[]
  onChange: (selectedValues: string[]) => void
  className?: string
}

const MultipleSelectChips: React.FC<MultipleSelectChipsProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  className,
}) => {
  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value))
    } else {
      onChange([...selectedValues, value])
    }
  }

  return (
    <div className={twMerge('space-y-3', className)}>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={chipVariants({
              isSelected: selectedValues.includes(option.value),
            })}
            onClick={() => handleToggle(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default MultipleSelectChips
