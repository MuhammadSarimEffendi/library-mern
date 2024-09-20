// bookSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { 
    fetchBooks, 
    fetchBookById, 
    fetchBooksByAuthor, 
    addBook, 
    updateBook, 
    deleteBook 
} from '@/features/books/bookThunks';
import { addComment } from '@/features/comments/commentThunks';

const initialState = {
    items: [],
    currentBook: null, 
    totalBooks: 0,
    currentPage: 1,
    totalPages: 1,
    loading: false,
    error: null,
};

const bookSlice = createSlice({
    name: 'books',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch books
            .addCase(fetchBooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBooks.fulfilled, (state, action) => {
                state.items = action.payload.books;
                state.totalBooks = action.payload.totalBooks;
                state.currentPage = action.payload.currentPage;
                state.totalPages = action.payload.totalPages;
                state.loading = false;
            })
            .addCase(fetchBooks.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            })

            // Fetch book by ID
            .addCase(fetchBookById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBookById.fulfilled, (state, action) => {
                state.currentBook = action.payload; 
                state.loading = false;
            })
            .addCase(fetchBookById.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            })

            .addCase(addComment.fulfilled, (state, action) => {
                if (state.currentBook) {
                    state.currentBook.comments.push(action.payload); 
                }
            })


            .addCase(addBook.fulfilled, (state, action) => {
                state.items.push(action.payload);
                state.totalBooks += 1;
            })


            .addCase(updateBook.fulfilled, (state, action) => {
                const index = state.items.findIndex(
                    (book) => book.id === action.payload.id || book._id === action.payload._id
                );
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })


            .addCase(deleteBook.fulfilled, (state, action) => {
                state.items = state.items.filter(
                    (book) => book.id !== action.payload && book._id !== action.payload
                );
                state.totalBooks -= 1;
            });
    },
});

export default bookSlice.reducer;
