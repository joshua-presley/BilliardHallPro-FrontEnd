import { Drawer, Stack, Button, Text } from "@mantine/core";
import { getRateDisplay, formatStartTime } from "../helpers/formatHelpers";
import type { Table } from "../types/models/tables/Table";
import { useTranslation } from "react-i18next";

export interface TableInfoDrawerProps {
    selectedTable: Table | null
    handleCloseDetail: () => void
    setNewSessionModalOpen: (isOpen: boolean) => void
    setCloseSessionModalOpen: (isOpen: boolean) => void
}

function TableInfoDrawer(props: TableInfoDrawerProps) { 
    
    const { t } = useTranslation()
    
    return (
    
        <Drawer
            opened={props.selectedTable !== null}
            onClose={props.handleCloseDetail}
            position="right"
            title={props.selectedTable?.name ?? t("OverviewScreen.TableDetails")}
            size="md"
        >
            {props.selectedTable && (
                <Stack>
                    <Text>
                        <strong>{t("OverviewScreen.Type")}:</strong> {props.selectedTable.table_type.replace('_', ' ')}
                    </Text>
                    <Text>
                        <strong>{t("OverviewScreen.MaxPlayers")}:</strong> {props.selectedTable.max_players}
                    </Text>
                    <Text>
                        <strong>{t("OverviewScreen.Status")}:</strong>{' '}
                        {props.selectedTable.current_session ? t("OverviewScreen.Occupied") : t("OverviewScreen.Available")}
                    </Text>
                    <Text>
                        <strong>{t("OverviewScreen.Rate")}:</strong> {getRateDisplay(props.selectedTable, t)}
                    </Text>
                    {props.selectedTable.current_session ? (
                        <>
                            <Text>
                                <strong>{t("OverviewScreen.SessionType")}:</strong> {props.selectedTable.current_session.session_type}
                            </Text>
                            <Text>
                                <strong>{t("OverviewScreen.Started")}:</strong> {formatStartTime(props.selectedTable.current_session.started_at)}
                            </Text>

                            

                            <Button mt="md" color="red" onClick={() => props.setCloseSessionModalOpen(true)}>
                                {t("OverviewScreen.CloseSession")}
                            </Button>
                        </>
                    ) : (
                        <Button mt="md" onClick={() => props.setNewSessionModalOpen(true)}>
                            {t("OverviewScreen.NewSession")}
                        </Button>
                    )}
                </Stack>
            )}
        </Drawer>)
}

export default TableInfoDrawer