import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchInputProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  defaultValue?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search task",
  onSearch,
  defaultValue = "",
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "f") {
      e.preventDefault();
      // Placeholder for search modal or focus behavior
    }
  };

  return (
    <div className="relative flex items-center bg-white border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
      {/* Search Icon */}
      <Search size={18} className="text-gray-400 mr-2" strokeWidth={1.5} />

      {/* Input Field */}
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
      />

      {/* Keyboard Shortcut Indicator */}
      <div className="flex items-center gap-1 ml-2 pl-2 border-l border-gray-200">
        <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">
          ⌘F
        </kbd>
      </div>
    </div>
  );
};

export default SearchInput;
