import { useEffect, useState } from 'react';
import { fetchHealth } from '../lib/api';

export function HomePage() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    fetchHealth()
      .then((health) => setApiStatus(health.status))
      .catch(() => setApiStatus('unreachable'));
  }, []);

  return (
    <section>
      <h1>Knowledge assistant</h1>
      <p>
        Starter UI for uploading documents and asking grounded questions. Feature
        modules live under <code>src/features</code>.
      </p>
      <p>
        API health: <strong>{apiStatus}</strong>
      </p>
    </section>
  );
}
