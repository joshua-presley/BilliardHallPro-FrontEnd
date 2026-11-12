import { useEffect, useState } from 'react';
import { AppShell, NavLink, Title, SimpleGrid,  Button } from '@mantine/core';
import type { Table } from '../types/models/tables/Table';
import { logout } from '../api/auth';
import { IconLogout } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import TableOverview from '../components/TableOverview';
import { getTables } from '../api/table';
import NewSessionModal from '../components/NewSessionModal';
import { useTranslation } from 'react-i18next';
import CloseSessionModal from '../components/CloseSessionModal';
import type { MenuItem } from '../types/models/menu/MenuItem';
import type { Category } from '../types/models/menu/Category';
import { getCategories, getMenuItems } from '../api/menu';
import MenuSection from '../components/MenuSection';
import TableInfoDrawer from '../components/TableInfoDrawer';

type SidebarSection = 'tables' | 'playerQueue' | 'menu';

/**
 * This screen shows an overview of the hall. It displays tables
 * as a grid with information about their availability, or if they
 * are occupied, it shows how long and how many players there are.
 * 
 * Also shows information about the player queue.
 */
function OverviewScreen() {
  const [activeSection, setActiveSection] = useState<SidebarSection>('tables');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [tables, setTables] = useState<Table[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newSessionModalOpen, setNewSessionModalOpen] = useState(false);
  const [closeSessionModalOpen, setCloseSessionModalOpen] = useState(false);

  const navigate = useNavigate()
  const { t } = useTranslation()

  /**
   * fetch data from the back end.
   */
  useEffect(() => {
    async function init() { 
      try{
        setIsLoading(true)
        setTables(await getTables())
        setMenuItems(await getMenuItems())
        setCategories(await getCategories())
      }
      finally{
        setIsLoading(false)
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
        <Title order={4} mb="md">{t("OverviewScreen.AppTitle")}</Title>
        <AppShell.Section grow>
          <NavLink
            label={t("OverviewScreen.Tables")}
            active={activeSection === 'tables'}
            onClick={() => setActiveSection('tables')}
          />
          <NavLink
            label={t('Sidebar.Menu')} 
            active={activeSection === 'menu'} 
            onClick={() => setActiveSection('menu')} />
          <NavLink
            label={t("OverviewScreen.PlayerQueue")}
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
            {t("Common.Logout")}
          </Button>
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {activeSection === 'tables' && (
          <>
            <Title order={2} mb="md">{t("OverviewScreen.Tables")}</Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
              {tables.map((table) => (
                <TableOverview table={table} onClick={() => setSelectedTable(table)} />
              ))}
            </SimpleGrid>
          </>
        )}
        {activeSection === 'menu' && (
          <MenuSection menuItems={menuItems} categories={categories} />
        )}
        {activeSection === 'playerQueue' && (
          <Title order={2}>{t("OverviewScreen.PlayerQueue")}</Title>
          // Placeholder — build PlayerQueue component later
        )}
      </AppShell.Main>

      <TableInfoDrawer
        selectedTable={selectedTable}
        handleCloseDetail={handleCloseDetail}
        setNewSessionModalOpen={setNewSessionModalOpen}
        setCloseSessionModalOpen={setCloseSessionModalOpen}
      />
      
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

      {selectedTable?.current_session && (
        <CloseSessionModal
          opened={closeSessionModalOpen}
          onClose={() => setCloseSessionModalOpen(false)}
          table={selectedTable}
          onSessionClosed={(updatedTable) => {
            handleSessionCreated(updatedTable); 
            setCloseSessionModalOpen(false);
          }}
        />
      )}
    </AppShell>
  );
}

export default OverviewScreen;