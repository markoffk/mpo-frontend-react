import { EventAttributes } from "ics";
import { StreetSchedule } from "./types";

const splitDates = (dates: string) => {
    return (dates ?? "")
        .split(",")
        .map((val: string) => val.trim())
        .filter((val: string) => !!val);
};

const generateEvent = (
    year: number,
    month: number,
    day: number,
    wasteType: string,
    street: string,
    houseNumber: string
): EventAttributes => {
    return {
        start: [year, month, day, 5, 0],
        duration: { hours: 6, minutes: 0 },
        title: `Odbior odpadów - ${wasteType}`,
        description: wasteType,
        location: `${street} ${houseNumber}`,
        url: "http://zayats.pl",
        categories: ["Odbior odpadów"],
        status: "CONFIRMED",
        busyStatus: "FREE",
    };
};

export const generateCalendarEventsForOneWasteType = (schedule: StreetSchedule, wasteType: string, dates: string[]) => {
    const events = [];

    if (dates.every((date: string) => new RegExp("^[0-9]{2}.[0-9]{2}$").test(date))) {
        for (const date of dates) {
            const [day, month] = date.split(".");

            events.push(
                generateEvent(
                    schedule.year,
                    Number(month),
                    Number(day),
                    wasteType,
                    schedule.street,
                    schedule.houseNumber
                )
            );
        }
    }

    return events;
};
export const generateCalendarEvents = (schedule: StreetSchedule): EventAttributes[] => {
    return [
        ...generateCalendarEventsForOneWasteType(schedule, "zmieszane", splitDates(schedule.waste.mixed)),
        ...generateCalendarEventsForOneWasteType(schedule, "papier", splitDates(schedule.waste.paper)),
        ...generateCalendarEventsForOneWasteType(schedule, "tworzywa sztuczne", splitDates(schedule.waste.plastic)),
        ...generateCalendarEventsForOneWasteType(schedule, "szkło", splitDates(schedule.waste.glass)),
        ...generateCalendarEventsForOneWasteType(schedule, "bio", splitDates(schedule.waste.bio)),
        ...generateCalendarEventsForOneWasteType(schedule, "beczka", splitDates(schedule.waste.barrel)),
    ];
};
