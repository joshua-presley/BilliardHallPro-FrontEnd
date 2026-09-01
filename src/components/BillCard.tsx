import { Card, Stack, Group, MultiSelect, ActionIcon, Tooltip, Button, Select, NumberInput, Divider, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { type Bill, type BillingMode, DISCOUNT_TYPE_OPTIONS, type DiscountType, calculateBillTotal } from "../types/billing";
import type { Table } from "../types/models/Table";
import { useTranslation } from "react-i18next";

interface BillCardProps {
  bill: Bill;
  mode: BillingMode;
  attachedPlayers: Table['current_session'] extends null ? never : NonNullable<Table['current_session']>['players'];
  unassignedPlayerIds: number[];
  isSending: boolean;
  onAssignPlayers: (playerIds: string[]) => void;
  onAddDiscount: (type: DiscountType, percentOff?: number, amountOff?: number) => void;
  onRemoveDiscount: (discountId: string) => void;
  onSendToPOS: () => void;
  onRemoveBill?: () => void;
}

export function BillCard({
  bill, mode, attachedPlayers, unassignedPlayerIds, isSending,
  onAssignPlayers, onAddDiscount, onRemoveDiscount, onSendToPOS, onRemoveBill,
}: BillCardProps) {
  const [discountType, setDiscountType] = useState<DiscountType>('member');
  const [discountPercent, setDiscountPercent] = useState<number | ''>('');

  const total = calculateBillTotal(bill);

  const { t } = useTranslation()

  // Options for this bill's player select: players already in this bill, plus
  // anyone still unassigned — players assigned to *other* bills are excluded.
  const availableOptions = attachedPlayers
    .filter((p) => bill.playerIds.includes(p.id) || unassignedPlayerIds.includes(p.id))
    .map((p) => ({ value: String(p.id), label: `${p.first_name} ${p.last_name}` }));

  return (
    <Card withBorder padding="md">
      <Stack gap="xs">
        {mode === 'split' && (
          <Group justify="space-between" align="flex-end">
            <MultiSelect
              label="Players on this bill"
              data={availableOptions}
              value={bill.playerIds.map(String)}
              onChange={onAssignPlayers}
              style={{ flexGrow: 1 }}
            />
            {onRemoveBill && (
              <ActionIcon color="red" variant="subtle" onClick={onRemoveBill}>
                <IconTrash size={16} />
              </ActionIcon>
            )}
          </Group>
        )}

        {bill.lineItems.map((item) => (
          <Group key={item.id} justify="space-between">
            <Text size="sm">{item.description}</Text>
            <Text size="sm">${item.amount.toFixed(2)}</Text>
          </Group>
        ))}

        {/* Extensibility point: future food/bar charges would append additional
            LineItems here via a real item picker, once that flow exists. */}
        <Tooltip label="Bar/food tab integration coming soon">
          <Button size="xs" variant="subtle" disabled>
            {t("CloseSessionModal.BillCard.AddChargeFoodBar")}
          </Button>
        </Tooltip>

        {bill.discounts.map((discount) => (
          <Group key={discount.id} justify="space-between">
            <Text size="sm" c="dimmed">
              {discount.description}
              {discount.percentOff ? ` (${discount.percentOff}%)` : ''}
              {discount.amountOff ? ` ($${discount.amountOff})` : ''}
            </Text>
            <ActionIcon size="sm" color="red" variant="subtle" onClick={() => onRemoveDiscount(discount.id)}>
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        ))}

        <Group align="flex-end" gap="xs">
          <Select
            label={t("CloseSessionModal.Discount")}
            size="xs"
            data={DISCOUNT_TYPE_OPTIONS}
            value={discountType}
            onChange={(v) => setDiscountType(v as DiscountType)}
            style={{ flexGrow: 1 }}
          />
          <NumberInput
            label={t("CloseSessionModal.BillCard.PercentOff")}
            size="xs"
            min={0}
            max={100}
            value={discountPercent}
            onChange={(v) => setDiscountPercent(v === '' ? '' : Number(v))}
            style={{ width: 90 }}
          />
          <Button
            size="xs"
            variant="light"
            onClick={() => {
              if (discountPercent === '' || discountPercent <= 0) return;
              onAddDiscount(discountType, discountPercent);
              setDiscountPercent('');
            }}
          >
            {t("CloseSessionModal.BillCard.Add")}
          </Button>
        </Group>

        <Divider />

        <Group justify="space-between">
          <Text fw={600}>Total: ${total.toFixed(2)}</Text>
          <Button size="sm" onClick={onSendToPOS} loading={isSending} disabled={bill.sentToPOS} color={bill.sentToPOS ? 'green' : undefined}>
            {bill.sentToPOS ? 'Sent ✓' : 'Send to POS'}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}