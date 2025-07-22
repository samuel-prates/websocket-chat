"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../utils/authUtils';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(name, username, password);
            router.push('/');
        } catch (err) {
            console.error('Registration error:', err);
            setError('Failed to register');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md">
                <h1 className="text-2xl mb-4">Register</h1>
                {error && <p className="text-red-500">{error}</p>}
                <div className="mb-4">
                    <label className="block text-sm font-bold mb-2">Name</label>
                    <input
                        type="text"
                        className="border rounded w-full py-2 px-3"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
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
                    Register
                </button>
            </form>
        </div>
    );
};

export default RegisterPage;