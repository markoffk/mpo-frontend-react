import {
    Autocomplete,
    Button,
    Container,
    createFilterOptions,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from "@mui/material";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useState } from "react";
import { StreetSchedule } from "../types";
import { useNavigate } from "react-router-dom";
import { Api, api } from "../api";
import { Helmet } from "react-helmet";

const streetFilterOptions = createFilterOptions<StreetRow>({
    matchFrom: "any",
    stringify: (option) =>
        option.label
            .toLowerCase()
            .replaceAll("ą", "a")
            .replaceAll("ć", "c")
            .replaceAll("ę", "e")
            .replaceAll("ł", "l")
            .replaceAll("ń", "n")
            .replaceAll("ó", "o")
            .replaceAll("ś", "s")
            .replaceAll("ź", "z")
            .replaceAll("ż", "z"),
});

type StreetRow = {
    label: string;
    streetId: number;
};

export const RootView = () => {
    const [year, setYear] = useState(dayjs().year());
    const [cityId, setCityId] = useState(1 /* Kraków by default */);
    const [cityIndex, setCityIndex] = useState<Api["city-index"]["body"]>({});
    const [streetIndex, setStreetIndex] = useState<Api["street-index"]["body"]>({});
    const [streetSchedules, setStreetSchedules] = useState<StreetSchedule[]>([]);
    const [selectedStreet, setSelectedStreet] = useState<StreetRow | null>(null);
    const [selectedStreetSchedule, setSelectedStreetSchedule] = useState<StreetSchedule | null>(null);
    const navigate = useNavigate();

    const streets = useMemo(
        () =>
            Object.entries(streetIndex)
                .map(([streetName, streetId]) => ({
                    label: streetName,
                    streetId,
                }))
                .sort((a, b) => a.label.localeCompare(b.label)),
        [streetIndex]
    );

    useEffect(() => {
        api.fetchCityIndex().then((data) => setCityIndex(data));
    }, []);

    useEffect(() => {
        api.fetchStreetIndex(cityId, year).then((data) => setStreetIndex(data));
    }, [cityId, year]);

    useEffect(() => {
        if (selectedStreet) {
            api.fetchStreetSchedules(cityId, year, selectedStreet.streetId).then((data) =>
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
            <Helmet>
                <title>Kiedyodbior - strona główna</title>
            </Helmet>
            <Container>
                <Stack sx={{ width: "100%", padding: { xs: "20px 0", md: "50px 0" } }} gap={2} alignItems="center">
                    <Stack direction="row" gap={1} sx={{ width: "100%", maxWidth: 500 }}>
                        <FormControl disabled fullWidth sx={{ maxWidth: 500 }}>
                            <InputLabel id="schedule-city">Miasto</InputLabel>
                            <Select
                                labelId="schedule-city"
                                value={cityId}
                                label="Miasto"
                                onChange={(event) => {
                                    setCityId(Number(event.target.value));
                                }}
                            >
                                {Object.entries(cityIndex).map((value) => (
                                    <MenuItem key={value[1]} value={value[1]}>
                                        {value[0]}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth sx={{ maxWidth: 500 }}>
                            <InputLabel id="schedule-year">Rok</InputLabel>
                            <Select
                                labelId="schedule-year"
                                value={year}
                                label="Rok"
                                onChange={(event) => {
                                    setYear(Number(event.target.value));
                                    setSelectedStreet(null);
                                }}
                            >
                                <MenuItem value={2023}>2023</MenuItem>
                                <MenuItem value={2024}>2024</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                    <Autocomplete
                        value={selectedStreet}
                        onChange={(event, newValue) => {
                            setSelectedStreet(newValue);
                        }}
                        disablePortal
                        options={streets}
                        sx={{ width: "100%", maxWidth: 500 }}
                        filterOptions={streetFilterOptions}
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
                            navigate(
                                `/schedule/${cityId}/${year}/${selectedStreet.streetId}/${selectedStreetSchedule.id}`
                            )
                        }
                    >
                        Pokaż kalendarz
                    </Button>
                </Stack>
            </Container>
        </>
    );
};
