'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (auth.isAuthenticated()) {
      router.push('/admin');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = auth.login(email, password);

    if (success) {
      router.push('/admin');
    } else {
      setError('Felaktig e-postadress eller lösenord');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F3EA]">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <img 
            src="/logo.svg" 
            alt="Eudora Logo" 
            className="h-10 w-auto"
          />
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full">
          <div className="bg-white border border-neutral-300 rounded-xl p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-primary-teal/10 p-4 rounded-full">
                <Lock className="w-12 h-12 text-primary-teal" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-neutral-900 mb-2">
              Admin Login
            </h1>
            <p className="text-center text-neutral-600 mb-8">
              Logga in för att hantera anmälningar
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  E-post
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-teal transition-all bg-white"
                  placeholder="din.email@eudoraforskola.se"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Lösenord
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-teal transition-all bg-white"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-error-light text-neutral-900 px-4 py-3 rounded-lg text-sm border border-error/30">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-teal text-white py-4 px-6 rounded-lg font-semibold hover:bg-primary-teal/90 transition-all disabled:bg-neutral-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loggar in...' : 'LOGGA IN'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-primary-teal hover:underline text-sm font-medium"
              >
                ← Tillbaka till startsidan
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
