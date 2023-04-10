import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../api";
import { StreetSchedule } from "../../types";
import { generateCalendarEventsForPreview } from "../../generateCalendarEvents";

export const ScheduleView = () => {
    const { year, streetIndex, scheduleId } = useParams();
    const [selectedStreetSchedule, setSelectedStreetSchedule] = useState<StreetSchedule | null>(null);

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

    if (selectedStreetSchedule) {
        console.log(generateCalendarEventsForPreview(Number(streetIndex), selectedStreetSchedule));
    }

    return <></>;
};
