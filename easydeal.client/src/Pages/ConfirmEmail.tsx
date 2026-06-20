// easydeal.client/src/Pages/ConfirmEmail.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function ConfirmEmail() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const userId = searchParams.get('userId');
        const token = searchParams.get('token');

        if (!userId || !token) {
            setStatus('error');
            setMessage('Invalid confirmation link.');
            return;
        }

        fetch('/api/auth/confirm-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, token })
        })
            .then(r => r.json())
            .then(data => {
                setStatus('success');
                setMessage(data.message);
            })
            .catch(() => {
                setStatus('error');
                setMessage('Something went wrong. Please try again.');
            });
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            {status === 'loading' && <p>Confirming your email...</p>}
            {status === 'success' && (
                <>
                    <h2>✅ {message}</h2>
                    <Link to="/login">Go to Login</Link>
                </>
            )}
            {status === 'error' && (
                <>
                    <h2>❌ {message}</h2>
                    <Link to="/login">Back to Login</Link>
                </>
            )}
        </div>
    );
}