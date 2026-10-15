'use client';

import { useState, type FormEvent } from 'react';
import { track } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { ArrowRight } from '@phosphor-icons/react';
import styles from './WaitlistForm.module.css';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function WaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || status === 'loading') return;
    setStatus('loading');
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'landing' }),
      });
      const result = await response.json();
      const success = response.ok && result.ok === true;
      setStatus(success ? 'success' : 'error');
      if (success) { setEmail(''); void track('waitlist_joined', { source: 'landing' }); }
    } catch { setStatus('error'); }
  }

  return (
    <div aria-live="polite">
      {status === 'success' ? <p className={styles.success}>You’re on the list. We’ll email you when Cloud opens.</p> : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <FieldGroup><Field data-invalid={status === 'error'}><FieldLabel htmlFor="cloud-email">Get the Cloud launch update</FieldLabel>
          <div className={styles.fields}>
            <Input aria-invalid={status === 'error'} id="cloud-email" type="email" name="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} disabled={status === 'loading'} aria-describedby={status === 'error' ? 'cloud-signup-error' : undefined} />
            <Button size="lg" type="submit" disabled={status === 'loading'}>{status === 'loading' ? 'Joining…' : 'Notify me'}<ArrowRight data-icon="inline-end" /></Button>
          </div></Field></FieldGroup>
          {status === 'error' && <p id="cloud-signup-error" className={styles.error} role="alert">We couldn’t save your email. Please try again or <a href="mailto:mahi@mahimai.ca">email us</a>.</p>}
          <p className={styles.privacy}>By joining, you agree to receive launch updates. <a href="/privacy">Privacy</a></p>
        </form>
      )}
    </div>
  );
}
