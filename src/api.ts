export type Api = {
    "city-index": {
        body: Record<string, number>;
    };
    "street-index": {
        body: Record<string, number>;
    };
};
export const api = {
    fetchCityIndex: () => fetch(`/api/city-index.json`).then((response) => response.json()),
    fetchStreetIndex: (cityId: number, year: number) =>
        fetch(`/api/${cityId}/${year}/street-index.json`).then((response) => response.json()),
    fetchStreetSchedules: (cityId: number, year: number, streetId: number) =>
        fetch(`/api/${cityId}/${year}/street-${streetId}.json`).then((response) => response.json()),
};
