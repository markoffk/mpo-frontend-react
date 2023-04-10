export const api = {
    fetchStreetIndex: (year: number) => fetch(`/api/${year}/street-index.json`).then((response) => response.json()),
    fetchStreet: (year: number, fileIndex: number) =>
        fetch(`/api/${year}/street-${fileIndex}.json`).then((response) => response.json()),
};
