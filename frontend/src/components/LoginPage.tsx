"use client";

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {login} from '../utils/authUtils';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      router.push('/chat');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleLogin} className="form-pattern">
        <h1 className="form-h1-pattern">Acesse sua conta</h1>
        <p className="text-sm grayscale-0 pt-0 mb-5">Insira suas credenciais para fazer login</p>
        {error && <p className="text-red-500">{error}</p>}
        <div className="mb-4 pt-3">
          <label className="label-pattern">E-mail</label>
          <input
            type="email"
            className="input-padrao"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="label-pattern">Senha</label>
          <input
            type="password"
            className="input-padrao"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="submit-pattern">
          Acessar &#65515;
        </button>
        <p className="bottom-pattern">
          <Link href="/register" className="text-center">Criar nova conta</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;