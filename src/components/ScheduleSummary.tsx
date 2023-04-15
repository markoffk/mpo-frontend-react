import React from "react";
import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";
import { StreetSchedule } from "../types";
import { generateCalendarFile } from "../generateCalendarFile";
import { generateCalendarEventsForICS } from "../generateCalendarEvents";

const downloadCalendar = async (streetIndex: number, schedule: StreetSchedule) => {
    const url = await generateCalendarFile(generateCalendarEventsForICS(streetIndex, schedule));

    // trying to assign the file URL to a window could cause cross-site
    // issues so this is a workaround using HTML5
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `odbior-krakow-${schedule.year}-${streetIndex}-${schedule.id}.ics`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
};

type ScheduleSummaryProps = {
    fileIndex: number;
    schedule: StreetSchedule;
};
export const ScheduleSummary: React.FC<ScheduleSummaryProps> = ({ fileIndex, schedule }) => {
    return (
        <TableContainer component={Paper} sx={{ width: "100%", maxWidth: 500 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell colSpan={2}>Podsumowanie</TableCell>
                    </TableRow>
                </TableHead>
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
                    <TableRow>
                        <TableCell component="th" scope="row">
                            Kalendarz w pliku .ics
                        </TableCell>
                        <TableCell align="right">
                            <Button onClick={() => downloadCalendar(fileIndex, schedule)}>Pobierz</Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </TableContainer>
    );
};
