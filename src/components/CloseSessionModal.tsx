import { useState, useMemo, useEffect } from 'react';
import {
  Modal, Button, Group, Stack, Text, SegmentedControl, Divider, Tooltip, Alert,
} from '@mantine/core';
import {  IconPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { BillCard } from './BillCard';
import type { Table } from '../types/models/tables/Table';
import { sendBillToPOS } from '../api/pos';
import { closeSession } from '../api/session';
import {v4 as uuidv4} from 'uuid';
import { useTranslation } from 'react-i18next';
import { roundToNearestFifteenMinutes } from '../helpers/math';
import { getActiveInterval } from '../helpers/tableHelpers';
import type { Bill } from '../types/models/billing/Bill';
import type { DiscountType, Discount } from '../types/models/billing/Discount';
import { getSessionBills } from '../api/billing';
import { addTableTime, calculateBillSubtotal, mergeBills, splitBills } from '../helpers/billingHelpers';

interface CloseSessionModalProps {
  opened: boolean;
  onClose: () => void;
  table: Table;
  onSessionClosed: (updatedTable: Table) => void;
}

type BillingMode = 'single' | 'split'

/**
 * This component handles closing out a game and dealing with the bills.
 * It is opened when the user clicks 'Close Session' on the OverviewScreen.
 */
function CloseSessionModal({ opened, onClose, table, onSessionClosed }: CloseSessionModalProps) {
  const session = table.current_session!; //If this were null, we'd not be able to close the session since it doesn't exist.
  const attachedPlayers = session?.players ?? [];
  const canSplit = session.players.length >= 2;

  const [mode, setMode] = useState<BillingMode>('split');
  const [bills, setBills] = useState<Bill[]>([]);
  const [isClosing, setIsClosing] = useState(false);
  const [sendingBillId, setSendingBillId] = useState<string | null>(null);
  const [now, _] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const totalCharge = useMemo(() => {
    const interval = getActiveInterval(table)
    const rate = interval.rate
    const hours = (now.getTime() - new Date(session.started_at).getTime()) / 60 / 1000 / 60 //MS to hours
    const roundedHours = roundToNearestFifteenMinutes(hours)
    switch (interval.rate_type) {
      case (0):
        return rate
      case (1):
        return rate * session.players.length
      case (2):
        return rate * roundedHours
      case (3):
        return rate * roundedHours * session.players.length
    }
  }, [table])

  const { t } = useTranslation()

  // Initialize / reset bills whenever the modal opens or the mode changes
  useEffect(() => {
    load()

    async function load(){
      try {
        if (!opened || !session) return;
        setLoading(true)

        

        const share = totalCharge / session.players.length;
        await getSessionBills(session.id).then((bs) => {
          for (const bill of bs) {
            addTableTime(bill, share)
            console.log(share)
            calculateBillSubtotal(bill)
          }
          setBills(bs)
        })
      }
      finally {
        setLoading(false)
      }
    }
  }, [opened, session?.id]);

  const unassignedPlayerIds = useMemo(() => {
    if(!loading){
      const assigned = new Set(bills?.flatMap((b) => b.player_ids));
      return attachedPlayers.filter((p) => !assigned.has(p.id)).map((p) => p.id);
    }
    return []
  }, [bills, attachedPlayers, loading]);

  const recomputeSplitShares = (updatedBills: Bill[]): Bill[] => {
    const totalAssigned = updatedBills.reduce((sum, b) => sum + b.player_ids.length, 0);
    if (totalAssigned === 0) return updatedBills;
    return updatedBills.map((bill) => {
      if (bill.player_ids.length === 0) return bill;
      const share = (totalCharge * bill.player_ids.length) / totalAssigned;
      return {
        ...bill,
        lineItems: bill.line_items.map((item) =>
          item.type === 'table_time' ? { ...item, amount: share } : item
        ),
      };
    });
  };

  const handlePlayerAssignment = (billId: string, playerIds: string[]) => {
    setBills((prev) => {
      const updated = prev.map((b) =>
        b.id === billId ? { ...b, playerIds: playerIds } : b
      );
      return recomputeSplitShares(updated);
    });
  };

  const handleAddBill = () => {
    
  };

  const handleRemoveBill = (billId: string) => {
    setBills((prev) => recomputeSplitShares(prev.filter((b) => b.id !== billId)));
  };

  const handleAddDiscount = (billId: string, type: DiscountType, percentOff?: number, amountOff?: number) => {
    const discount: Discount = {
      id: uuidv4(),
      bill: billId,
      type,
      description: t("CloseSessionModal.Discount"),
      percent_off: percentOff?.toString() ?? null,
      amount_off: amountOff?.toString() ?? null,
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

  const allBillsSent = bills?.length > 0 && bills.every((b) => !b.deleted && b.sent_to_pos);
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

  return !loading 
      && 
      (
      <Modal opened={opened} onClose={onClose} title={t("CloseSessionModal.ModalTitle", {tableName: table.name})} centered size="lg">
      <Stack>
        <Group justify="space-between">
          <Text fw={600} size="lg">
            {t("CloseSessionModal.Total", {Total: totalCharge.toFixed(2)})}
          </Text>
          <Tooltip label={canSplit ? '' : t("CloseSessionModal.SplitBillingTooltip")} disabled={canSplit}>
            <SegmentedControl
              value={mode}
              onChange={(v) => {
                if(v === 'single'){
                  const merged = mergeBills(bills)
                  setBills(merged)
                }
                else {
                  const split = splitBills(bills)
                  setBills(split)
                }
                setMode(v as BillingMode)}
              }
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
          {bills.filter(bill => !bill.deleted).map((bill) => (
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
  )
}
export default CloseSessionModal;