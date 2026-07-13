import { useEffect, useState } from 'react';
import apiClient from './api/client';
import { MantineProvider, AppShell } from '@mantine/core';

function App() {
  const [tables, setTables] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('tables/')
      .then((res) => setTables(res.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!tables) return <div>Loading...</div>;

  return (
    <MantineProvider>
      <AppShell>
        <AppShell.Header/>
        <AppShell.Navbar>
          
        </AppShell.Navbar>
      </AppShell>
    </MantineProvider>
  );
}

export default App;