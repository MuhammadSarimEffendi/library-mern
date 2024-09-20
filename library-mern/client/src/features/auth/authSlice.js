import { createSlice } from '@reduxjs/toolkit';
import { registerUser, loginUser, fetchCurrentUser } from '@/features/auth/authThunks';
import { jwtDecode } from 'jwt-decode';  // Correct import of jwtDecode

// Helper function to check if the token is expired
const isTokenExpired = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 < Date.now();
    } catch (error) {
        console.error('Error decoding token:', error);
        return true;
    }
};

// Get token and roles from localStorage
const token = localStorage.getItem('authToken');
let initialRoles = [];

const rolesFromStorage = localStorage.getItem('roles');
if (rolesFromStorage) {
    try {
        initialRoles = JSON.parse(rolesFromStorage); // Safely parse roles if present
    } catch (error) {
        console.error('Error parsing roles from localStorage:', error);
        initialRoles = [];
    }
}

let initialState = {
    user: null,           // User details (id, username, email)
    token: token || null, // JWT token
    isAuthenticated: false,
    roles: initialRoles,  // User roles (from token or localStorage)
    loading: false,
    error: null,
    tokenExpiry: null,    // Token expiry timestamp
};

// Check if there's a valid token in localStorage
if (token && !isTokenExpired(token)) {
    try {
        const decoded = jwtDecode(token);
        initialState.isAuthenticated = true;
        initialState.user = {
            id: decoded._id,          // Save user id from token
            username: decoded.username || null,  // Add username if available in token
            email: decoded.email || null,        // Add email if available in token
        };
        initialState.tokenExpiry = decoded.exp;
        initialState.roles = decoded.role || [];
    } catch (error) {
        console.error('Error decoding token on initial load:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('roles');
    }
} else {
    localStorage.removeItem('authToken');
    localStorage.removeItem('roles');
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.tokenExpiry = null;
            state.roles = [];
            localStorage.removeItem('authToken');
            localStorage.removeItem('roles');
            localStorage.removeItem('username');
            localStorage.removeItem('email');
            console.log('User has logged out. Local storage cleared.');
        },
    },
    extraReducers: (builder) => {
        builder
            // Handle registration
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                console.log('Registration in progress...');
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                const { token, user } = action.payload;  // Safely access payload and destructure token and user
                if (token && user) {  // Check if token and user are defined
                    const decodedToken = jwtDecode(token);

                    state.loading = false;
                    state.isAuthenticated = true;
                    state.user = {
                        id: user._id,          // Save user id from response
                        username: user.username,  // Save username from response
                        email: user.email,        // Save email from response
                    };
                    state.token = token;
                    state.tokenExpiry = decodedToken.exp;
                    state.roles = decodedToken.role || [];

                    console.log('Registration successful:', {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        roles: decodedToken.role,
                    });

                    // Persist token and roles in localStorage
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('roles', JSON.stringify(decodedToken.role || []));
                    localStorage.setItem('username', user.username);
                    localStorage.setItem('email', user.email);
                } else {
                    state.loading = false;
                    state.error = 'Invalid response from server: missing token or user information';
                    console.error('Registration error: Missing token or user information.');
                }
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Registration failed';
                console.error('Registration failed:', state.error);
            })

            // Handle login
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                console.log('Login in progress...');
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                const { token, user } = action.payload;  // Safely access payload and destructure token and user
                if (token && user) {  // Check if token and user are defined
                    const decodedToken = jwtDecode(token);

                    state.loading = false;
                    state.isAuthenticated = true;
                    state.user = {
                        id: user._id,          // Capture user id from response
                        username: user.username,  // Capture username from response
                        email: user.email,        // Capture email from response
                    };
                    state.token = token;
                    state.tokenExpiry = decodedToken.exp;
                    state.roles = decodedToken.role || [];

                    console.log('Login successful:', {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        roles: decodedToken.role,
                    });

                    // Persist token and roles in localStorage
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('roles', JSON.stringify(decodedToken.role || []));
                    localStorage.setItem('username', user.username);
                    localStorage.setItem('email', user.email);
                } else {
                    state.loading = false;
                    state.error = 'Invalid response from server: missing token or user information';
                    console.error('Login error: Missing token or user information.');
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Login failed';
                console.error('Login failed:', state.error);
            })

            // Fetch current user
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
                console.log('Fetching current user...');
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                const user = action.payload || {};
                if (user && user.username) {
                    state.user = {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        roles: user.roles || [],
                    };
                    state.loading = false;
                    console.log('Fetched current user successfully:', state.user);
                } else {
                    state.loading = false;
                    state.error = 'Failed to fetch current user';
                    console.error('Error fetching current user: User information is missing.');
                }
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.error = action.payload || 'Fetching current user failed';
                state.loading = false;
                console.error('Fetching current user failed:', state.error);
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
