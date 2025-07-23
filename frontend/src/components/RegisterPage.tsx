"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../utils/authUtils';
import Link from "next/link";

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register(name, email, password);
            router.push('/');
        } catch (err) {
            console.error('Registration error:', err);
            setError('Failed to register');
        }
    };

    return (
        <div className="flex items-center justify-center h-screen">
            <form onSubmit={handleRegister} className="form-pattern">
                <h1 className="form-h1-pattern">Register</h1>
                {error && <p className="text-red-500">{error}</p>}
                <div className="mb-4 pt-3">
                    <label className="label-pattern">Name</label>
                    <input
                        type="text"
                        className="input-padrao"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="label-pattern">E-mail</label>
                    <input
                        type="email"
                        className="input-padrao"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="mb-4">
                    <label className="label-pattern">Password</label>
                    <input
                        type="password"
                        className="input-padrao"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <button type="submit" className="submit-pattern">
                    Register
                </button>

                <p className="bottom-pattern">
                    <Link href="/" className="text-center">Voltar</Link>
                </p>
            </form>
        </div>
    );
};

export default RegisterPage;