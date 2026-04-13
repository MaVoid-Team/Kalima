import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout() {
    return (
        <div className="flex min-h-screen flex-col relative z-10">
            <Navbar />
            <main className="flex-grow w-full mt-16">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}
