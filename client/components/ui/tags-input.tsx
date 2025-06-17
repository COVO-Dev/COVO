import { WithContext as ReactTags } from "react-tag-input";
import { X } from "lucide-react";

export default function TagsInput({ tags, setTags }) {
  const handleAddition = (tag) => {
    setTags([...tags, tag.text]);
  };

  const handleDelete = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  return (
    <ReactTags
      tags={tags.map((tag, index) => ({ id: index.toString(), text: tag }))}
      handleAddition={handleAddition}
      handleDelete={handleDelete}
      placeholder="Add a tag and press Enter"
      inputFieldPosition="top" // Place the input field above the tags
      autocomplete
      classNames={{
        tags: "flex flex-wrap gap-2", // Container for all tags
        tagInput: "w-full", // Input field container
        tagInputField: `
          flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background
          file:border-0 file:bg-transparent file:text-sm file:font-medium
          placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50
        `, // Input field (matches shadcn Input)
        selected: "flex flex-wrap gap-2", // Container for selected tags
        tag: `
          inline-flex items-center gap-2 rounded-full border border-input bg-background px-3 py-1 text-sm bg-blue-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
        `, // Individual tag (matches shadcn Badge)
        // remove: `ml-0 p-0 w-4 h-4 flex items-center justify-center rounded-full text-red-500 text-md leading-relaxed border-2 border-red-400 hover:bg-red-400 hover:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-150 ease-in-out`, // Styles the remove 'x' to be a small, circular icon-like button
      }}
    // removeComponent={({ onDelete }) => (
    //   <button
    //     type="button"
    //     onClick={handleDelete}
    //     className="ml-0 p-0 w-4 h-4 flex items-center justify-center rounded-full text-red-500 border-2 border-red-400 hover:bg-red-400 hover:text-white hover:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:ring-offset-1 transition-colors duration-150 ease-in-out"
    //   >
    //     <X className="h-3 w-3" />
    //   </button>
    // )}
    />
  );
}
