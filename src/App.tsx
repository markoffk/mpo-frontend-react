import {
    AppBar,
    Autocomplete,
    Button,
    Container,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
    Toolbar,
    Typography,
} from "@mui/material";
import RecyclingIcon from "@mui/icons-material/Recycling";
import { useEffect, useMemo, useState } from "react";
import { StreetSchedule } from "./types";
import { generateCalendarFile } from "./generateCalendarFile";
import { generateCalendarEvents } from "./generateCalendarEvents";

type StreetRow = {
    label: string;
    fileIndex: number;
};

const year = 2023;

const downloadCalendar = async (streetIndex: number, schedule: StreetSchedule) => {
    const url = await generateCalendarFile(generateCalendarEvents(streetIndex, schedule));

    // trying to assign the file URL to a window could cause cross-site
    // issues so this is a workaround using HTML5
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mpo-2023-krakow-${schedule.id}.ics`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(url);
};

function App() {
    const [streetMap, setStreetMap] = useState<{ [key: string]: number }>({});
    const [streetSchedules, setStreetSchedules] = useState<StreetSchedule[]>([]);
    const [selectedStreet, setSelectedStreet] = useState<StreetRow | null>(null);
    const [selectedStreetSchedule, setSelectedStreetSchedule] = useState<StreetSchedule | null>(null);

    const streets = useMemo(
        () =>
            Object.entries(streetMap).map(([streetName, fileIndex]) => ({
                label: streetName,
                fileIndex,
            })),
        [streetMap]
    );

    useEffect(() => {
        fetch(`/api/${year}/street-index.json`)
            .then((response) => response.json())
            .then((data) => setStreetMap(data));
    }, []);

    useEffect(() => {
        if (selectedStreet) {
            fetch(`/api/${year}/street-${selectedStreet?.fileIndex}.json`)
                .then((response) => response.json())
                .then((data) =>
                    setStreetSchedules(
                        data.map((value: string[], index: number) => ({
                            id: `schedule-${index}`,
                            houseType: value[0],
                            street: value[1],
                            houseNumber: value[2],
                            sector: value[3],
                            operator: value[4],
                            waste: {
                                mixed: value[5],
                                paper: value[6],
                                plastic: value[7],
                                glass: value[8],
                                bio: value[9],
                                barrel: value[10],
                            },
                            year,
                        }))
                    )
                );
        } else {
            setStreetSchedules([]);
        }
        setSelectedStreetSchedule(null);
    }, [selectedStreet]);

    return (
        <>
            <AppBar position="static" elevation={0}>
                <Toolbar>
                    <RecyclingIcon sx={{ mr: 2, animation: 'rotation 10s infinite linear' }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Odbiór odpadów MPO Kraków
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container>
                <Stack sx={{ width: "100%", padding: "50px" }} gap={2} alignItems="center">
                    <Autocomplete
                        value={selectedStreet}
                        onChange={(event, newValue) => {
                            setSelectedStreet(newValue);
                        }}
                        disablePortal
                        options={streets}
                        sx={{ width: "100%", maxWidth: 500 }}
                        renderInput={(params) => <TextField {...params} label="Ulica" />}
                    />
                    <Autocomplete
                        disabled={streetSchedules.length === 0}
                        value={selectedStreetSchedule}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        onChange={(event, newValue) => {
                            setSelectedStreetSchedule(newValue);
                        }}
                        getOptionLabel={(option) => option.houseNumber}
                        disablePortal
                        options={streetSchedules}
                        sx={{ width: "100%", maxWidth: 500 }}
                        renderOption={(props, option) => {
                            return (
                                <li {...props} key={option.id}>
                                    {option.houseNumber}
                                </li>
                            );
                        }}
                        renderInput={(params) => <TextField {...params} label="Numer" />}
                    />

                    {selectedStreet && selectedStreetSchedule && (
                        <TableContainer component={Paper} sx={{ width: "100%", maxWidth: 500 }}>
                            <Table aria-label="simple table">
                                <TableBody>
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            Typ
                                        </TableCell>
                                        <TableCell align="right">{selectedStreetSchedule.houseType}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            Sektor
                                        </TableCell>
                                        <TableCell align="right">{selectedStreetSchedule.sector}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            Operator
                                        </TableCell>
                                        <TableCell align="right">{selectedStreetSchedule.operator}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            Zmieszane
                                        </TableCell>
                                        <TableCell align="right">{selectedStreetSchedule.waste.mixed}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            Papier
                                        </TableCell>
                                        <TableCell align="right">{selectedStreetSchedule.waste.paper}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            Tworzywa sztuczne
                                        </TableCell>
                                        <TableCell align="right">{selectedStreetSchedule.waste.plastic}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            Szkło
                                        </TableCell>
                                        <TableCell align="right">{selectedStreetSchedule.waste.glass}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            Bio
                                        </TableCell>
                                        <TableCell align="right">{selectedStreetSchedule.waste.bio}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            Beczka
                                        </TableCell>
                                        <TableCell align="right">{selectedStreetSchedule.waste.barrel}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            Kalendarz
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button
                                                onClick={() =>
                                                    downloadCalendar(selectedStreet.fileIndex, selectedStreetSchedule)
                                                }
                                            >
                                                Pobierz
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Stack>
            </Container>
        </>
    );
}

export default App;
