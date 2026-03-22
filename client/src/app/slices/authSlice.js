import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loginAPI, registerAPI, getMeAPI } from '../../api/axiosClient';
import { uploadAvatar, removeAvatar } from './userSlice';

const user = JSON.parse(localStorage.getItem('user') || 'null');
const token = localStorage.getItem('token') || null;

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
    try {
        const res = await loginAPI(data);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Login failed');
    }
});

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
    try {
        const res = await registerAPI(data);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data));
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Registration failed');
    }
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
    try {
        const res = await getMeAPI();
        localStorage.setItem('user', JSON.stringify(res.data));
        return res.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch user');
    }
});

const authSlice = createSlice({
    name: 'auth',
    initialState: { user, token, loading: false, error: null },
    reducers: {
        logout(state) {
            state.user = null;
            state.token = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
        updateUserName(state, action) {
            if (state.user) {
                state.user.name = action.payload;
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        clearError(state) { state.error = null; },
        setHrmsAccount(state) {
            if (state.user) {
                state.user.hrmsAccount = true;
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        }
    },
    extraReducers: (builder) => {
        const pending = (state) => { state.loading = true; state.error = null; };
        const fulfilled = (state, { payload }) => { state.loading = false; state.user = payload; state.token = payload.token; };
        const rejected = (state, { payload }) => { state.loading = false; state.error = payload; };

        builder
            .addCase(loginUser.pending, pending).addCase(loginUser.fulfilled, fulfilled).addCase(loginUser.rejected, rejected)
            .addCase(registerUser.pending, pending).addCase(registerUser.fulfilled, fulfilled).addCase(registerUser.rejected, rejected)
            .addCase(fetchMe.pending, pending).addCase(fetchMe.fulfilled, fulfilled).addCase(fetchMe.rejected, rejected)
            .addCase(uploadAvatar.fulfilled, (state, action) => {
                if (state.user) state.user.avatar = action.payload.avatar;
            })
            .addCase(removeAvatar.fulfilled, (state) => {
                if (state.user) state.user.avatar = { url: '', publicId: '' };
            });
    }
});

export const { logout, updateUserName, clearError, setHrmsAccount } = authSlice.actions;
export default authSlice.reducer;
