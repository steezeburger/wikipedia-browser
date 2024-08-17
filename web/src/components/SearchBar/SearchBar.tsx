import React, { memo, useState } from "react";

const SearchBar = memo(({ onSearch }: { onSearch: (term: string, isSearchResult: boolean) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm, true);
      setSearchTerm("");
    }
  };

  return (
    <div className="p-4 bg-gray-100">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter a Wikipedia page title"
          className="flex-grow px-4 py-2 text-black border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Search
        </button>
      </form>
    </div>
  );
});
SearchBar.displayName = "SearchBar";

export default SearchBar;
