import {
    Autocomplete,
    Button,
    Container,
    FormControl,
    InputLabel,
    Link,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { StreetSchedule } from "../types";
import { generateCalendarFile } from "../generateCalendarFile";
import { generateCalendarEventsForICS } from "../generateCalendarEvents";
import { Link as RouterLink } from "react-router-dom";
import { api } from "../api";

type StreetRow = {
    label: string;
    fileIndex: number;
};

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

export const RootView = () => {
    const [year, setYear] = useState(dayjs().year());
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
        api.fetchStreetIndex(year).then((data) => setStreetMap(data));
    }, []);

    useEffect(() => {
        if (selectedStreet) {
            api.fetchStreet(year, selectedStreet.fileIndex).then((data) =>
                setStreetSchedules(
                    data.map((value: string[], index: number) => ({
                        id: index,
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
            <Container>
                <Stack sx={{ width: "100%", padding: "50px 0" }} gap={2} alignItems="center">
                    <FormControl disabled fullWidth sx={{ maxWidth: 500 }}>
                        <InputLabel id="demo-simple-select-label">Rok</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            value={year}
                            label="Rok"
                            onChange={(event) => {
                                setYear(Number(event.target.value));
                            }}
                        >
                            <MenuItem value={2023}>2023</MenuItem>
                        </Select>
                    </FormControl>
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
                        renderInput={(params) => <TextField {...params} label="Numer domu" />}
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
                                            <Link
                                                color="inherit"
                                                component={RouterLink}
                                                to={`/schedule/${year}/${selectedStreet.fileIndex}/${selectedStreetSchedule.id}`}
                                                title="Strona główna"
                                            >
                                                Pokaż
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            Kalendarz w pliku .ics
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
};
