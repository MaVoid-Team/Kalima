import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { cn } from "@/lib/utils";
import BackgroundAnimation from "@/components/LandingPage/BackgroundAnimation";

export default function MainLayout() {
    const location = useLocation();
    const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";

    return (
        <div className="flex min-h-screen flex-col relative z-10">
            <BackgroundAnimation />
            <Navbar />
            <main className={cn(
                "flex-grow w-full mt-16 md:mt-20 font-sans",
                isAuthPage ? "pb-0" : "pb-20 md:pb-0"
            )}>
                <Outlet />
            </main>
            {/* Hide footer on mobile for auth pages to feel like a native app */}
            <div className={isAuthPage ? "hidden md:block" : "block"}>
                <Footer />
            </div>
        </div>
    );
}
