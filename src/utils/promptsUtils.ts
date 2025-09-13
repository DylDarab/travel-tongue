export const replaceVariableInPrompt = (
  prompt: string,
  variables: Record<string, string>,
) => {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    return acc.replace(`{{${key}}}`, value)
  }, prompt)
}
