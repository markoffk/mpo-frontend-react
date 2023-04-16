import { useNavigate, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { api } from "../../api";
import { StreetSchedule } from "../../types";
import { generateCalendarEventsForPreview } from "../../generateCalendarEvents";
import {
    Badge,
    Button,
    Container,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from "@mui/material";
import { DateCalendar, LocalizationProvider, PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/pl";
import dayjs, { Dayjs } from "dayjs";
import { CalendarDayBadge } from "./CalendarDayBadge";
import { ScheduleSummary } from "../../components/ScheduleSummary";

function DayWithHighlight(
    props: PickersDayProps<Dayjs> & {
        highlightedDays?: { [key: string]: Dayjs[] };
        events?: ReturnType<typeof generateCalendarEventsForPreview>;
    }
) {
    const { highlightedDays = [], events = [], day, outsideCurrentMonth, ...other } = props;

    const calDayYMD = `${props.day.year()}-${props.day.month()}-${props.day.date()}`;

    const selection = Object.fromEntries(
        events.map((event) => [
            event.type,
            event.events
                .flatMap((ve) => ve.dates.map((v) => dayjs(v)))
                .some((v) => `${v.year()}-${v.month()}-${v.date()}` === calDayYMD),
        ])
    );

    return (
        <Badge
            sx={{ "& .MuiBadge-badge": { top: "10%", right: "45%" } }}
            key={props.day.toString()}
            overlap="circular"
            badgeContent={<CalendarDayBadge selection={selection as any} />}
        >
            <PickersDay {...other} outsideCurrentMonth={outsideCurrentMonth} day={day} />
        </Badge>
    );
}

export const ScheduleView = () => {
    const { cityId, year, streetId, scheduleId } = useParams();
    const [selectedStreetSchedule, setSelectedStreetSchedule] = useState<StreetSchedule | null>(null);
    const [dates, setDates] = useState<{ [key: string]: Dayjs[] }>({});
    const [events, setEvents] = useState<ReturnType<typeof generateCalendarEventsForPreview>>([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (year !== undefined && streetId !== undefined && scheduleId !== undefined) {
            api.fetchStreetSchedules(Number(cityId), Number(year), Number(streetId)).then((data) =>
                setSelectedStreetSchedule(
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
                        year: Number(year),
                    }))[scheduleId]
                )
            );
        }
    }, [year, streetId, scheduleId]);

    useEffect(() => {
        if (selectedStreetSchedule) {
            const evs = generateCalendarEventsForPreview(Number(streetId), selectedStreetSchedule);

            setEvents(evs);
            setDates(
                Object.fromEntries(evs.map((v) => [v.type, v.events.flatMap((ve) => ve.dates.map((v) => dayjs(v)))]))
            );
        }
    }, [selectedStreetSchedule]);

    return (
        <>
            {selectedStreetSchedule && (
                <Helmet>
                    <title>
                        Kiedyodbior - {selectedStreetSchedule.street} {selectedStreetSchedule.houseNumber}, Kraków, rok
                        ${year}
                    </title>
                    <meta
                        name="description"
                        content={`Harmonogram odbioru odpadów ${selectedStreetSchedule.street} ${selectedStreetSchedule.houseNumber}, Kraków, rok ${year}`}
                    />
                </Helmet>
            )}
            <Container>
                <Stack sx={{ width: "100%" }} gap={2} alignItems="center">
                    {selectedStreetSchedule && (
                        <TableContainer elevation={0} component={Paper} sx={{ width: "100%", maxWidth: 500 }}>
                            <Table aria-label="simple table">
                                <TableBody>
                                    <TableRow>
                                        <TableCell align="left">
                                            {selectedStreetSchedule.street} {selectedStreetSchedule.houseNumber},
                                            Kraków, rok {year}
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button onClick={() => navigate("/")}>zmień</Button>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pl">
                        <DateCalendar
                            showDaysOutsideCurrentMonth
                            slots={{
                                day: DayWithHighlight,
                            }}
                            slotProps={{
                                day: {
                                    events,
                                    highlightedDays: dates,
                                } as any,
                            }}
                        />
                    </LocalizationProvider>
                    {selectedStreetSchedule && (
                        <ScheduleSummary streetId={Number(streetId)} schedule={selectedStreetSchedule} />
                    )}
                </Stack>
            </Container>
        </>
    );
};
