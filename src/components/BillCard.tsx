import { Card, Stack, Group, ActionIcon, Tooltip, Button, Select, NumberInput, Divider, Text, Textarea } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Table } from "../types/models/tables/Table";
import type { Bill } from "../types/models/billing/Bill";
import type { DiscountType } from "../types/models/billing/Discount";
import {  DISCOUNT_TYPE_OPTIONS, type BillingMode } from "../helpers/billingHelpers";

interface BillCardProps {
  bill: Bill;
  mode: BillingMode;
  attachedPlayers: Table['current_session'] extends null ? never : NonNullable<Table['current_session']>['players'];
  isSending: boolean;
  isInGroup: boolean;
  onAddDiscount: (type: DiscountType, percentOff?: number, amountOff?: number) => void;
  onRemoveDiscount: (discountId: string) => void;
  onSendToPOS: () => void;
  onAddToGroup: () => void;
}

export function BillCard({
  bill, mode, attachedPlayers, isSending, isInGroup, onAddDiscount, onRemoveDiscount, onSendToPOS, onAddToGroup
}: BillCardProps) {
  const [discountType, setDiscountType] = useState<DiscountType>('member');
  const [discountPercent, setDiscountPercent] = useState<number | ''>('');

  const { t } = useTranslation()

  return (
    <Card withBorder padding="md">
      <Stack gap="xs">
        {mode === 'split' && (
          <Group justify="space-between" align="flex-end">
            <Text>{attachedPlayers.map(p => p.first_name + " " + p.last_name)}</Text>
          </Group>
        )}

        {bill.line_items.map((item) => (
          <Group key={item.id} justify="space-between">
            <Text size="sm">{item.description}</Text>
            <Text size="sm">${Number(item.amount).toFixed(2)}</Text>
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
              {discount.percent_off ? ` (${discount.percent_off}%)` : ''}
              {discount.amount_off ? ` ($${discount.amount_off})` : ''}
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
          <Text fw={600}>Total: ${bill.subtotal}</Text>
          <Group justify="left">
            <Button 
              size="sm" 
              onClick={onAddToGroup} 
              loading={isSending} 
              disabled={bill.sent_to_pos} 
              color={bill.sent_to_pos ? 'green' : undefined}>{isInGroup ? "Remove from group" : "Add to group"}</Button>
            <Button size="sm" onClick={onSendToPOS} loading={isSending} disabled={bill.sent_to_pos} color={bill.sent_to_pos ? 'green' : undefined}>
              {bill.sent_to_pos ? 'Sent ✓' : 'Send to POS'}
            </Button>
          </Group>
        </Group>
      </Stack>
    </Card>
  );
}