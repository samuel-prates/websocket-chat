"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '../utils/authUtils';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(username, password);
            router.push('/chat');
        } catch (err) {
            console.error('Login error:', err);
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md">
                <h1 className="text-2xl mb-4">Login</h1>
                {error && <p className="text-red-500">{error}</p>}
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Username</label>
                    <input
                        type="text"
                        className="border rounded w-full py-2 px-3"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Password</label>
                    <input
                        type="password"
                        className="border rounded w-full py-2 px-3"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
                    Login
                </button>
                <p className="mt-4 text-sm">
                    Don't have an account? <Link href="/register" className="text-blue-500">Register</Link>
                </p>
            </form>
        </div>
    );
};

export default LoginPage;