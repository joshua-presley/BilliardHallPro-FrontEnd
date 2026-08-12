import { useState, useEffect } from 'react';
import { Modal, Button, Group, Stack, Text, SimpleGrid, MultiSelect } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import type { Table } from '../types/models/Table';
import type { SessionType } from '../types/models/enums';
import type { Player } from '../types/models/Player';
import { searchPlayers } from '../api/player';
import { createSession } from '../api/session';


interface NewSessionModalProps {
  opened: boolean;
  onClose: () => void;
  table: Table;
  onSessionCreated: (updatedTable: Table) => void;
}

const GAME_TYPE_OPTIONS: { value: SessionType; label: string }[] = [
  { value: 'regular', label: 'Regular Play' },
  { value: 'league', label: 'League' },
  { value: 'tournament', label: 'Tournament' },
  { value: 'reserved', label: 'Reserved' },
];

const DEFAULT_GAME_TYPE: SessionType = 'regular';

/**
 * Popup that allows staff to create a new session.
 * Will prompt them for information about the table, the number of players,
 * the type of game, and member info if applicable.
 */
function NewSessionModal({ opened, onClose, table, onSessionCreated }: NewSessionModalProps) {
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [gameType, setGameType] = useState<SessionType>(DEFAULT_GAME_TYPE);

  const [memberSearch, setMemberSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(memberSearch, 300);
  const [memberOptions, setMemberOptions] = useState<Player[]>([]);
  const [selectedMemberIds, setSelectedMemberId] = useState<string[] | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setMemberOptions([]);
      return;
    }
    setIsSearching(true);
    searchPlayers(debouncedSearch)
      .then(setMemberOptions)
      .finally(() => setIsSearching(false));
  }, [debouncedSearch]);


  const resetForm = () => {
    setPlayerCount(null);
    setGameType(DEFAULT_GAME_TYPE);
    setMemberSearch('');
    setMemberOptions([]);
    setSelectedMemberId(undefined);
  };

  const handleCancel = () => {
    const confirmed = window.confirm('Discard the information you\'ve entered?');
    if (!confirmed) { 
        return
    }
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (playerCount === null) {
      notifications.show({
        color: 'red',
        title: 'Missing information',
        message: 'Please select the number of players.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: rate should come from the table's active Schedule/TableInterval
      // once that lookup logic is built — hardcoded placeholder for now.
      const defaultRate = '10.00';

      const session = await createSession({
        table: table.id,
        session_type: gameType,
        rate: defaultRate,
        player_count: playerCount,
        player_ids: selectedMemberIds ? selectedMemberIds.map(memberId => Number(memberId)) : [],
      });

      notifications.show({
        color: 'green',
        title: 'Session started',
        message: `${table.name} — ${playerCount} player(s), ${GAME_TYPE_OPTIONS.find((g) => g.value === gameType)?.label}.`,
      });

      onSessionCreated({ ...table, current_session: session });
      resetForm();
      onClose();
    } catch (err) {
      notifications.show({
        color: 'red',
        title: 'Something went wrong',
        message: 'Could not create the session. Please try again',
        onClose: () => setIsSubmitting(false)
      });
    }
  };

  const memberSelectData = memberOptions.map((p) => ({
    value: String(p.id),
    label: `${p.first_name} ${p.last_name} (#${p.id})`,
  }));

  return (
    <Modal opened={opened} onClose={handleCancel} title={`New Session — ${table.name}`} centered size="md">
      <Stack>
        <div>
          <Text size="sm" fw={500} mb="xs">
            Number of Players
          </Text>
          <SimpleGrid cols={Math.min(table.max_players, 6)} spacing="xs">
            {Array.from({ length: table.max_players }, (_, i) => i + 1).map((n) => (
              <Button
                key={n}
                variant={playerCount === n ? 'filled' : 'light'}
                onClick={() => setPlayerCount(n)}
              >
                {n}
              </Button>
            ))}
          </SimpleGrid>
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Game Type
          </Text>
          <SimpleGrid cols={2} spacing="xs">
            {GAME_TYPE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={gameType === option.value ? 'filled' : 'light'}
                onClick={() => setGameType(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </SimpleGrid>
        </div>

        <MultiSelect
          label="Member"
          placeholder="Search by name or member number"
          searchable
          searchValue={memberSearch}
          onSearchChange={setMemberSearch}
          data={memberSelectData}
          value={selectedMemberIds}
          onChange={setSelectedMemberId}
          nothingFoundMessage={isSearching ? 'Searching...' : 'No members found'}
          clearable
        />

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={isSubmitting}>
            Create
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default NewSessionModal;