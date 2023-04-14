import { WasteType } from "./types";

export const wasteTypeMap: { [key in WasteType]: string } = {
    mixed: "zmieszane",
    paper: "papier",
    plastic: "tworzywa sztuczne",
    glass: "szkło",
    bio: "bio",
    barrel: "beczka",
};
