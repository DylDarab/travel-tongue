import { Plus } from 'lucide-react';

const AddPhraseCard = () => {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-gray-300 p-4 hover:border-gray-400">
      <div className="flex flex-col items-center gap-2 text-gray-500">
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">Add phrase</span>
      </div>
    </div>
  );
};

export default AddPhraseCard;