import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    fetchBooksByAuthor,
    addBook,
    updateBook,
    deleteBook,
} from "@/features/books/bookThunks";

export default function BookManagement() {
    const dispatch = useDispatch();

    const authoredBooks = useSelector((state) => state.userBooks.authoredBooks);
    const loading = useSelector((state) => state.userBooks.loading);
    const error = useSelector((state) => state.userBooks.error);
    const user = useSelector((state) => state.auth.user);
    const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

    const [showModal, setShowModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState(null);
    const [showBookForm, setShowBookForm] = useState(false);
    const [currentBook, setCurrentBook] = useState(null);

    useEffect(() => {
        if (isAuthenticated && user?.id) {
            dispatch(fetchBooksByAuthor(user.id));
        }
    }, [dispatch, isAuthenticated, user?.id]);

    const handleDeleteBook = (book) => {
        setBookToDelete(book);
        setShowModal(true);
    };

    const confirmDeleteBook = () => {
        if (bookToDelete) {
            dispatch(deleteBook(bookToDelete._id))
                .unwrap()
                .then(() => {
                    dispatch(fetchBooksByAuthor(user.id));
                })
                .catch((error) => console.error("Error deleting book:", error));
            setShowModal(false);
        }
    };

    const handleEditBook = (book) => {
        setCurrentBook(book);
        setShowBookForm(true);
    };

    const handleAddBook = () => {
        setCurrentBook(null);
        setShowBookForm(true);
    };

    const saveBook = (bookData) => {
        if (currentBook) {
            dispatch(updateBook(bookData))
                .unwrap()
                .then(() => {
                    dispatch(fetchBooksByAuthor(user.id));
                })
                .catch((error) => console.error("Error updating book:", error));
        } else {
            dispatch(addBook(bookData))
                .unwrap()
                .then(() => {
                    dispatch(fetchBooksByAuthor(user.id));
                })
                .catch((error) => console.error("Error adding book:", error));
        }
        setShowBookForm(false);
    };

    if (!isAuthenticated) {
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
                                    <CardDescription>
                                        Published:{" "}
                                        {book.publishedDate
                                            ? new Date(book.publishedDate).toLocaleDateString()
                                            : "No publication date available"}
                                    </CardDescription>
                                    <CardDescription>Price: ${book.price.toFixed(2)}</CardDescription>
                                    <CardDescription>
                                        Rental Price: ${book.rentalPrice.toFixed(2)}
                                    </CardDescription>
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
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDeleteBook(book)}
                                    >
                                        Delete
                                    </Button>
                                </CardFooter>
                            </div>
                            <div className="mt-4 md:mt-0 md:ml-6 md:w-48">
                                <img
                                    src={
                                        book.imageUrl ||
                                        "https://m.media-amazon.com/images/I/416V8IMmH7L._SX342_SY445_.jpg"
                                    }
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
            <Dialog
                open={showBookForm}
                onOpenChange={setShowBookForm}
                className="max-h-[90vh] overflow-auto"
            >
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
                                title: form.title?.value,
                                author: { username: user.username, id: user.id },
                                publishedDate: form.publicationDate?.value,
                                description: form.description?.value,
                                price: parseFloat(form.price?.value),
                                rentalPrice: parseFloat(form.rentalPrice?.value),
                                availableForPurchase: form.availableForPurchase?.value === "yes",
                                availableForRental: form.availableForRental?.value === "yes",
                                imageUrl: form.imageUrl?.value,
                            };
                            saveBook(bookData);
                        }}
                        className="flex flex-col gap-4 py-4"
                    >
                        <div className="flex items-center gap-4">
                            <Label htmlFor="title" className="w-1/3 text-right">Title</Label>
                            <Input id="title" name="title" defaultValue={currentBook?.title} required className="flex-1" />
                        </div>
                        <div className="flex items-center gap-4">
                            <Label htmlFor="publicationDate" className="w-1/3 text-right">Publication Date</Label>
                            <Input
                                id="publicationDate"
                                name="publicationDate"
                                type="date"
                                defaultValue={currentBook?.publishedDate ? new Date(currentBook.publishedDate).toISOString().split("T")[0] : ""}
                                required
                                className="flex-1"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Label htmlFor="description" className="w-1/3 text-right">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={currentBook?.description}
                                required
                                className="flex-1"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Label htmlFor="price" className="w-1/3 text-right">Price ($)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                defaultValue={currentBook?.price}
                                required
                                className="flex-1"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Label htmlFor="rentalPrice" className="w-1/3 text-right">Rental Price ($)</Label>
                            <Input
                                id="rentalPrice"
                                name="rentalPrice"
                                type="number"
                                step="0.01"
                                defaultValue={currentBook?.rentalPrice}
                                required
                                className="flex-1"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <Label className="w-1/3 text-right">Available for Purchase</Label>
                            <Select
                                defaultValue={currentBook?.availableForPurchase ? "yes" : "no"}
                                name="availableForPurchase"
                                className="flex-1"
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-4">
                            <Label className="w-1/3 text-right">Available for Rental</Label>
                            <Select
                                defaultValue={currentBook?.availableForRental ? "yes" : "no"}
                                name="availableForRental"
                                className="flex-1"
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="yes">Yes</SelectItem>
                                    <SelectItem value="no">No</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-4">
                            <Label htmlFor="imageUrl" className="w-1/3 text-right">Cover Image URL</Label>
                            <Input
                                id="imageUrl"
                                name="imageUrl"
                                defaultValue={currentBook?.imageUrl}
                                required
                                className="flex-1"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit">
                                {currentBook ? "Save Changes" : "Add Book"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

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
