import { createEvents, EventAttributes } from "ics";

export const generateCalendarFile = async (events: EventAttributes[]) => {
    const file = await new Promise((resolve, reject) => {
        createEvents(events, (error, value) => {
            if (error) {
                reject(error);
            }

            resolve(new Blob(["\ufeff", value], { type: "text/plain;charset=utf-8" }));
        });
    });

    return URL.createObjectURL(file as any);
};
