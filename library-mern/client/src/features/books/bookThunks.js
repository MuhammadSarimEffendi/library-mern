import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/api/axiosInstance";

// Fetch all books with pagination
export const fetchBooks = createAsyncThunk(
    "books/fetchBooks",
    async ({ page, limit, searchTerm = "" }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/book", {
                params: { page, limit , searchTerm },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error fetching books");
        }
    }
);
// Fetch a book by ID
export const fetchBookById = createAsyncThunk(
    "books/fetchBookById",
    async (id, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/book/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Error fetching book details"
            );
        }
    }
);

// Fetch books by a specific author
export const fetchBooksByAuthor = createAsyncThunk(
    "books/fetchBooksByAuthor",
    async (authorId, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/book/author/${authorId}`);
            console.log("books fetcheddddd",response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Error fetching books by author"
            );
        }
    }
);

// Add a new book
export const addBook = createAsyncThunk(
    "books/addBook",
    async (book, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/book", book);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error adding book");
        }
    }
);

// Update an existing book
export const updateBook = createAsyncThunk(
    "books/updateBook",
    async (book, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/book/${book.id}`, book);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error updating book");
        }
    }
);

// Delete a book
export const deleteBook = createAsyncThunk(
    "books/deleteBook",
    async (id, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/book/${id}`);
            return id; 
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error deleting book");
        }
    }
);

// Fetch owned books
export const fetchOwnedBooks = createAsyncThunk(
    "books/fetchOwnedBooks",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/book/owned-books");
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Error fetching owned books"
            );
        }
    }
);

// Access purchased or rented book content
export const fetchPurchasedBookContent = createAsyncThunk(
    "books/fetchPurchasedBookContent",
    async (data, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/book/access/purchased", data);
            return response.data;
        } catch (error) {
            return rejectWithValue(
                error.response?.data || "Error accessing purchased book content"
            );
        }
    }
);
