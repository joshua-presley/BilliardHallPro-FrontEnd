import { useMemo, useState } from 'react';
import { Badge, Card, Group, SimpleGrid, Stack, Text, TextInput, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { MenuItem } from '../types/models/menu/MenuItem';
import type { Category } from '../types/models/menu/Category';

interface MenuSectionProps {
  menuItems: MenuItem[];
  categories: Category[];
}

/**
 * Displays the menu grouped by category, with a search bar and
 * toggleable category tags for filtering.
 */
function MenuSection({ menuItems, categories }: MenuSectionProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const toggleCategory = (categoryId: number) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const groups = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filteredItems = menuItems.filter((item) => {
      const matchesCategory =
        selectedCategoryIds.length === 0 || selectedCategoryIds.includes(item.category.id);
      const matchesSearch =
        query === '' ||
        item.name.toLowerCase().includes(query) ||
        item.category.category_name.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    });

    // Follow the category list's order; drop categories with nothing to show.
    return categories
      .map((category) => ({
        category,
        items: filteredItems.filter((item) => item.category.id === category.id),
      }))
      .filter((group) => group.items.length > 0)
  }, [menuItems, categories, search, selectedCategoryIds])

  return (
    <Stack>
      <Title order={2}>{t('MenuSection.Title')}</Title>

      <TextInput
        placeholder={t('MenuSection.SearchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />

      <Group gap="xs">
        {categories.map((category) => {
          const isSelected = selectedCategoryIds.includes(category.id);
          return (
            <Badge
              key={category.id}
              size="lg"
              variant={isSelected ? 'filled' : 'light'}
              style={{ cursor: 'pointer' }}
              role="button"
              aria-pressed={isSelected}
              onClick={() => toggleCategory(category.id)}
            >
              {category.category_name}
            </Badge>
          );
        })}
      </Group>

      {groups.length === 0 ? (
        <Text c="dimmed">{t('MenuSection.NoItemsFound')}</Text>
      ) : (
        groups.map(({ category, items }) => (
          <Stack key={category.id} gap="xs">
            <Title order={4}>{category.category_name}</Title>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
              {items.map((item) => (
                <Card key={item.id} shadow="sm" padding="md" withBorder>
                  <Group justify="space-between" wrap="nowrap">
                    <Text fw={500}>{item.name}</Text>
                    <Text c="dimmed">${Number(item.price).toFixed(2)}</Text>
                  </Group>
                </Card>
              ))}
            </SimpleGrid>
          </Stack>
        ))
      )}
    </Stack>
  )
}

export default MenuSection;