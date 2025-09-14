'use client'

import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import TextInput from '@/components/TextInput'
import { api } from '@/trpc/react'

interface AddPhraseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
  scenarioId?: string
  targetLang?: string
}

const AddPhraseModal = ({
  open,
  onOpenChange,
  groupName,
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

  useEffect(() => {
    if (generateTimeoutRef.current) {
      clearTimeout(generateTimeoutRef.current)
    }

    if (!label.trim() || !targetLang || !scenarioId) return

    generateTimeoutRef.current = setTimeout(() => {
      const generatePhrase = async () => {
        setIsGenerating(true)
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
      void generatePhrase()
    }, 1000)

    return () => {
      if (generateTimeoutRef.current) {
        clearTimeout(generateTimeoutRef.current)
      }
    }
  }, [label, targetLang, scenarioId, generatePhraseFromLabel])

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
        group: groupName,
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
              Add phrase to {groupName}
            </Dialog.Title>
            <Dialog.Close className="rounded-full p-1 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="mt-4 space-y-4">
            <TextInput
              label="Phrase label"
              placeholder="e.g., 'Thank you very much'"
              isRequired
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Generated English phrase
              </label>
              <input
                type="text"
                placeholder={
                  isGenerating ? 'Generating...' : 'Generated English phrase'
                }
                value={localDialogue}
                onChange={(e) => {
                  setLocalDialogue(e.target.value)
                  setGenerationError(null)
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Generated translation
              </label>
              <input
                type="text"
                placeholder={
                  isGenerating ? 'Generating...' : 'Generated translation'
                }
                value={targetDialogue}
                onChange={(e) => {
                  setTargetDialogue(e.target.value)
                  setGenerationError(null)
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 shadow-sm"
              />
              {generationError ? (
                <p className="mt-1 text-sm text-red-600">{generationError}</p>
              ) : (
                <p className="mt-1 text-sm text-gray-500">
                  Edit if the generated phrases need adjustment
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  !label.trim() ||
                  !localDialogue.trim() ||
                  !targetDialogue.trim() ||
                  isAddingPhrase
                }
                className="rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAddingPhrase ? 'Adding...' : 'Add phrase'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default AddPhraseModal
