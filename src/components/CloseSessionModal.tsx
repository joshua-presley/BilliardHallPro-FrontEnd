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
import {v4 as uuidv4} from 'uuid';
import { useTranslation } from 'react-i18next';

interface CloseSessionModalProps {
  opened: boolean;
  onClose: () => void;
  table: Table;
  onSessionClosed: (updatedTable: Table) => void;
}

/**
 * This component handles closing out a game and dealing with the bills.
 * It is opened when the user clicks 'Close Session' on the OverviewScreen.
 */
function CloseSessionModal({ opened, onClose, table, onSessionClosed }: CloseSessionModalProps) {
  const session = table.current_session!; //If this were null, we'd not be able to close the session since it doesn't exist.
  const totalCharge = 0
  const attachedPlayers = session?.players ?? [];
  const canSplit = session.player_count >= 2;

  const [mode, setMode] = useState<BillingMode>('single');
  const [bills, setBills] = useState<Bill[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [sendingBillId, setSendingBillId] = useState<string | null>(null);

  const { t } = useTranslation()

  // Initialize / reset bills whenever the modal opens or the mode changes
  useEffect(() => {
    if (!opened || !session) return;

    
    if (mode === 'single') {
      setBills([
        {
          id: uuidv4(),
          playerIds: attachedPlayers.map((p) => p.id),
          lineItems: [{ id: uuidv4(), type: 'table_time', description: t("CloseSessionModal.TableTime"), amount: totalCharge }],
          discounts: [],
          sentToPOS: false,
        },
      ]);
    } else {
      // Default split: one bill per attached player, charge divided evenly by headcount.
      // NOTE: this is a headcount-proportional split of the single table charge, not
      // itemized per-player pricing — there's no per-player pricing model yet.
      const share = totalCharge / session.player_count;
      setBills(
        attachedPlayers.map((player) => ({
          id: uuidv4(),
          playerIds: [player.id],
          lineItems: [{ id: uuidv4(), type: 'table_time', description: t("CloseSessionModal.TableTimeShare"), amount: share }],
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
        id: uuidv4(),
        playerIds: [],
        lineItems: [{ id: uuidv4(), type: 'table_time', description: t("CloseSessionModal.TableTimeShare"), amount: 0 }],
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
      id: uuidv4(),
      type,
      description: DISCOUNT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? t("CloseSessionModal.Discount"),
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
      notifications.show({ color: 'red', title: t("CloseSessionModal.POSErrorTitle"), message: t('CloseSessionModal.POSErrorMessage') });
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
      await closeSession(session.id);
      onSessionClosed({ ...table, current_session: null });
      notifications.show({ color: 'green', title: t("CloseSessionModal.SessionClosedTitle"), message: t("CloseSessionModal.SessionClosedMessage", {tableName: table.name})});
      onClose();
    } catch {
      notifications.show({ color: 'red', title: t("Common.ErrorTitle"), message: t("CloseSessionModal.SessionCloseErrorMessage")});
    } finally {
      setIsClosing(false);
    }
  };

  if (!session) return null;

  return (
    <Modal opened={opened} onClose={onClose} title={t("CloseSessionModal.ModalTitle", {tableName: table.name})} centered size="lg">
      <Stack>
        <Group justify="space-between">
          <Text fw={600} size="lg">
            {t("CloseSessionModal.Total", {Total: totalCharge.toFixed(2)})}
          </Text>
          <Tooltip label={canSplit ? '' : t("CloseSessionModal.SplitBillingTooltip")} disabled={canSplit}>
            <SegmentedControl
              value={mode}
              onChange={(v) => setMode(v as BillingMode)}
              disabled={!canSplit}
              data={[
                { label: t("CloseSessionModal.OneBill"), value: 'single'},
                { label: t("CloseSessionModal.SeparateBills"), value: 'split' },
              ]}
            />
          </Tooltip>
        </Group>

        {mode === 'split' && unassignedPlayerIds.length > 0 && (
          <Alert color="yellow">
            {t("CloseSessionModal.PlayersNotAssigned", {playerCount: unassignedPlayerIds.length})}
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
            {t("CloseSessionModal.AddBillGroup")}
          </Button>
        )}

        <Divider />

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            {t("Common.Cancel")}
          </Button>
          <Tooltip
            label={!allPlayersAssigned ? t("CloseSessionModal.AssignAllPlayersFirst") : t("CloseSessionModal.SendAllBillsToPOSFirst")}
            disabled={allBillsSent}
          >
            <Button onClick={handleFinish} loading={isClosing} disabled={!allBillsSent}>
              {t("CloseSessionModal.FinishAndClose")}
            </Button>
          </Tooltip>
        </Group>
      </Stack>
    </Modal>
  );
}
export default CloseSessionModal;