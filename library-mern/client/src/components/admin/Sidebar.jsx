import { useState } from "react";
import { Button } from "@/components/ui/button";
import ManageBooks from "./ManageBooks";
import ManageComments from "./ManageComments";
import ManageUser from "./ManageUser";

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(true); // State to control sidebar visibility
    const [activeComponent, setActiveComponent] = useState("Users"); // State to control the displayed component

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const renderContent = () => {
        switch (activeComponent) {
            case "Users":
                return <ManageUser />;
            case "Books":
                return <ManageBooks />;
            case "Comments":
                return <ManageComments />;
            default:
                return <div>Select an option from the sidebar.</div>;
        }
    };

    return (
        <div className="flex h-full"> {/* Ensures full height usage */}
            {/* Sidebar */}
            <aside
                className={`${
                    isOpen ? "w-64" : "w-16"
                } bg-[#1f2937] text-white h-auto flex-shrink-0 transition-all duration-300`}
            >
                {/* Sidebar Header */}
                <div className="flex h-16 items-center justify-between px-6 bg-[#111827]">
                    {isOpen && <span className="text-lg font-bold">Library Management</span>}
                    <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                        {isOpen ? <XIcon className="h-5 w-5" /> : <HamburgerIcon className="h-5 w-5" />}
                        <span className="sr-only">{isOpen ? "Close sidebar" : "Open sidebar"}</span>
                    </Button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex flex-col space-y-1 px-4 py-6 overflow-y-auto h-full">
                    <button
                        onClick={() => setActiveComponent("Users")}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[#374151] ${
                            activeComponent === "Users" ? "bg-[#374151]" : ""
                        }`}
                    >
                        <UsersIcon className="h-5 w-5" />
                        {isOpen && <span>Manage Users</span>}
                    </button>
                    <button
                        onClick={() => setActiveComponent("Books")}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[#374151] ${
                            activeComponent === "Books" ? "bg-[#374151]" : ""
                        }`}
                    >
                        <BookIcon className="h-5 w-5" />
                        {isOpen && <span>Manage Books</span>}
                    </button>
                    <button
                        onClick={() => setActiveComponent("Comments")}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-[#374151] ${
                            activeComponent === "Comments" ? "bg-[#374151]" : ""
                        }`}
                    >
                        <MessageCircleIcon className="h-5 w-5" />
                        {isOpen && <span>Manage Comments</span>}
                    </button>
                </nav>
            </aside>

            {/* Main Content Area */}
            <div className={`flex-1 ml-${isOpen ? '64' : '16'} transition-all duration-300`}>
                {/* Header at the top of the main content */}
                <header className="flex items-center justify-between bg-[#1f2937] text-white p-4 shadow">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                    <div className="flex items-center space-x-4">
                        <span>Welcome, Admin!</span>
                        <Button variant="ghost" className="bg-gray-200 text-gray-800">
                            Logout
                        </Button>
                    </div>
                </header>

                {/* Render selected content */}
                <main className="bg-white rounded shadow overflow-y-auto h-[calc(100vh-112px)]"> 
                    {/* Adjust height to avoid overlap with footer */}
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}


// Icons
function BookIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
    );
}

function MessageCircleIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        </svg>
    );
}

function UsersIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function XIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}

function HamburgerIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
    );
}
