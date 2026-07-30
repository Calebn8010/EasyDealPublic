import { useState } from 'react';
import '../App.css';

type SearchStatus = 'idle' | 'loading';

type SearchFormProps = {
    onSearch: (query: string) => Promise<void>;
};

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<SearchStatus>('idle');
    const [animPhase, setAnimPhase] = useState<'in' | 'out' | 'idle'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (status === 'loading') return;

        // Animate out
        setAnimPhase('out');
        await new Promise(r => setTimeout(r, 200));
        setStatus('loading');
        setAnimPhase('in');
        await new Promise(r => setTimeout(r, 200));
        setAnimPhase('idle');

        await onSearch(query.trim());

        // Animate back
        setAnimPhase('out');
        await new Promise(r => setTimeout(r, 200));
        setStatus('idle');
        setAnimPhase('in');
        await new Promise(r => setTimeout(r, 300));
        setAnimPhase('idle');
    };

    const getIconTransform = () => {
        if (animPhase === 'out') return 'scale(0) rotate(180deg)';
        if (animPhase === 'in') return 'scale(1) rotate(0deg)';
        return 'scale(1) rotate(0deg)';
    };

    const getIconOpacity = () => {
        if (animPhase === 'out') return 0;
        if (animPhase === 'in') return 1;
        return 1;
    };

    const iconStyle: React.CSSProperties = {
        transition: animPhase === 'in'
            ? 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            : 'opacity 0.15s ease, transform 0.2s cubic-bezier(0.4, 0, 1, 1)',
        opacity: getIconOpacity(),
        transform: getIconTransform(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                maxWidth: '28rem',
                margin: '0 auto',
                padding: '1rem',
            }}
        >
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="search"
                style={{
                    flex: 1,
                    borderRadius: '1rem',
                    border: '1px solid #d1d5db',
                    padding: '0.5rem 1rem',
                    outline: 'none',
                }}
            />
            <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                    width: '44px',
                    height: '38px',
                    borderRadius: '1rem',
                    backgroundColor: status === 'loading' ? '#1d4ed8' : '#2563eb',
                    border: 'none',
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: status === 'loading' ? 0.85 : 1,
                    transition: 'background-color 0.3s, opacity 0.3s, box-shadow 0.2s',
                    boxShadow: status === 'loading'
                        ? '0 0 0 3px rgba(37,99,235,0.25)'
                        : '0 2px 6px rgba(37,99,235,0.4)',
                    overflow: 'hidden',
                }}
            >
                <div style={iconStyle}>
                    {status === 'loading' ? (
                        <span className="add-spinner" aria-hidden="true" />
                    ) : (
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
                    )}
                </div>
            </button>
        </form>
    );
};

export default SearchForm;