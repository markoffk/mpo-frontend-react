import React from "react";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { StreetSchedule } from "../types";
import { generateCalendarFile } from "../generateCalendarFile";
import { generateCalendarEventsForICS } from "../generateCalendarEvents";
import DownloadIcon from "@mui/icons-material/Download";

const downloadCalendar = async (streetId: number, schedule: StreetSchedule) => {
    const url = await generateCalendarFile(generateCalendarEventsForICS(streetId, schedule));

    // trying to assign the file URL to a window could cause cross-site
    // issues so this is a workaround using HTML5
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `odbior-krakow-${schedule.year}-${streetId}-${schedule.id}.ics`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
};

type ScheduleSummaryProps = {
    streetId: number;
    schedule: StreetSchedule;
};
export const ScheduleSummary: React.FC<ScheduleSummaryProps> = ({ streetId, schedule }) => {
    return (
        <Box sx={{ width: "100%", maxWidth: 500 }}>
            <Accordion elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>Podsumowanie</AccordionSummary>
                <AccordionDetails>
                    <TableContainer component={Paper} sx={{ width: "100%", maxWidth: 500 }}>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Typ
                                    </TableCell>
                                    <TableCell align="right">{schedule.houseType}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Sektor
                                    </TableCell>
                                    <TableCell align="right">{schedule.sector}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Operator
                                    </TableCell>
                                    <TableCell align="right">{schedule.operator}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Zmieszane
                                    </TableCell>
                                    <TableCell align="right">{schedule.waste.mixed}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Papier
                                    </TableCell>
                                    <TableCell align="right">{schedule.waste.paper}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Tworzywa sztuczne
                                    </TableCell>
                                    <TableCell align="right">{schedule.waste.plastic}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Szkło
                                    </TableCell>
                                    <TableCell align="right">{schedule.waste.glass}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Bio
                                    </TableCell>
                                    <TableCell align="right">{schedule.waste.bio}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell component="th" scope="row">
                                        Beczka
                                    </TableCell>
                                    <TableCell align="right">{schedule.waste.barrel}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </AccordionDetails>
            </Accordion>
            <Accordion elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>Exportowanie kalendarza</AccordionSummary>
                <AccordionDetails>
                    <p>
                        Exportuj kalendarz w postaci pliku .ics który można zaimportować do dowolnej aplikacji
                        kalendarza obsługującej format .ics (Google Calendar, Microsoft Outlook, Apple Calendar, etc.).
                    </p>
                    <Button
                        startIcon={<DownloadIcon />}
                        variant="contained"
                        onClick={() => downloadCalendar(streetId, schedule)}
                    >
                        Exportuj kalendarz
                    </Button>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};
