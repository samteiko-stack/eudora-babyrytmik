'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Alert, Button, Field, Input, PasswordInput } from '@/components/ui';

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
    <div className="admin-login">
      <aside className="admin-login__brand">
        <div className="admin-login__brand-pattern" aria-hidden />

        <div className="admin-login__brand-content">
          <img
            src="/assets/logo-nav.svg"
            alt="Eudora Internationella Förskola"
            className="admin-login__brand-logo"
          />
        </div>

        <div className="admin-login__brand-content">
          <h1 className="admin-login__brand-title">Administration</h1>
          <p className="admin-login__brand-text">
            Logga in för att hantera babysångsanmälningar, veckor och deltagare för Eudora
            Södermalm och Gärdet.
          </p>
        </div>

        <p className="admin-login__brand-footer">Eudora Internationella Förskola</p>
      </aside>

      <div className="admin-login__panel">
        <div className="admin-login__top">
          <Link href="/" className="admin-login__back">
            ← Tillbaka till anmälan
          </Link>
        </div>

        <div className="admin-login__main">
          <div className="admin-login__form-wrap">
            <h2 className="admin-login__title">Välkommen tillbaka</h2>
            <p className="admin-login__subtitle">Logga in på ditt admin-konto</p>

            <form onSubmit={handleSubmit} className="admin-login__form">
              <Field label="E-postadress" htmlFor="admin-email">
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="din.email@eudoraforskola.se"
                />
              </Field>

              <Field label="Lösenord" htmlFor="admin-password">
                <PasswordInput
                  id="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Ange ditt lösenord"
                />
              </Field>

              {error && <Alert>{error}</Alert>}

              <Button type="submit" variant="primary" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loggar in...' : 'Logga in'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
