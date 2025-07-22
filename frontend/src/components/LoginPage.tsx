"use client";

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {login} from '../utils/authUtils';

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
      <form onSubmit={handleLogin} className="bg-white p-[100px] shadow-md form-login border rounded-4xl">
        <h1 className="text-4xl mb-1 font-bold">Acesse sua conta</h1>
        <p className="text-sm grayscale-0 pt-0 mb-5">Insira suas credenciais para fazer login</p>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-4 pt-3">
          <label className="block text-sm mb-0">E-mail</label>
          <input
            type="text"
            className="border rounded w-full py-2 px-3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm mb-0">Senha</label>
          <input
            type="password"
            className="border rounded w-full py-2 px-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="bg-white text-black py-2 px-4 rounded-4xl border-gray-800 border-2 w-full">
          Acessar &#65515;
        </button>
        <p className="bg-gray-200 w-[166%] pt-4 mt-8 text-center ml-[-33%] pb-4 mb-[-100px] rounded-b-4xl">
          <Link href="/register" className="text-center">Criar nova conta</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;