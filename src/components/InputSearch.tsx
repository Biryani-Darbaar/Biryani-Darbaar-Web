import React, { useState, ChangeEvent, KeyboardEvent, FormEvent } from "react";
import { Search, X } from "lucide-react";
import clsx from "clsx";
import { InputSearchProps } from "@/types";

const InputSearch: React.FC<InputSearchProps & { onQueryChange?: (q: string) => void }> = ({
  placeholder = "Search...",
  className,
  onSearch,
  onQueryChange,
}) => {
  const [query, setQuery] = useState<string>("");

  const handleSearch = (): void => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setQuery(value);
    onQueryChange?.(value);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <form
      className={clsx(
        "flex items-center gap-2 border border-neutral-200 rounded-lg bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary transition-all w-full max-w-xl px-3 py-2",
        className
      )}
      onSubmit={handleSubmit}
    >
      <Search size={20} className="text-neutral-400" />
      <input
        placeholder={placeholder}
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400 text-base"
        autoComplete="off"
      />
      {query && (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            onQueryChange?.("");
          }}
          className="text-neutral-400 hover:text-neutral-600 transition-colors p-1"
          aria-label="Clear search"
        >
          <X size={16} />
        </button>
      )}
      <button
        type="submit"
        className="bg-primary hover:bg-primary/90 text-white rounded-md px-4 py-2 transition-colors duration-200 disabled:opacity-50 font-medium"
        disabled={!query.trim()}
        aria-label="Search"
      >
        <Search size={18} color="#fff" />
      </button>
    </form>
  );
};

export default InputSearch;
