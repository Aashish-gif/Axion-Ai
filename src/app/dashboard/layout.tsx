import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-bg-cream flex">
            <Sidebar />
            <main className="flex-1 md:ml-[240px] pb-24 md:pb-0 min-w-0">
                <div className="p-4 md:p-8 max-w-6xl mx-auto h-full overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
