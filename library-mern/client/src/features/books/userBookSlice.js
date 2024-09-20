import { createSlice } from '@reduxjs/toolkit';
import { fetchBooksByAuthor, fetchOwnedBooks, fetchPurchasedBookContent } from '@/features/books/bookThunks';

const initialState = {
    authoredBooks: [],
    purchasedBooks: [], 
    rentedBooks: [],    
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
            .addCase(fetchBooksByAuthor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBooksByAuthor.fulfilled, (state, action) => {
                state.authoredBooks = action.payload || [];  
                state.loading = false;
            })
            .addCase(fetchBooksByAuthor.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            })

            .addCase(fetchOwnedBooks.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOwnedBooks.fulfilled, (state, action) => {
                state.purchasedBooks = action.payload.purchasedBooks || [];  
                state.rentedBooks = action.payload.rentedBooks || []; 
                state.loading = false;
            })
            .addCase(fetchOwnedBooks.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            })

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
