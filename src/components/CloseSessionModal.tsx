import { useState, useMemo, useEffect } from 'react';
import {
  Modal, Button, Group, Stack, Text, SegmentedControl, Divider, Tooltip
} from '@mantine/core';
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
  const [billGroup, setBillGroup] = useState<string[]>([]);
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
  }, [table, opened])

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
      setBills((prev) => prev.map((b) => {
        if(b.id === billId){
          b.sent_to_pos = true
        }
        return b
      }))
    } catch {
      notifications.show({ color: 'red', title: t("CloseSessionModal.POSErrorTitle"), message: t('CloseSessionModal.POSErrorMessage') });
    } finally {
      setSendingBillId(null);
      
    }
  };

  /**
   * Toggle whether a selected bill is in a grouping.
   * @param billId ID of the bill clicked. 
   * @remarks Bills in a group will send to POS at the same time.
   */
  const handleToggleGrouping = (billId: string) => {
    if(billGroup.includes(billId)){
      setBillGroup((prev) =>{ 
        prev = prev.filter(p => p !== billId)
        return prev
      })
    }
    else { 
      setBillGroup((prev) => {
        const next = [...prev, billId]
        return next
      }) 
    }
  }

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

  const allBillsSent = bills?.length > 0 && bills.every((b) => !b.deleted ? b.sent_to_pos : true)

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

        <Divider />

        <Stack gap="md">
          {bills.filter(bill => !bill.deleted).map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              mode={mode}
              attachedPlayers={attachedPlayers.filter(p => bill.player_ids.some(pid => pid === p.id))}
              isSending={sendingBillId === bill.id}
              isInGroup={billGroup.includes(bill.id)}
              onAddDiscount={(type, pct, amt) => handleAddDiscount(bill.id, type, pct, amt)}
              onRemoveDiscount={(discountId) => handleRemoveDiscount(bill.id, discountId)}
              onAddToGroup={() => handleToggleGrouping(bill.id)}
              onSendToPOS={() => handleSendToPOS(bill.id)}
            />
          ))}
        </Stack>

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>
            {t("Common.Cancel")}
          </Button>
          <Tooltip
            label={t("CloseSessionModal.SendAllBillsToPOSFirst")}
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