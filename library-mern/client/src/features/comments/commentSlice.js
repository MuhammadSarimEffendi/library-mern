import { createSlice } from '@reduxjs/toolkit';
import { 
    fetchAllComments,
    addComment, 
    updateComment, 
    deleteComment, 
} from '@/features/comments/commentThunks';
const initialState = {
    items: [],              
    loading: false,         
    error: null,            
};

const commentSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch all comments
            .addCase(fetchAllComments.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllComments.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchAllComments.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            })

            // Add new comment
            .addCase(addComment.fulfilled, (state, action) => {
                state.items.push(action.payload);
            })

            // Update existing comment
            .addCase(updateComment.fulfilled, (state, action) => {
                const index = state.items.findIndex(
                    (comment) => comment.id === action.payload.id || comment._id === action.payload._id
                );
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })

            // Delete a comment
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.items = state.items.filter(
                    (comment) => comment.id !== action.payload && comment._id !== action.payload
                );
            });
    },
});

export default commentSlice.reducer;
