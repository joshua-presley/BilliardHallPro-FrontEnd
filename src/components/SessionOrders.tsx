import { useEffect, useState } from 'react';
import { ActionIcon, Group, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { addMenuItem, getSessionBills } from '../api/billing';
import AddMenuItemModal from './AddMenuItemModal';
import type { MenuItem } from '../types/models/menu/MenuItem';
import type { Player } from '../types/models/tables/Player';
import type { TableSession } from '../types/models/tables/TableSession';
import type { Bill } from '../types/models/billing/Bill';

interface SessionOrdersProps {
  session: TableSession;
  menuItems: MenuItem[];
}

function SessionOrders({ session, menuItems }: SessionOrdersProps) {
  const { t } = useTranslation();
  const [bills, setBills] = useState<Bill[]>([]);
  const [orderingFor, setOrderingFor] = useState<Player | null>(null);

  useEffect(() => {
    getSessionBills(session.id)
      .then(setBills)
      .catch(() =>
        notifications.show({ color: 'red', title: t('Common.ErrorTitle'), message: t('SessionOrders.LoadError') })
      );
  }, [session.id]);

  const menuLinesFor = (playerId: string) =>
    bills
      .filter((b) => b.player_ids.includes(playerId))
      .flatMap((b) => b.line_items)
      .filter((li) => li.type === 'menu');

  const handleSelect = async (item: MenuItem) => {
    if (!orderingFor) return;
    try {
      const updated = await addMenuItem(session.id, orderingFor.id, item.id);
      setBills((prev) =>
        prev.some((b) => b.id === updated.id)
          ? prev.map((b) => (b.id === updated.id ? updated : b))
          : [...prev, updated]
      );
      setOrderingFor(null);
    } catch {
      notifications.show({ color: 'red', title: t('Common.ErrorTitle'), message: t('SessionOrders.AddError') });
    }
  };

  if (session.players.length === 0) {
    return <Text c="dimmed">{t('SessionOrders.NoPlayers')}</Text>;
  }

  return (
    <Stack>
      {session.players.map((player) => (
        <Stack key={player.id} gap={4}>
          <Title order={5}>{player.first_name} {player.last_name}</Title>
          {menuLinesFor(player.id).map((li) => (
            <Group key={li.id} justify="space-between">
              <Text size="sm">{li.description}</Text>
              <Text size="sm" c="dimmed">${Number(li.amount).toFixed(2)}</Text>
            </Group>
          ))}
          <Group justify="flex-end">
            <ActionIcon variant="light" aria-label={t('SessionOrders.AddItem')} onClick={() => setOrderingFor(player)}>
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
        </Stack>
      ))}

      <AddMenuItemModal
        opened={orderingFor !== null}
        onClose={() => setOrderingFor(null)}
        menuItems={menuItems}
        onSelect={handleSelect}
      />
    </Stack>
  );
}

export default SessionOrders;