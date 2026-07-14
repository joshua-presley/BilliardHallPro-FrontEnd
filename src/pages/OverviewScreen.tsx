import { useEffect, useState } from 'react';
import { AppShell, NavLink, Title, Drawer, SimpleGrid, Card, Text, Badge, Stack, Group, Button } from '@mantine/core';
import type { Table } from '../types/models/Table';
import { logout } from '../api/auth';
import { IconLogout } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

type SidebarSection = 'tables' | 'playerQueue';

// Placeholder data — replace with real API data once TableGrid is built
const PLACEHOLDER_TABLES: Table[] = [
  {
    id: 1,
    name: 'Table 1',
    max_players: 4,
    table_type: 'bar_box',
    schedule: null,
    current_session: null,
  },
  {
    id: 2,
    name: 'Table 2',
    max_players: 2,
    table_type: 'nine_foot',
    schedule: null,
    current_session: {
      id: 10,
      table: 2,
      session_type: 'regular',
      started_at: new Date().toISOString(),
      ended_at: null,
      rate: '12.00',
      players: [],
      opened_by: null,
      is_active: true,
      duration_minutes: 24,
      charge: '4.80',
    },
  },
  {
    id: 3,
    name: 'Snooker Table',
    max_players: 4,
    table_type: 'snooker',
    schedule: null,
    current_session: null,
  },
];

function OverviewScreen() {
  const [activeSection, setActiveSection] = useState<SidebarSection>('tables');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const initialize = useEffect(() => {

  })

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
  };

  const handleCloseDetail = () => {
    setSelectedTable(null);
  };

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
              {PLACEHOLDER_TABLES.map((table) => (
                <Card
                  key={table.id}
                  shadow="sm"
                  padding="lg"
                  withBorder
                  onClick={() => handleTableClick(table)}
                  style={{ cursor: 'pointer' }}
                >
                  <Group justify="space-between" mb="xs">
                    <Text fw={500}>{table.name}</Text>
                    <Badge color={table.current_session ? 'green' : 'gray'}>
                      {table.current_session ? 'Occupied' : 'Available'}
                    </Badge>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {table.table_type.replace('_', ' ')} · Max {table.max_players} players
                  </Text>
                </Card>
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
            {selectedTable.current_session && (
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
            )}
          </Stack>
        )}
      </Drawer>
    </AppShell>
  );
}

export default OverviewScreen;