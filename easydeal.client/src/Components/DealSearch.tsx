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
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '28rem', margin: '0 auto', padding: '1rem' }}>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="search"
                style={{ flex: 1, borderRadius: '1rem', border: '1px solid #d1d5db', padding: '0.5rem 1rem', outline: 'none' }}
            />
            <button
                type="submit"
                style={{ padding: '0.5rem 1rem', borderRadius: '1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="16.5" y1="16.5" x2="22" y2="22" />
                </svg>
            </button>
        </form>
    );
};

export default SearchForm;