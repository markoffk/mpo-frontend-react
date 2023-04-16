import { AppBar, Link, Toolbar, Typography } from "@mui/material";
import RecyclingIcon from "@mui/icons-material/Recycling";
import { Link as RouterLink, Route, Routes } from "react-router-dom";
import { RootView } from "./views/RootView";
import { ScheduleView } from "./views/schedule/ScheduleView";

export const App = () => {
    return (
        <>
            <AppBar position="static" elevation={0}>
                <Toolbar>
                    <Link color="inherit" component={RouterLink} to={"/"} title="Strona główna">
                        <RecyclingIcon sx={{ mr: 2, animation: "rotation 10s infinite linear" }} />
                    </Link>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Odbiór odpadów MPO Kraków
                    </Typography>
                </Toolbar>
            </AppBar>
            <Routes>
                <Route path="/schedule/:cityId/:year/:streetId/:scheduleId" element={<ScheduleView />} />
                <Route index element={<RootView />} />
            </Routes>
        </>
    );
};
