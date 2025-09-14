'use client'

import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import TextInput from '@/components/TextInput'
import Button from '@/components/Button'
import { api } from '@/trpc/react'

interface AddPhraseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scenarioId?: string
  targetLang?: string
}

const AddPhraseModal = ({
  open,
  onOpenChange,
  scenarioId,
  targetLang,
}: AddPhraseModalProps) => {
  const [label, setLabel] = useState('')
  const [localDialogue, setLocalDialogue] = useState('')
  const [targetDialogue, setTargetDialogue] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationError, setGenerationError] = useState<string | null>(null)

  const generateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { mutateAsync: generatePhraseFromLabel } =
    api.phrases.generatePhraseFromLabel.useMutation()
  const { mutateAsync: addPhrase, isPending: isAddingPhrase } =
    api.phrases.addPhrase.useMutation()

  const resetForm = useCallback(() => {
    setLabel('')
    setLocalDialogue('')
    setTargetDialogue('')
    setIsGenerating(false)
    setGenerationError(null)
    if (generateTimeoutRef.current) {
      clearTimeout(generateTimeoutRef.current)
      generateTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    if (open) {
      resetForm()
    }
  }, [open, resetForm])

  const handleGeneratePhrase = async () => {
    if (!label.trim() || !targetLang || !scenarioId) return

    setIsGenerating(true)
    setGenerationError(null)
    try {
      const result = await generatePhraseFromLabel({
        label: label.trim(),
        targetLang,
        scenarioId,
      })

      if (result) {
        setLocalDialogue(result.localDialogue)
        setTargetDialogue(result.targetDialogue)
      }
    } catch (error) {
      console.error('Phrase generation failed:', error)
      setGenerationError(
        'Phrase generation failed. Please try again or enter phrases manually.',
      )
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async () => {
    if (
      !scenarioId ||
      !label.trim() ||
      !localDialogue.trim() ||
      !targetDialogue.trim()
    ) {
      return
    }

    try {
      await addPhrase({
        scenarioId,
        label: label.trim(),
        localDialogue: localDialogue.trim(),
        targetDialogue: targetDialogue.trim(),
        group: 'User custom group',
      })

      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add phrase:', error)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <Dialog.Title className="text-lg font-medium">
              Add custom phrase
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phrase label
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., 'Thank you very much'"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
                <Button
                  label={isGenerating ? '...' : 'Translate'}
                  onClick={handleGeneratePhrase}
                  disabled={
                    !label.trim() || !targetLang || !scenarioId || isGenerating
                  }
                  loading={isGenerating}
                  variant="primary"
                  size="sm"
                />
              </div>
            </div>

            <TextInput
              label="Generated English phrase"
              placeholder={
                isGenerating ? 'Generating...' : 'Generated English phrase'
              }
              value={localDialogue}
              readOnly={true}
            />

            <div>
              <TextInput
                label="Generated translation"
                placeholder={
                  isGenerating ? 'Generating...' : 'Generated translation'
                }
                value={targetDialogue}
                readOnly={true}
                isError={!!generationError}
                errorMessage={generationError ?? undefined}
              />
              {!generationError && (
                <p className="mt-1 text-sm text-gray-500">
                  Click the Translate button to generate phrases
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button label="Cancel" variant="outline" />
              </Dialog.Close>
              <Button
                label={isAddingPhrase ? 'Adding...' : 'Add phrase'}
                onClick={handleSubmit}
                disabled={
                  !label.trim() ||
                  !localDialogue.trim() ||
                  !targetDialogue.trim() ||
                  isAddingPhrase
                }
                loading={isAddingPhrase}
                variant="primary"
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default AddPhraseModal
