import { Stack, styled, Tooltip } from "@mui/material";
import React from "react";
import { WasteType } from "../../types";
import { wasteTypeMap } from "../../config";

type CalendarDayBadgeProps = {
    selection: { [key in WasteType]: boolean };
};
export const CalendarDayBadge: React.FC<CalendarDayBadgeProps> = ({ selection }) => {
    return (
        <Stack direction="row" sx={{ borderRight: "1px dotted #aaa" }}>
            {selection.mixed && (
                <Tooltip title={wasteTypeMap["mixed"]}>
                    {/*<Segment sx={{ backgroundColor: "#bfbfbf" }} />*/}
                    <Segment sx={{ backgroundColor: "#808080" }} />
                </Tooltip>
            )}
            {selection.paper && (
                <Tooltip title={wasteTypeMap["paper"]}>
                    {/*<Segment sx={{ backgroundColor: "#b8cce4" }} />*/}
                    <Segment sx={{ backgroundColor: "#0073ff" }} />
                </Tooltip>
            )}
            {selection.plastic && (
                <Tooltip title={wasteTypeMap["plastic"]}>
                    {/*<Segment sx={{ backgroundColor: "#ffffcc" }} />*/}
                    <Segment sx={{ backgroundColor: "#ffff00" }} />
                </Tooltip>
            )}
            {selection.glass && (
                <Tooltip title={wasteTypeMap["glass"]}>
                    {/*<Segment sx={{ backgroundColor: "#d8e4bc" }} />*/}
                    <Segment sx={{ backgroundColor: "#b3ff00" }} />
                </Tooltip>
            )}
            {selection.bio && (
                <Tooltip title={wasteTypeMap["bio"]}>
                    {/*<Segment sx={{ backgroundColor: "#e2c4a6" }} />*/}
                    <Segment sx={{ backgroundColor: "#bf8040" }} />
                </Tooltip>
            )}
            {selection.barrel && (
                <Tooltip title={wasteTypeMap["barrel"]}>
                    {/*<Segment sx={{ backgroundColor: "#f2f2f2" }} />*/}
                    <Segment sx={{ backgroundColor: "#cccccc" }} />
                </Tooltip>
            )}
        </Stack>
    );
};

const Segment = styled("div")`
    height: 15px;
    width: 8px;
`;
