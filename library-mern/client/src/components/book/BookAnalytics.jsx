import { useEffect, useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux';
import { fetchBooksByAuthor } from '@/features/books/bookThunks';
import { ResponsiveBar } from '@nivo/bar';

export default function Component() {
    const dispatch = useDispatch();
    
    const { authoredBooks, loading, error } = useSelector((state) => state.userBooks);
    
    const [publishedBooksCount, setPublishedBooksCount] = useState(0);
    const [totalPurchasersCount, setTotalPurchasersCount] = useState(0);
    const [totalRentersCount, setTotalRentersCount] = useState(0);
    const [booksOverTime, setBooksOverTime] = useState([]);

    const currentUserId = useSelector((state) => state.auth.user?.id);

    useEffect(() => {
        if (currentUserId) {
            dispatch(fetchBooksByAuthor(currentUserId));
        }
    }, [dispatch, currentUserId]);

    useEffect(() => {
        if (authoredBooks.length) {
            console.log('Authored Books:', authoredBooks); 
            
            setPublishedBooksCount(authoredBooks.length);

            const totalPurchasers = authoredBooks.reduce((acc, book) => acc + (book.purchasers ? book.purchasers.length : 0), 0);
            const totalRenters = authoredBooks.reduce((acc, book) => acc + (book.renters ? book.renters.length : 0), 0);

            setTotalPurchasersCount(totalPurchasers);
            setTotalRentersCount(totalRenters);

            const booksOverTimeData = calculateBooksOverTime(authoredBooks);
            console.log('Books Over Time Data:', booksOverTimeData);
            setBooksOverTime(booksOverTimeData);
        }
    }, [authoredBooks]);

    const calculateBooksOverTime = (books) => {
        const counts = {};
        const bookDetails = {};

        books.forEach(book => {
            if (book.publishedDate) {
                const publishedDate = new Date(book.publishedDate);
                const yearMonth = `${publishedDate.getFullYear()}-${('0' + (publishedDate.getMonth() + 1)).slice(-2)}`; 
                if (!counts[yearMonth]) {
                    counts[yearMonth] = 0;
                    bookDetails[yearMonth] = [];
                }
                counts[yearMonth]++;
                bookDetails[yearMonth].push({ title: book.title });
            }
        });

        const result = Object.keys(counts).sort().map(yearMonth => ({
            yearMonth,
            count: counts[yearMonth],
            details: bookDetails[yearMonth]
        }));

        return result;
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-primary text-primary-foreground py-6 px-4 md:px-6">
                <div className="container mx-auto">
                    <h1 className="text-3xl font-bold">Book Analytics</h1>
                    <p className="text-muted-foreground">Gain insights into your book publishing and sales data.</p>
                </div>
            </header>

            <main className="flex-1 py-8 px-4 md:px-6">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium mb-2">Total Published Books</h3>
                        <p className="text-4xl font-bold">{publishedBooksCount}</p>
                    </div>
                    <div className="bg-card rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium mb-2">Total Purchasers Across All Books</h3>
                        <p className="text-4xl font-bold">{totalPurchasersCount}</p>
                    </div>
                    <div className="bg-card rounded-lg shadow p-6">
                        <h3 className="text-lg font-medium mb-2">Total Renters Across All Books</h3>
                        <p className="text-4xl font-bold">{totalRentersCount}</p>
                    </div>
                </div>

                <div className="container mx-auto mt-8">
                    <div className="bg-card rounded-lg shadow p-6">
                        <h2 className="text-2xl font-bold mb-4">Published Books Over Time</h2>
                        {loading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p className="text-red-500">Error: {error}</p>
                        ) : (
                            <div style={{ height: '400px', width: '100%' }}>
                                <BarChart data={booksOverTime} />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="bg-muted text-muted-foreground py-4 px-4 md:px-6">
                <div className="container mx-auto text-center text-sm">&copy; 2024 Book Analytics. All rights reserved.</div>
            </footer>
        </div>
    );
}

function BarChart({ data }) {
    return (
        <ResponsiveBar
            data={data}
            keys={['count']}
            indexBy="yearMonth"
            margin={{ top: 20, right: 130, bottom: 50, left: 60 }}
            padding={0.3}
            layout="vertical"
            colors={{ scheme: 'nivo' }}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 45,
                legend: 'Year-Month',
                legendPosition: 'middle',
                legendOffset: 30,
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Number of Books',
                legendPosition: 'middle',
                legendOffset: -50,
            }}
            tooltip={({ data }) => (
                <div style={{ padding: '12px', background: 'white', border: '1px solid #ccc' }}>
                    <strong>{data.yearMonth}</strong>
                    <div style={{ fontSize: '12px' }}>
                        {data.details.map((book, index) => (
                            <div key={index} style={{ marginBottom: '4px' }}>
                                <span>{book.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        />
    );
}
