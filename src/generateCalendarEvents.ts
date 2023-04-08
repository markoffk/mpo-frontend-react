import { datetime, RRule, RRuleSet, rrulestr, ByWeekday } from "rrule";
import { EventAttributes } from "ics";
import dayjs from "dayjs";
import { StreetSchedule } from "./types";

type WasteType = keyof StreetSchedule["waste"];

const monthMap = {
    stycznia: 1,
    lutego: 2,
    marca: 3,
    kwietnia: 4,
    maja: 5,
    czerwca: 6,
    lipca: 7,
    sierpnia: 8,
    września: 9,
    października: 10,
    listopada: 11,
    grudnia: 12,
};

const polishDayToRRuleDayMap: { [key: string]: ByWeekday } = {
    poniedziałek: RRule.MO,
    wtorek: RRule.TU,
    środa: RRule.WE,
    czwartek: RRule.TH,
    piątek: RRule.FR,
    sobota: RRule.SA,
    niedziela: RRule.SU,
};
const polishDayToEnglishDayMap = {
    poniedziałek: "Monday",
    wtorek: "Tuesday",
    środa: "Wednesday",
    czwartek: "Thursday",
    piątek: "Friday",
    sobota: "Saturday",
    niedziela: "Sunday",
};
const polishDays = Object.keys(polishDayToEnglishDayMap);

const wasteTypeMap: { [key in WasteType]: string } = {
    mixed: "zmieszane",
    paper: "papier",
    plastic: "tworzywa sztuczne",
    glass: "szkło",
    bio: "bio",
    barrel: "beczka",
};

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
    wasteType: WasteType,
    street: string,
    houseNumber: string
): EventAttributes => {
    return {
        start: [year, month, day],
        duration: { days: 1 },
        title: `Odbior odpadów - ${wasteTypeMap[wasteType]}`,
        description: wasteTypeMap[wasteType],
        location: `${street} ${houseNumber}`,
        url: "http://zayats.pl",
        categories: ["Odbior odpadów"],
        status: "CONFIRMED",
        busyStatus: "FREE",
        calName: "vlad test",
        uid: btoa(`mpo.zayats.pl-${year}-${month}`),
        organizer: { name: "Władysław Zayats", email: "easypaste.org@gmail.com" },
        alarms: [{ action: "display", description: "Reminder", trigger: { minutes: 10, before: true } }],
    };
};

const generateEventByRRule = (
    rrule: string,
    start: [number, number, number],
    wasteType: WasteType,
    street: string,
    houseNumber: string
): EventAttributes => {
    return {
        recurrenceRule: rrule.slice(6),
        start: start,
        duration: { days: 1 },
        title: `Odbior odpadów - ${wasteTypeMap[wasteType]}`,
        description: wasteTypeMap[wasteType],
        location: `${street} ${houseNumber}`,
        url: "http://zayats.pl",
        categories: ["Odbior odpadów"],
        status: "CONFIRMED",
        busyStatus: "FREE",
        calName: "vlad test",
        organizer: { name: "Władysław Zayats", email: "easypaste.org@gmail.com" },
        alarms: [{ action: "display", description: "Reminder", trigger: { minutes: 10, before: true } }],
    };
};

export const generateCalendarEventsForOneWasteType = (schedule: StreetSchedule, wasteType: WasteType) => {
    const events = [];

    const dates = splitDates(schedule.waste[wasteType]);

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
    } else if (dates.every((date: string) => polishDays.includes(date.toLocaleLowerCase("pl")))) {
        const dtStart = dayjs(`${schedule.year}-01-01`);

        const rrule = new RRule({
            until: dtStart.endOf("year").toDate(),
            freq: RRule.WEEKLY,
            byweekday: dates.map((date) => polishDayToRRuleDayMap[date]),
        });

        events.push(
            generateEventByRRule(
                rrule.toString(),
                [schedule.year, 1, 1],
                wasteType,
                schedule.street,
                schedule.houseNumber
            )
        );
    } else {
        const dtStart = dayjs(`${schedule.year}-01-01`);

        const scheduleStr = schedule.waste[wasteType];

        const res1 = scheduleStr.match(/(.*)co ([0-9]+) tygodnie/);
        const res2 = scheduleStr.match(/od dnia ([0-9]+)(.+)/);

        if (res1 || res2) {
            const weekday = res1[1]
                .trim()
                .split(",")
                .map((v: string) => polishDayToRRuleDayMap[v.trim()]);

            const weekInterval = Number(res1[2]);

            const day = Number(res2[1]);
            const monthNumber = monthMap[res2[2].trim() as keyof typeof monthMap];

            const rrule = new RRule({
                until: dtStart.endOf("year").toDate(),
                freq: RRule.WEEKLY,
                interval: weekInterval,
                byweekday: weekday,
            });

            if (day && monthNumber) {
                events.push(
                    generateEventByRRule(
                        rrule.toString(),
                        [schedule.year, monthNumber, day],
                        wasteType,
                        schedule.street,
                        schedule.houseNumber
                    )
                );
            }
        }
    }

    return events;
};
export const generateCalendarEvents = (schedule: StreetSchedule): EventAttributes[] => {
    // return [
    //     generateEvent(2023, 4, 3, "mixed", "Widłakowa", "56c"),
    //     generateEvent(2023, 4, 4, "mixed", "Widłakowa", "56c"),
    // ];
    return [
        ...generateCalendarEventsForOneWasteType(schedule, "mixed"),
        ...generateCalendarEventsForOneWasteType(schedule, "paper"),
        ...generateCalendarEventsForOneWasteType(schedule, "plastic"),
        ...generateCalendarEventsForOneWasteType(schedule, "glass"),
        ...generateCalendarEventsForOneWasteType(schedule, "bio"),
        ...generateCalendarEventsForOneWasteType(schedule, "barrel"),
    ];
};
