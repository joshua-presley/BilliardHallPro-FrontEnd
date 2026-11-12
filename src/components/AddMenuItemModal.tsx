import { useMemo, useState } from 'react';
import { Button, Modal, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { MenuItem } from '../types/models/menu/MenuItem';

interface AddMenuItemModalProps {
  opened: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  onSelect: (item: MenuItem) => Promise<void>;
}

function AddMenuItemModal({ opened, onClose, menuItems, onSelect }: AddMenuItemModalProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuItems.filter(
      (i) => !q || i.name.toLowerCase().includes(q) || i.category.category_name.toLowerCase().includes(q)
    );
  }, [menuItems, search]);

  const handleSelect = async (item: MenuItem) => {
    setPendingId(item.id);
    try {
      await onSelect(item);
      setSearch('');
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title={t('AddMenuItemModal.Title')} centered>
      <Stack>
        <TextInput
          placeholder={t('MenuSection.SearchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          data-autofocus
        />
        <ScrollArea h={320}>
          <Stack gap="xs">
            {filtered.length === 0 && <Text c="dimmed">{t('MenuSection.NoItemsFound')}</Text>}
            {filtered.map((item) => (
              <Button
                key={item.id}
                variant="light"
                fullWidth
                justify="space-between"
                loading={pendingId === item.id}
                disabled={pendingId !== null && pendingId !== item.id}
                onClick={() => handleSelect(item)}
                rightSection={<Text size="sm">${Number(item.price).toFixed(2)}</Text>}
              >
                {item.name} · {item.category.category_name}
              </Button>
            ))}
          </Stack>
        </ScrollArea>
      </Stack>
    </Modal>
  );
}

export default AddMenuItemModal;