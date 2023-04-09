import { createEvents, EventAttributes } from "ics";

export const generateCalendarFile = async (events: EventAttributes[]) => {
    const file = await new Promise((resolve, reject) => {
        createEvents(events, (error, value) => {
            if (error) {
                reject(error);
            }

            const str = (value as string).replaceAll('RRULE:RDATE:', 'RDATE:');

            // https://stackoverflow.com/questions/32937088/javascript-create-utf-16-text-file
            let charCode,
                byteArray = [];

            // BE BOM
            byteArray.push(254, 255);

            for (let i = 0; i < str.length; ++i) {
                charCode = str.charCodeAt(i);

                // BE Bytes
                byteArray.push((charCode & 0xff00) >>> 8);
                byteArray.push(charCode & 0xff);
            }

            resolve(new Blob([new Uint8Array(byteArray)], { type: "text/plain;charset=UTF-16BE;" }));
        });
    });

    return URL.createObjectURL(file as any);
};
