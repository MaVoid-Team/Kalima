import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackgroundAnimation from "@/components/LandingPage/BackgroundAnimation";

export default function MainLayout() {
    return (
        <div className="flex min-h-screen flex-col relative z-10">
            <BackgroundAnimation />
            <Navbar />
            <main className="flex-grow w-full mt-20">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
