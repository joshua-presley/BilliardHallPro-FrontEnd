import { useState, useMemo, useEffect } from 'react';
import {
  Modal, Button, Group, Stack, Text, SegmentedControl, Divider, Tooltip, Alert,
} from '@mantine/core';
import {  IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { BillCard } from './BillCard';
import type { Table } from '../types/models/Table';
import { DISCOUNT_TYPE_OPTIONS, type Bill, type BillingMode, type Discount, type DiscountType } from '../types/billing';
import { sendBillToPOS } from '../api/pos';
import { closeSession } from '../api/session';

interface CloseSessionModalProps {
  opened: boolean;
  onClose: () => void;
  table: Table;
  onSessionClosed: (updatedTable: Table) => void;
}


function makeId(): string {
  return Math.random().toString(36).slice(2);
}

function CloseSessionModal({ opened, onClose, table, onSessionClosed }: CloseSessionModalProps) {
  const session = table.current_session;
  const totalCharge = 0
  const attachedPlayers = session?.players ?? [];
  const canSplit = attachedPlayers.length >= 2;

  const [mode, setMode] = useState<BillingMode>('single');
  const [bills, setBills] = useState<Bill[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [sendingBillId, setSendingBillId] = useState<string | null>(null);

  // Initialize / reset bills whenever the modal opens or the mode changes
  useEffect(() => {
    if (!opened || !session) return;

    if (mode === 'single') {
      setBills([
        {
          id: makeId(),
          playerIds: attachedPlayers.map((p) => p.id),
          lineItems: [{ id: makeId(), type: 'table_time', description: 'Table Time', amount: totalCharge }],
          discounts: [],
          sentToPOS: false,
        },
      ]);
    } else {
      // Default split: one bill per attached player, charge divided evenly by headcount.
      // NOTE: this is a headcount-proportional split of the single table charge, not
      // itemized per-player pricing — there's no per-player pricing model yet.
      const share = totalCharge / attachedPlayers.length;
      setBills(
        attachedPlayers.map((player) => ({
          id: makeId(),
          playerIds: [player.id],
          lineItems: [{ id: makeId(), type: 'table_time', description: 'Table Time (share)', amount: share }],
          discounts: [],
          sentToPOS: false,
        }))
      );
    }
  }, [opened, mode, session?.id]);

  const unassignedPlayerIds = useMemo(() => {
    const assigned = new Set(bills.flatMap((b) => b.playerIds));
    return attachedPlayers.filter((p) => !assigned.has(p.id)).map((p) => p.id);
  }, [bills, attachedPlayers]);

  const recomputeSplitShares = (updatedBills: Bill[]): Bill[] => {
    const totalAssigned = updatedBills.reduce((sum, b) => sum + b.playerIds.length, 0);
    if (totalAssigned === 0) return updatedBills;
    return updatedBills.map((bill) => {
      if (bill.playerIds.length === 0) return bill;
      const share = (totalCharge * bill.playerIds.length) / totalAssigned;
      return {
        ...bill,
        lineItems: bill.lineItems.map((item) =>
          item.type === 'table_time' ? { ...item, amount: share } : item
        ),
      };
    });
  };

  const handlePlayerAssignment = (billId: string, playerIds: string[]) => {
    setBills((prev) => {
      const numericIds = playerIds.map(Number);
      const updated = prev.map((b) =>
        b.id === billId ? { ...b, playerIds: numericIds } : b
      );
      return recomputeSplitShares(updated);
    });
  };

  const handleAddBill = () => {
    setBills((prev) => [
      ...prev,
      {
        id: makeId(),
        playerIds: [],
        lineItems: [{ id: makeId(), type: 'table_time', description: 'Table Time (share)', amount: 0 }],
        discounts: [],
        sentToPOS: false,
      },
    ]);
  };

  const handleRemoveBill = (billId: string) => {
    setBills((prev) => recomputeSplitShares(prev.filter((b) => b.id !== billId)));
  };

  const handleAddDiscount = (billId: string, type: DiscountType, percentOff?: number, amountOff?: number) => {
    const discount: Discount = {
      id: makeId(),
      type,
      description: DISCOUNT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? 'Discount',
      percentOff,
      amountOff,
    };
    setBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, discounts: [...b.discounts, discount] } : b))
    );
  };

  const handleRemoveDiscount = (billId: string, discountId: string) => {
    setBills((prev) =>
      prev.map((b) =>
        b.id === billId ? { ...b, discounts: b.discounts.filter((d) => d.id !== discountId) } : b
      )
    );
  };

  const handleSendToPOS = async (billId: string) => {
    const bill = bills.find((b) => b.id === billId);
    if (!bill) return;
    setSendingBillId(billId);
    try {
      await sendBillToPOS(bill);
      setBills((prev) => prev.map((b) => (b.id === billId ? { ...b, sentToPOS: true } : b)));
    } catch {
      notifications.show({ color: 'red', title: 'POS error', message: 'Could not send bill to POS.' });
    } finally {
      setSendingBillId(null);
    }
  };

  const allBillsSent = bills.length > 0 && bills.every((b) => b.sentToPOS);
  const allPlayersAssigned = mode === 'single' || unassignedPlayerIds.length === 0;

  const handleFinish = async () => {
    if (!session) return;
    setIsClosing(true);
    try {
      const closedSession = await closeSession(session.id);
      onSessionClosed({ ...table, current_session: null });
      notifications.show({ color: 'green', title: 'Session closed', message: `${table.name} is now available.` });
      onClose();
    } catch {
      notifications.show({ color: 'red', title: 'Error', message: 'Could not close the session.' });
    } finally {
      setIsClosing(false);
    }
  };

  if (!session) return null;

  return (
    <Modal opened={opened} onClose={onClose} title={`Close Session — ${table.name}`} centered size="lg">
      <Stack>
        <Group justify="space-between">
          <Text fw={600} size="lg">
            Total: ${totalCharge.toFixed(2)}
          </Text>
          <Tooltip label={canSplit ? '' : 'Split billing requires 2+ attached players'} disabled={canSplit}>
            <SegmentedControl
              value={mode}
              onChange={(v) => setMode(v as BillingMode)}
              disabled={!canSplit}
              data={[
                { label: 'One Bill', value: 'single' },
                { label: 'Separate Bills', value: 'split' },
              ]}
            />
          </Tooltip>
        </Group>

        {mode === 'split' && unassignedPlayerIds.length > 0 && (
          <Alert color="yellow">
            {unassignedPlayerIds.length} player(s) not yet assigned to a bill.
          </Alert>
        )}

        <Divider />

        <Stack gap="md">
          {bills.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              mode={mode}
              attachedPlayers={attachedPlayers}
              unassignedPlayerIds={unassignedPlayerIds}
              isSending={sendingBillId === bill.id}
              onAssignPlayers={(ids) => handlePlayerAssignment(bill.id, ids)}
              onAddDiscount={(type, pct, amt) => handleAddDiscount(bill.id, type, pct, amt)}
              onRemoveDiscount={(discountId) => handleRemoveDiscount(bill.id, discountId)}
              onSendToPOS={() => handleSendToPOS(bill.id)}
              onRemoveBill={mode === 'split' && bills.length > 1 ? () => handleRemoveBill(bill.id) : undefined}
            />
          ))}
        </Stack>

        {mode === 'split' && (
          <Button variant="light" leftSection={<IconPlus size={16} />} onClick={handleAddBill}>
            Add Bill Group
          </Button>
        )}

        <Divider />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Tooltip
            label={!allPlayersAssigned ? 'Assign all players to a bill first' : 'Send all bills to POS first'}
            disabled={allBillsSent}
          >
            <Button onClick={handleFinish} loading={isClosing} disabled={!allBillsSent}>
              Finish & Close Session
            </Button>
          </Tooltip>
        </Group>
      </Stack>
    </Modal>
  );
}
export default CloseSessionModal;