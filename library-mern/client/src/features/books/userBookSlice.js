import { createSlice } from '@reduxjs/toolkit';
import { fetchBooksByAuthor, fetchPurchasedBookContent } from '@/features/books/bookThunks';

const initialState = {
    authoredBooks: [],  // List of books authored by the current user
    purchasedBooks: [],  // Separate field for purchased books
    rentedBooks: [],     // Separate field for rented books
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
            // Fetch books by the current author (user)
            .addCase(fetchBooksByAuthor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBooksByAuthor.fulfilled, (state, action) => {
                state.authoredBooks = action.payload || [];  // API should return books by the user
                state.loading = false;
            })
            .addCase(fetchBooksByAuthor.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            })

            // Fetch owned books (purchased/rented)
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
