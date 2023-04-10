import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api";
import { StreetSchedule } from "../../types";
import { generateCalendarEventsForPreview } from "../../generateCalendarEvents";
import { Container, Stack } from "@mui/material";
import { DateCalendar, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { RRule } from "rrule";

export const ScheduleView = () => {
    const { year, streetIndex, scheduleId } = useParams();
    const [selectedStreetSchedule, setSelectedStreetSchedule] = useState<StreetSchedule | null>(null);
    const [dates, setDates] = useState<{ [key: string]: Date[] }>({});

    useEffect(() => {
        if (year !== undefined && streetIndex !== undefined && scheduleId !== undefined) {
            api.fetchStreet(Number(year), Number(streetIndex)).then((data) =>
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
                        year,
                    }))[scheduleId]
                )
            );
        }
    }, [year, streetIndex, scheduleId]);

    useEffect(() => {
        if (selectedStreetSchedule) {
            const events = generateCalendarEventsForPreview(Number(streetIndex), selectedStreetSchedule);
            const rrule = RRule.fromString(events[0].events[0].recurrenceRule!);
            setDates({
                [events[0].type]: rrule.all(),
            });
        }
    }, [selectedStreetSchedule]);

    console.log("dates", dates);

    return (
        <>
            <Container>
                <Stack sx={{ width: "100%", padding: "50px" }} gap={2} alignItems="center">
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DateCalendar />
                    </LocalizationProvider>
                </Stack>
            </Container>
        </>
    );
};
