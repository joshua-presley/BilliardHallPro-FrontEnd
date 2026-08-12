import { Card, Text, Group, Stack } from '@mantine/core';
import type { Table } from '../types/models/Table';
import PlayerBadge from './PlayerBadge';
import { formatSessionType, formatStartTime } from '../helpers/formatHelpers';
import { useTranslation } from 'react-i18next';

interface TableOverviewProps {
  table: Table;
  onClick?: (table: Table) => void;
}

/**
 * Component which displays table information as a card. Used in OverviewScreen
 * to show tables in a grid.
 */
function TableOverview(props: TableOverviewProps) {
  const session = props.table.current_session;
  const { t } = useTranslation();

  return (
    <Card
      shadow="sm"
      padding="md"
      withBorder
      onClick={() => props.onClick?.(props.table)}
      style={{
        cursor: props.onClick ? 'pointer' : 'default',
        aspectRatio: '1 / 1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top row: name (left) + player count (right, only if session active) */}
      <Group justify="space-between" align="flex-start">
        <Text fw={600}>{props.table.name}</Text>
        {session && (
          <Text size="sm" c="dimmed">
            {session.player_count}/{props.table.max_players}
          </Text>
        )}
      </Group>

      {/* Center: player badges */}
      <Stack align="center" justify="center" style={{ flexGrow: 1 }} gap="xs">
        {session ? (
          <Group justify="center" gap="xs">
            {session.players.map((player) => (
              <PlayerBadge key={player.id} player={player} />
            ))}
          </Group>
        ) : (
          <Text size="sm" c="dimmed">
            Available
          </Text>
        )}
      </Stack>

      {/* Bottom row: session type (left) + start time (center) + rate (right) */}
      <Group justify="space-between" align="flex-end">
        <Text size="xs" c="dimmed">
          {session ? formatSessionType(session.session_type) : ''}
        </Text>
        <Text size="xs" c="dimmed">
          {session ? formatStartTime(session.started_at) : ''}
        </Text>
        <Text size="xs" c="dimmed">
          {session ? `$${session.rate}/hr` : ''}
        </Text>
      </Group>
    </Card>
  );
}

export default TableOverview;