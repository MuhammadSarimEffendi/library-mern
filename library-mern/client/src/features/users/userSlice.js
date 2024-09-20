import { createSlice } from '@reduxjs/toolkit';
import {
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
} from '@/features/users/userThunks';

const initialState = {
    items: [],           
    selectedUser: null,  
    loading: false,      
    error: null,         
};

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        clearSelectedUser(state) {
            state.selectedUser = null;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.items = action.payload;
                state.loading = false;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            });

        builder
            .addCase(fetchUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.selectedUser = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.selectedUser = action.payload; 
                state.loading = false;
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            });

        builder
            .addCase(createUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.items.push(action.payload.user); 
                state.loading = false;
            })
            .addCase(createUser.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            });

        builder
            .addCase(updateUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUser.fulfilled, (state, action) => {
                const updatedUser = action.payload;
                const index = state.items.findIndex(
                    (user) => user.id === updatedUser.id || user._id === updatedUser._id
                );
                if (index !== -1) {
                    state.items[index] = updatedUser;
                }
                if (state.selectedUser && (state.selectedUser.id === updatedUser.id || state.selectedUser._id === updatedUser._id)) {
                    state.selectedUser = updatedUser;
                }
                state.loading = false;
            })
            .addCase(updateUser.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            });

        builder
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                const { id } = action.payload;
                state.items = state.items.filter(
                    (user) => user.id !== id && user._id !== id
                );
                if (state.selectedUser && (state.selectedUser.id === id || state.selectedUser._id === id)) {
                    state.selectedUser = null;
                }
                state.loading = false;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.error = action.payload || action.error.message;
                state.loading = false;
            });

    },
});

export const { clearSelectedUser } = userSlice.actions;

export default userSlice.reducer;
