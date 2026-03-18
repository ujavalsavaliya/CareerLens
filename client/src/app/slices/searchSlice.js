import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosClient';

export const searchAll = createAsyncThunk(
    'search/all',
    async (q, { rejectWithValue }) => {
        try {
            const res = await API.get('/search', { params: { q, type: 'users' } });
            return res.data.users || [];
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Search failed');
        }
    }
);

const searchSlice = createSlice({
    name: 'search',
    initialState: {
        query: '',
        results: [],
        loading: false,
        error: null
    },
    reducers: {
        clearSearch(state) {
            state.query = '';
            state.results = [];
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(searchAll.pending, (state, action) => {
                state.loading = true;
                state.error = null;
                state.query = action.meta.arg;
            })
            .addCase(searchAll.fulfilled, (state, action) => {
                state.loading = false;
                state.results = action.payload;
            })
            .addCase(searchAll.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearSearch } = searchSlice.actions;
export default searchSlice.reducer;

