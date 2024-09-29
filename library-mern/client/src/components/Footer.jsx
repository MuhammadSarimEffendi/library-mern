import { Link } from "react-router-dom"; 

export default function Footer() {
    return (
        <footer className="bg-[#1f2937] text-white py-4 w-full mt-auto">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-4">
                <Link to="/" className="flex items-center gap-2">
                    <BookIcon className="w-6 h-6 text-primary" />
                    <span className="text-lg font-semibold">Library</span>
                </Link>
                <nav className="flex items-center gap-6">
                    <Link to="/book-list" className="text-gray-400 hover:text-white">
                        Books
                    </Link>
                    <Link to="/members" className="text-gray-400 hover:text-white">
                        Members
                    </Link>
                    <Link to="/events" className="text-gray-400 hover:text-white">
                        Events
                    </Link>
                </nav>
                <p className="text-xs text-gray-400">&copy; 2024 Library Management System. All rights reserved.</p>
            </div>
        </footer>
    );
}

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
