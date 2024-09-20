import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { fetchBooksByAuthor, addBook, updateBook, deleteBook } from '@/features/books/bookThunks';

export default function BookManagement() {
    const dispatch = useDispatch();

    // Selectors to access state
    const authoredBooks = useSelector((state) => state.userBooks.authoredBooks); // Use authoredBooks
    const loading = useSelector((state) => state.userBooks.loading);
    const error = useSelector((state) => state.userBooks.error);
    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    // Local state for UI interactions
    const [showModal, setShowModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [showBookForm, setShowBookForm] = useState(false);
    const [currentBook, setCurrentBook] = useState(null);

    // Fetch the books authored by the current user
    useEffect(() => {
        if (isAuthenticated && user?.id) {  // Fix: use user.id
            console.log("User is authenticated, fetching books for user ID:", user.id);
            dispatch(fetchBooksByAuthor(user.id));  // Fix: pass user.id to fetchBooksByAuthor
        } else {
            console.log("User is not authenticated or missing user.id");
        }
    }, [dispatch, isAuthenticated, user?.id]); // Fix: dependency on user.id

    // Log the books data whenever it changes
    useEffect(() => {
        console.log("Authored Books state updated:", authoredBooks);
    }, [authoredBooks]);

    // Log loading and error states
    useEffect(() => {
        if (loading) {
            console.log("Loading books...");
        }
        if (error) {
            console.error("Error fetching books:", error);
        }
    }, [loading, error]);

    const handleDeleteBook = (book) => {
        console.log("Delete button clicked for book:", book);
        setBookToDelete(book);
        setShowModal(true);
    };

    const confirmDeleteBook = () => {
        if (bookToDelete) {
            console.log("Confirming delete for book:", bookToDelete);
            dispatch(deleteBook(bookToDelete._id));
            setShowModal(false);
        } else {
            console.log("No book to delete");
        }
    };

    const handleEditBook = (book) => {
        console.log("Edit button clicked for book:", book);
        setCurrentBook(book);
        setShowBookForm(true);
    };

    const handleAddBook = () => {
        console.log("Add book button clicked");
        setCurrentBook(null);
        setShowBookForm(true);
    };

    const saveBook = (bookData) => {
        console.log("Saving book data:", bookData);
        if (currentBook) {
            console.log("Updating existing book:", bookData);
            dispatch(updateBook(bookData));
        } else {
            console.log("Adding new book:", bookData);
            dispatch(addBook(bookData));
        }
        setShowBookForm(false);
    };

    

    if (!isAuthenticated) {
        console.log("User is not authenticated, redirecting to login");
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Please log in to manage your books.</p>
            </div>
        );
    }

    return (
        <div className="bg-muted/40 min-h-screen flex flex-col">
            <header className="bg-background border-b px-6 py-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Publications</h1>
                <div className="flex items-center gap-4">
                    <Button onClick={handleAddBook}>Add Book</Button>
                </div>
            </header>
            <main className="flex-1 p-6 grid gap-6">
                {loading && <p>Loading books...</p>}
                {error && <p className="text-red-500">Error: {error}</p>}
                {authoredBooks.length === 0 && !loading ? (
                    <p>No books available.</p>
                ) : (
                    authoredBooks.map((book) => (
                        <Card key={book._id} className="flex flex-col md:flex-row">
                            <div className="flex-1">
                                <CardHeader>
                                    <CardTitle>{book.title}</CardTitle>
                                    <CardDescription>Author: {book.author.username}</CardDescription>
                                    <CardDescription>Published: {new Date(book.publicationDate).toLocaleDateString()}</CardDescription>
                                    <CardDescription>Price: ${book.price.toFixed(2)}</CardDescription>
                                    <CardDescription>Rental Price: ${book.rentalPrice.toFixed(2)}</CardDescription>
                                    <div className="flex items-center gap-2">
                                        {book.availableForPurchase ? (
                                            <div className="flex items-center gap-2">
                                                <CheckIcon className="w-4 h-4 text-green-500" />
                                                <span>Available for Purchase</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <XIcon className="w-4 h-4 text-red-500" />
                                                <span>Not Available for Purchase</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {book.availableForRental ? (
                                            <div className="flex items-center gap-2">
                                                <CheckIcon className="w-4 h-4 text-green-500" />
                                                <span>Available for Rental</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <XIcon className="w-4 h-4 text-red-500" />
                                                <span>Not Available for Rental</span>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p>{book.description}</p>
                                </CardContent>
                                <CardFooter className="mt-auto flex gap-2">
                                    <Button variant="outline" onClick={() => handleEditBook(book)}>
                                        Edit
                                    </Button>
                                    <Button variant="destructive" onClick={() => handleDeleteBook(book)}>
                                        Delete
                                    </Button>
                                </CardFooter>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-6 md:w-48">
                                <img
                                    src={book.imageUrl || "https://m.media-amazon.com/images/I/416V8IMmH7L._SX342_SY445_.jpg"}
                                    alt={`Cover of ${book.title}`}
                                    width={192}
                                    height={256}
                                    className="w-full h-auto rounded-md object-cover"
                                    style={{ aspectRatio: "192/256", objectFit: "cover" }}
                                />
                            </div>
                        </Card>
                    ))
                )}
            </main>

            {/* Delete Confirmation Modal */}
            <AlertDialog open={showModal} onOpenChange={setShowModal}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Book</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {bookToDelete?.title}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteBook}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Add/Edit Book Dialog */}
            <Dialog open={showBookForm} onOpenChange={setShowBookForm} className="max-h-[90vh] overflow-auto">
                <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{currentBook ? "Edit Book" : "Add Book"}</DialogTitle>
                        <DialogDescription>
                            {currentBook ? "Make changes to the book details." : "Fill out the form to add a new book."}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target;
                            const bookData = {
                                id: currentBook?._id,
                                title: form.title.value,
                                author: { username: user.username, id: user.id }, // Use user.id
                                publicationDate: form.publicationDate.value,
                                description: form.description.value,
                                price: parseFloat(form.price.value),
                                rentalPrice: parseFloat(form.rentalPrice.value),
                                availableForPurchase: form.availableForPurchase.value === 'yes',
                                availableForRental: form.availableForRental.value === 'yes',
                                imageUrl: form.imageUrl.value,
                            };
                            console.log("Form submitted with book data:", bookData);
                            saveBook(bookData);
                        }}
                        className="grid gap-4 py-4"
                    >
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input id="title" name="title" defaultValue={currentBook?.title} required />
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="author" className="text-right">
                                Author
                            </Label>
                            <Input
                                id="author"
                                name="author"
                                value={user.username}
                                disabled
                                className="bg-muted/40"
                            />
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="publicationDate" className="text-right">
                                Publication Date
                            </Label>
                            <Input
                                id="publicationDate"
                                name="publicationDate"
                                type="date"
                                defaultValue={currentBook?.publicationDate ? new Date(currentBook.publicationDate).toISOString().split('T')[0] : ''}
                                required
                            />
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea id="description" name="description" defaultValue={currentBook?.description} required />
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price ($)
                            </Label>
                            <Input id="price" name="price" type="number" step="0.01" defaultValue={currentBook?.price} required />
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="rentalPrice" className="text-right">
                                Rental Price ($)
                            </Label>
                            <Input id="rentalPrice" name="rentalPrice" type="number" step="0.01" defaultValue={currentBook?.rentalPrice} required />
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label className="text-right">Available for Purchase</Label>
                            <Select defaultValue={currentBook?.availableForPurchase ? 'yes' : 'no'} name="availableForPurchase">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label className="text-right">Available for Rental</Label>
                            <Select defaultValue={currentBook?.availableForRental ? 'yes' : 'no'} name="availableForRental">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid items-center grid-cols-4 gap-4">
                            <Label htmlFor="imageUrl" className="text-right">
                                Cover Image URL
                            </Label>
                            <Input id="imageUrl" name="imageUrl" defaultValue={currentBook?.imageUrl} required />
                        </div>
                        <DialogFooter>
                            <Button type="submit">{currentBook ? "Save Changes" : "Add Book"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Icon Components (CheckIcon and XIcon are used for displaying availability status)
function CheckIcon(props) {
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
            <path d="M20 6L9 17l-5-5" />
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
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
        </svg>
    );
}
