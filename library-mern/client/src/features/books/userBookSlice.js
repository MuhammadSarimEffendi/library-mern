import { createSlice } from '@reduxjs/toolkit';
import { fetchBooksByAuthor, fetchOwnedBooks, fetchPurchasedBookContent } from '@/features/books/bookThunks';

const initialState = {
    authoredBooks: [],  // List of books authored by the current user
    purchasedBooks: [],  // List of purchased books
    rentedBooks: [],     // List of rented books
    purchasedBookContent: null,
    loading: false,
    error: null,
};

const userBooksSlice = createSlice({
    name: 'userBooks',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch books authored by the current user
            .addCase(fetchBooksByAuthor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBooksByAuthor.fulfilled, (state, action) => {
                state.authoredBooks = action.payload || [];  // API should return books authored by the user
                state.loading = false;
            })
            .addCase(fetchBooksByAuthor.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            })

            // Fetch owned books (purchased/rented)
            .addCase(fetchOwnedBooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOwnedBooks.fulfilled, (state, action) => {
                state.purchasedBooks = action.payload.purchasedBooks || [];  // Ensure payload structure matches API
                state.rentedBooks = action.payload.rentedBooks || [];  // Ensure payload structure matches API
                state.loading = false;
            })
            .addCase(fetchOwnedBooks.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            })

            // Access purchased book content
            .addCase(fetchPurchasedBookContent.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPurchasedBookContent.fulfilled, (state, action) => {
                state.purchasedBookContent = action.payload;
                state.loading = false;
            })
            .addCase(fetchPurchasedBookContent.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            });
    },
});

export default userBooksSlice.reducer;
