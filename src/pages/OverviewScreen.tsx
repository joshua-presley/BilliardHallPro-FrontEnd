import { useEffect, useState } from 'react';
import { AppShell, NavLink, Title, Drawer, SimpleGrid, Text, Stack,  Button } from '@mantine/core';
import type { Table } from '../types/models/Table';
import { logout } from '../api/auth';
import { IconLogout } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import TableOverview from '../components/TableOverview';
import { getTables } from '../api/table';
import NewSessionModal from '../components/NewSessionModal';

type SidebarSection = 'tables' | 'playerQueue';

// Placeholder data — replace with real API data once TableGrid is built

function OverviewScreen() {
  const [activeSection, setActiveSection] = useState<SidebarSection>('tables');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [tables, setTables] = useState<Table[]>([])
  const [newSessionModalOpen, setNewSessionModalOpen] = useState(false);

  const navigate = useNavigate()

  /**
   * fetch data from the back end.
   */
  useEffect(() => {
    async function init() { 
      try{
        setIsLoading(true)
        setTables(await getTables())
      }
      finally{
        setIsLoading(false)
        console.log(isLoading)
      }
    }

    init()
  }, [])

  const handleCloseDetail = () => {
    setSelectedTable(null);
  }

  const handleLogout = async () => 
    { 
      setIsLoading(true)
      try{
        await logout()
      }
      finally{
        setIsLoading(false)
        const redirectTo = '/login'
        console.log("here")
        navigate(redirectTo, {replace: true})
      }

  }


  const handleSessionCreated = (updatedTable: Table) => {
    setTables((prev) => prev.map((t) => (t.id === updatedTable.id ? updatedTable : t)));
    setSelectedTable(updatedTable); // keep drawer in sync if it's still open
  };

  return (
    <AppShell navbar={{ width: 220, breakpoint: 'sm' }} padding="md">
      <AppShell.Navbar p="md">
        <Title order={4} mb="md">BilliardHallPro</Title>
        <AppShell.Section grow>
          <NavLink
            label="Tables"
            active={activeSection === 'tables'}
            onClick={() => setActiveSection('tables')}
          />
          <NavLink
            label="Player Queue"
            active={activeSection === 'playerQueue'}
            onClick={() => setActiveSection('playerQueue')}
          />
        </AppShell.Section>
        <AppShell.Section>
          <Button
            fullWidth
            variant='subtle'
            color='red'
            leftSection={<IconLogout size={16}/> }
            onClick={handleLogout}
            loading={isLoading}
          >
            Logout
          </Button>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {activeSection === 'tables' && (
          <>
            <Title order={2} mb="md">Tables</Title>
            {/* Placeholder grid — swap for real TableGrid component later */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
              {tables.map((table) => (
                <TableOverview table={table} onClick={() => setSelectedTable(table)} />
              ))}
            </SimpleGrid>
          </>
        )}

        {activeSection === 'playerQueue' && (
          <Title order={2}>Player Queue</Title>
          // Placeholder — build PlayerQueue component later
        )}
      </AppShell.Main>

      <Drawer
        opened={selectedTable !== null}
        onClose={handleCloseDetail}
        position="right"
        title={selectedTable?.name ?? 'Table Detail'}
        size="md"
      >
        {selectedTable && (
          <Stack>
            <Text>
              <strong>Type:</strong> {selectedTable.table_type.replace('_', ' ')}
            </Text>
            <Text>
              <strong>Max players:</strong> {selectedTable.max_players}
            </Text>
            <Text>
              <strong>Status:</strong>{' '}
              {selectedTable.current_session ? 'Occupied' : 'Available'}
            </Text>
            {selectedTable.current_session ? (
              <>
                <Text>
                  <strong>Session type:</strong> {selectedTable.current_session.session_type}
                </Text>
                <Text>
                  <strong>Started:</strong> {selectedTable.current_session.started_at}
                </Text>
                <Text>
                  <strong>Rate:</strong> ${selectedTable.current_session.rate}/hr
                </Text>
                <Text>
                  <strong>Current charge:</strong> ${selectedTable.current_session.charge}
                </Text>
              </>
            ): (
              <Button mt="md" onClick={() => setNewSessionModalOpen(true)}>
                New Session
              </Button>
            )}
          </Stack>
        )}
      </Drawer>

      {selectedTable && (
        <NewSessionModal
          opened={newSessionModalOpen}
          onClose={() => setNewSessionModalOpen(false)}
          table={selectedTable}
          onSessionCreated={(updatedTable) => {
            handleSessionCreated(updatedTable);
            setNewSessionModalOpen(false);
          }}
        />
      )}
    </AppShell>
  );
}

export default OverviewScreen;