import { useState } from 'react';
import '../App.css';


type SearchFormProps = {
    onSearch: (query: string) => void;
};

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
    const [query, setQuery] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query.trim());
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full max-w-md mx-auto p-4">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="search flex-1 rounded-2xl border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                className="px-4 py-2 rounded-2xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
            >
                Search
            </button>
        </form>
    );
};


export default SearchForm;