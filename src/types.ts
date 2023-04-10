export type StreetSchedule = {
    id: string;
    houseType: string;
    street: string;
    houseNumber: string;
    sector: string;
    operator: string;
    waste: {
        mixed: any;
        paper: any;
        plastic: any;
        glass: any;
        bio: any;
        barrel: any;
    };
    year: number;
};

export type WasteType = keyof StreetSchedule["waste"];
