import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchBooks,
    addBook,
    updateBook,
    deleteBook,
} from "@/features/books/bookThunks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    PaginationEllipsis,
} from "@/components/ui/pagination";

export default function ManageBooks() {
    const dispatch = useDispatch();

    // Destructure books, loading, error, etc. from Redux store
    const { items: books = [], totalBooks, currentPage, totalPages, loading, error } = useSelector(
        (state) => state.books
    );

    // State for modal display and selected book
    const [showModal, setShowModal] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);
    const booksPerPage = 5;

    // Fetch books when the component mounts or currentPage changes
    useEffect(() => {
        dispatch(fetchBooks({ page: currentPage, limit: booksPerPage }))
            .unwrap()
            .then((res) => {
                console.log("Fetched books data:", res);
            })
            .catch((error) => {
                console.error("Error fetching books:", error);
            });
    }, [dispatch, currentPage]);

    // Handle book editing
    const handleEdit = (book) => {
        setSelectedBook(book);
        setShowModal(true);
    };

    // Handle book deletion
    const handleDelete = (id) => {
        dispatch(deleteBook(id))
            .unwrap()
            .then(() => {
                console.log("Book deleted successfully");
            })
            .catch((error) => {
                console.error("Error deleting book:", error);
            });
    };

    // Handle form submission (for adding or updating books)
    const handleSubmit = (book) => {
        if (selectedBook) {
            dispatch(updateBook(book))
                .unwrap()
                .then(() => console.log("Book updated successfully"))
                .catch((error) => console.error("Error updating book:", error));
        } else {
            dispatch(addBook(book))
                .unwrap()
                .then(() => console.log("Book added successfully"))
                .catch((error) => console.error("Error adding book:", error));
        }
        setShowModal(false);
        setSelectedBook(null);
    };

    // Handle pagination
    const handlePageChange = (pageNumber) => {
        dispatch(fetchBooks({ page: pageNumber, limit: booksPerPage }))
            .unwrap()
            .then((res) => {
                console.log("Fetched books data:", res);
            })
            .catch((error) => {
                console.error("Error fetching books:", error);
            });
    };

    return (
        <div className="flex flex-col min-h-screen">
            <header className="bg-primary text-primary-foreground py-4 px-6">
                <h1 className="text-2xl font-bold">Book Management</h1>
            </header>
            <main className="flex-1 p-6">
                <div className="flex justify-end mb-4">
                    <Button variant="outline" onClick={() => setShowModal(true)}>
                        Add Book
                    </Button>
                </div>
                {loading && <p>Loading books...</p>}
                {error && <p className="text-red-500">{error}</p>}
                <div className="overflow-x-auto">
                    {Array.isArray(books) && books.length > 0 ? (
                        <Table className="w-full">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Published Date</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Rental Price</TableHead>
                                    <TableHead>Available</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {books.map((book) => (
                                    <TableRow key={book.id || book._id}>
                                        <TableCell>{book.title || "No Title"}</TableCell>
                                        <TableCell>{book.author?.username || "Unknown"}</TableCell>
                                        <TableCell>{book.description || "No Description Available"}</TableCell>
                                        <TableCell>
                                            {book.publishedDate
                                                ? new Date(book.publishedDate).toLocaleDateString()
                                                : "No Date Available"}
                                        </TableCell>
                                        <TableCell>
                                            ${book.price ? book.price.toFixed(2) : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            ${book.rentalPrice ? book.rentalPrice.toFixed(2) : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            {(book.availableForPurchase || book.availableForRental) ? (
                                                <Badge variant="success">Available</Badge>
                                            ) : (
                                                <Badge variant="danger">Unavailable</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleEdit(book)}>
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(book.id || book._id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-center">No books available.</p>
                    )}
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage > 1) handlePageChange(currentPage - 1);
                                    }}
                                    disabled={currentPage === 1}
                                />
                            </PaginationItem>
                            {[...Array(totalPages).keys()].map((page) => (
                                <PaginationItem key={page + 1}>
                                    <PaginationLink
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handlePageChange(page + 1);
                                        }}
                                        isActive={currentPage === page + 1}
                                    >
                                        {page + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            {totalPages > 5 && currentPage < totalPages - 1 && (
                                <PaginationItem>
                                    <PaginationEllipsis />
                                </PaginationItem>
                            )}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (currentPage < totalPages) handlePageChange(currentPage + 1);
                                    }}
                                    disabled={currentPage === totalPages}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </main>

            {/* Add/Edit Book Dialog */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedBook ? "Edit Book" : "Create Book"}</DialogTitle>
                        <DialogDescription>
                            {selectedBook
                                ? "Update the book details below."
                                : "Fill out the form to create a new book."}
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.target);
                            const book = {
                                id: selectedBook?.id || selectedBook?._id,
                                title: formData.get("title"),
                                author: formData.get("author"),
                                description: formData.get("description"),
                                publishedDate: formData.get("publishedDate"),
                                price: parseFloat(formData.get("price")),
                                rentalPrice: parseFloat(formData.get("rentalPrice")),
                                availableForPurchase: formData.get("availableForPurchase") === "on",
                                availableForRental: formData.get("availableForRental") === "on",
                            };
                            handleSubmit(book);
                        }}
                    >
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        defaultValue={selectedBook?.title || ""}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="author">Author</Label>
                                    <Input
                                        id="author"
                                        name="author"
                                        defaultValue={selectedBook?.author?.username || ""}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    defaultValue={selectedBook?.description || ""}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="publishedDate">Published Date</Label>
                                    <Input
                                        id="publishedDate"
                                        name="publishedDate"
                                        type="date"
                                        defaultValue={selectedBook?.publishedDate?.split("T")[0] || ""}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="price">Price</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        defaultValue={selectedBook?.price || ""}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="rentalPrice">Rental Price</Label>
                                    <Input
                                        id="rentalPrice"
                                        name="rentalPrice"
                                        type="number"
                                        step="0.01"
                                        defaultValue={selectedBook?.rentalPrice || ""}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="availableForPurchase"
                                        name="availableForPurchase"
                                        defaultChecked={selectedBook?.availableForPurchase || false}
                                    />
                                    <Label htmlFor="availableForPurchase">Available for Purchase</Label>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="availableForRental"
                                        name="availableForRental"
                                        defaultChecked={selectedBook?.availableForRental || false}
                                    />
                                    <Label htmlFor="availableForRental">Available for Rental</Label>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">
                                {selectedBook ? "Save Changes" : "Create Book"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
