import { configureStore } from '@reduxjs/toolkit';
import bookReducer from '@/features/books/bookSlice'; 
import userReducer from'@/features/users/userSlice';
import authReducer from '@/features/auth/authSlice';
import commentReducer from '@/features/comments/commentSlice';
import paymentReducer from '@/features/payments/paymentSlice';
import userBookReducer from '@/features/books/userBookSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        books: bookReducer, 
        comments: commentReducer,
        payments: paymentReducer,
        userBooks: userBookReducer,
    },
});

export default store;
