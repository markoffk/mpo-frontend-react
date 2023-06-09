import { datetime, RRule, RRuleSet, ByWeekday } from "rrule";
import { EventAttributes } from "ics";
import dayjs from "dayjs";
import { StreetSchedule, WasteType } from "./types";
import { wasteTypeMap } from "./config";

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

const splitDates = (dates: string) => {
    return (dates ?? "")
        .split(",")
        .map((val: string) => val.trim())
        .filter((val: string) => !!val);
};

const defaultEventAttributes: Pick<
    EventAttributes,
    "url" | "categories" | "status" | "busyStatus" | "classification" | "calName" | "organizer" | "alarms"
> = {
    url: "http://mpo.zayats.pl",
    categories: ["Odbiór odpadów"],
    status: "CONFIRMED",
    busyStatus: "FREE",
    classification: "PUBLIC",
    calName: "Odbiór odpadów",
    organizer: { name: "mpo.zayats.pl", email: "mpo.zayats.pl@gmail.com" },
    alarms: [{ action: "display", description: "Reminder", trigger: { minutes: 10, before: true } }],
};

const wasteTypeToIconMap: { [key in WasteType]: string } = {
    mixed: "♻",
    paper: "♻",
    plastic: "♻",
    glass: "♻",
    bio: "♻",
    barrel: "♻",
};

const generateEvent = (
    year: number,
    month: number,
    day: number,
    wasteType: WasteType,
    streetId: number,
    street: string,
    houseNumber: string,
    scheduleId: string
): EventAttributes => {
    return {
        ...defaultEventAttributes,
        start: [year, month, day],
        duration: { days: 1 },
        title: `Odbiór odpadów - ${wasteTypeMap[wasteType]}`,
        description: wasteTypeMap[wasteType],
        location: `${street} ${houseNumber}`,
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
        ...defaultEventAttributes,
        recurrenceRule: rrule.slice(6),
        start: start,
        duration: { days: 1 },
        title: `${wasteTypeToIconMap[wasteType]} ${wasteTypeMap[wasteType]}`,
        description: `Odbiór odpadów - ${wasteTypeMap[wasteType]}`,
        location: `${street} ${houseNumber}`,
    };
};

export const generateCalendarEventsForOneWasteType = (
    streetId: number,
    schedule: StreetSchedule,
    wasteType: WasteType
): { dates: Date[]; event: EventAttributes }[] => {
    const events = [];

    const dates = splitDates(schedule.waste[wasteType]);

    if (dates.every((date: string) => new RegExp("^[0-9]{2}.[0-9]{2}$").test(date))) {
        const rruleSet = new RRuleSet();

        for (const date of dates) {
            const [day, month] = date.split(".");
            rruleSet.rdate(datetime(schedule.year, Number(month), Number(day)));

            // events.push(
            //     generateEvent(
            //         schedule.year,
            //         Number(month),
            //         Number(day),
            //         wasteType,
            //         streetId,
            //         schedule.street,
            //         schedule.houseNumber,
            //         schedule.id
            //     )
            // );
        }

        events.push({
            dates: rruleSet.all(),
            event: generateEventByRRule(
                `RRULE:${rruleSet.toString()}`,
                [schedule.year, 1, 1],
                wasteType,
                schedule.street,
                schedule.houseNumber
            ),
        });
    } else if (dates.every((date: string) => polishDays.includes(date.toLocaleLowerCase("pl")))) {
        const dtStart = dayjs(`${schedule.year}-01-01`);

        const rrule = new RRule({
            until: dtStart.endOf("year").toDate(),
            freq: RRule.WEEKLY,
            byweekday: dates.map((date) => polishDayToRRuleDayMap[date]),
        });

        events.push({
            dates: rrule.all(),
            event: generateEventByRRule(
                rrule.toString(),
                [schedule.year, 1, 1],
                wasteType,
                schedule.street,
                schedule.houseNumber
            ),
        });
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
                events.push({
                    dates: rrule.all(),
                    event: generateEventByRRule(
                        rrule.toString(),
                        [schedule.year, monthNumber, day],
                        wasteType,
                        schedule.street,
                        schedule.houseNumber
                    ),
                });
            }
        }
    }

    return events;
};
export const generateCalendarEventsForICS = (streetId: number, schedule: StreetSchedule): EventAttributes[] => {
    return [
        ...generateCalendarEventsForOneWasteType(streetId, schedule, "mixed").map((v) => v.event),
        ...generateCalendarEventsForOneWasteType(streetId, schedule, "paper").map((v) => v.event),
        ...generateCalendarEventsForOneWasteType(streetId, schedule, "plastic").map((v) => v.event),
        ...generateCalendarEventsForOneWasteType(streetId, schedule, "glass").map((v) => v.event),
        ...generateCalendarEventsForOneWasteType(streetId, schedule, "bio").map((v) => v.event),
        ...generateCalendarEventsForOneWasteType(streetId, schedule, "barrel").map((v) => v.event),
    ];
};

export const generateCalendarEventsForPreview = (
    streetId: number,
    schedule: StreetSchedule
): { type: WasteType; events: { dates: Date[]; event: EventAttributes }[] }[] => {
    return [
        {
            type: "mixed",
            events: generateCalendarEventsForOneWasteType(streetId, schedule, "mixed"),
        },
        {
            type: "paper",
            events: generateCalendarEventsForOneWasteType(streetId, schedule, "paper"),
        },
        {
            type: "plastic",
            events: generateCalendarEventsForOneWasteType(streetId, schedule, "plastic"),
        },
        {
            type: "glass",
            events: generateCalendarEventsForOneWasteType(streetId, schedule, "glass"),
        },
        {
            type: "bio",
            events: generateCalendarEventsForOneWasteType(streetId, schedule, "bio"),
        },
        {
            type: "barrel",
            events: generateCalendarEventsForOneWasteType(streetId, schedule, "barrel"),
        },
    ];
};
