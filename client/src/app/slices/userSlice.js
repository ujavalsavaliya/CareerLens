import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosClient';

// Upload avatar
export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await API.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Upload failed');
    }
  }
);

// Remove avatar
export const removeAvatar = createAsyncThunk(
  'user/removeAvatar',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.delete('/users/avatar');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Remove failed');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Upload Avatar
      .addCase(uploadAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        state.loading = false;
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
          user.avatar = action.payload.avatar;
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
      .addCase(uploadAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove Avatar
      .addCase(removeAvatar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeAvatar.fulfilled, (state) => {
        state.loading = false;
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
          user.avatar = { url: '', publicId: '' };
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
      .addCase(removeAvatar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default userSlice.reducer;