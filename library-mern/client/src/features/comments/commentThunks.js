import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '@/api/axiosInstance';

// Fetch all comments
export const fetchAllComments = createAsyncThunk(
    "comments/fetchAllComments",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/comment`); // Assuming /comment endpoint returns all comments
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error fetching all comments");
        }
    }
);

// Add a new comment
export const addComment = createAsyncThunk(
    "comments/addComment",
    async ({ bookId, commentData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/comment/${bookId}`, commentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error adding comment");
        }
    }
);

// Update an existing comment
export const updateComment = createAsyncThunk(
    "comments/updateComment",
    async ({ commentId, commentData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.put(`/comment/${commentId}`, commentData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error updating comment");
        }
    }
);

// Delete a comment
export const deleteComment = createAsyncThunk(
    "comments/deleteComment",
    async (commentId, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/comment/${commentId}`);
            return commentId; 
        } catch (error) {
            return rejectWithValue(error.response?.data || "Error deleting comment");
        }
    }
);