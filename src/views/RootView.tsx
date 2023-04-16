import {
    Autocomplete,
    Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { StreetSchedule } from "../types";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

type StreetRow = {
    label: string;
    fileIndex: number;
};

export const RootView = () => {
    const [year, setYear] = useState(dayjs().year());
    const [streetMap, setStreetMap] = useState<{ [key: string]: number }>({});
    const [streetSchedules, setStreetSchedules] = useState<StreetSchedule[]>([]);
    const [selectedStreet, setSelectedStreet] = useState<StreetRow | null>(null);
    const [selectedStreetSchedule, setSelectedStreetSchedule] = useState<StreetSchedule | null>(null);
    const navigate = useNavigate();

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
                <Stack sx={{ width: "100%", padding: { xs: "20px 0", md: "50px 0" } }} gap={2} alignItems="center">
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
                    <Button
                        disabled={!selectedStreet || !selectedStreetSchedule}
                        sx={{ width: "100%", maxWidth: 500 }}
                        variant="contained"
                        onClick={() =>
                            selectedStreet &&
                            selectedStreetSchedule &&
                            navigate(`/schedule/${year}/${selectedStreet.fileIndex}/${selectedStreetSchedule.id}`)
                        }
                    >
                        Pokaż kalendarz
                    </Button>
                </Stack>
            </Container>
        </>
    );
};
