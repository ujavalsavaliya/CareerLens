import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axiosClient';

export const getFeed = createAsyncThunk(
    'posts/getFeed',
    async ({ page = 1, limit = 10, append = false } = {}, { rejectWithValue }) => {
        try {
            const res = await API.get('/posts/feed', { params: { page, limit } });
            return { ...res.data, append };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to load feed');
        }
    }
);

export const createPost = createAsyncThunk(
    'posts/createPost',
    async (formData, { rejectWithValue }) => {
        try {
            const res = await API.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to create post');
        }
    }
);

export const reactToPost = createAsyncThunk(
    'posts/reactToPost',
    async ({ postId, type }, { rejectWithValue }) => {
        try {
            const res = await API.post(`/posts/${postId}/react`, { type });
            return { postId, ...res.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to react');
        }
    }
);

export const addComment = createAsyncThunk(
    'posts/addComment',
    async ({ postId, text }, { rejectWithValue }) => {
        try {
            const res = await API.post(`/posts/${postId}/comment`, { text });
            return { postId, comment: res.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to comment');
        }
    }
);

export const likeComment = createAsyncThunk(
    'posts/likeComment',
    async ({ postId, commentId }, { rejectWithValue }) => {
        try {
            const res = await API.post(`/posts/${postId}/comments/${commentId}/like`);
            return { postId, commentId, likes: res.data.likes };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to like comment');
        }
    }
);

export const replyToComment = createAsyncThunk(
    'posts/replyToComment',
    async ({ postId, commentId, text }, { rejectWithValue }) => {
        try {
            const res = await API.post(`/posts/${postId}/comments/${commentId}/reply`, { text });
            return { postId, commentId, reply: res.data };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to reply');
        }
    }
);

export const likeReply = createAsyncThunk(
    'posts/likeReply',
    async ({ postId, commentId, replyId }, { rejectWithValue }) => {
        try {
            const res = await API.post(`/posts/${postId}/comments/${commentId}/replies/${replyId}/like`);
            return { postId, commentId, replyId, likes: res.data.likes };
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to like reply');
        }
    }
);

export const deletePost = createAsyncThunk(
    'posts/deletePost',
    async (postId, { rejectWithValue }) => {
        try {
            await API.delete(`/posts/${postId}`);
            return postId;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to delete post');
        }
    }
);

export const updatePost = createAsyncThunk(
    'posts/updatePost',
    async ({ postId, content, visibility }, { rejectWithValue }) => {
        try {
            const res = await API.put(`/posts/${postId}`, { content, visibility });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || 'Failed to update post');
        }
    }
);

const postSlice = createSlice({
    name: 'posts',
    initialState: {
        posts: [],
        total: 0,
        page: 1,
        pages: 1,
        hasMore: true,
        loading: false,
        error: null
    },
    reducers: {
        resetFeed(state) {
            state.posts = [];
            state.total = 0;
            state.page = 1;
            state.pages = 1;
            state.hasMore = true;
            state.loading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getFeed.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFeed.fulfilled, (state, action) => {
                state.loading = false;
                const { posts, total, page, pages, append } = action.payload;
                state.total = total;
                state.page = page;
                state.pages = pages;
                state.hasMore = page < pages;
                state.posts = append ? [...state.posts, ...posts] : posts;
            })
            .addCase(getFeed.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.posts = [action.payload, ...state.posts];
                state.total += 1;
            })
            .addCase(createPost.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(reactToPost.fulfilled, (state, action) => {
                const { postId, reactions, count, userReaction } = action.payload;
                const idx = state.posts.findIndex(p => p._id === postId);
                if (idx > -1) {
                    state.posts[idx].reactions = reactions;
                    state.posts[idx].reactionCount = count;
                    state.posts[idx].userReaction = userReaction;
                }
            })
            .addCase(addComment.fulfilled, (state, action) => {
                const { postId, comment } = action.payload;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    post.comments = [...(post.comments || []), comment];
                }
            })
            .addCase(likeComment.fulfilled, (state, action) => {
                const { postId, commentId, likes } = action.payload;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    const comment = post.comments?.find(c => c._id === commentId);
                    if (comment) {
                        comment.likes = likes;
                        comment.likesCount = likes.length;
                    }
                }
            })
            .addCase(replyToComment.fulfilled, (state, action) => {
                const { postId, commentId, reply } = action.payload;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    const comment = post.comments?.find(c => c._id === commentId);
                    if (comment) {
                        comment.replies = [...(comment.replies || []), reply];
                    }
                }
            })
            .addCase(likeReply.fulfilled, (state, action) => {
                const { postId, commentId, replyId, likes } = action.payload;
                const post = state.posts.find(p => p._id === postId);
                if (post) {
                    const comment = post.comments?.find(c => c._id === commentId);
                    if (comment) {
                        const reply = comment.replies?.find(r => r._id === replyId);
                        if (reply) {
                            reply.likes = likes;
                            reply.likesCount = likes.length;
                        }
                    }
                }
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.posts = state.posts.filter(p => p._id !== action.payload);
                state.total = Math.max(0, state.total - 1);
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                const updated = action.payload;
                const idx = state.posts.findIndex(p => p._id === updated._id);
                if (idx > -1) {
                    state.posts[idx] = { ...state.posts[idx], ...updated };
                }
            });
    }
});

export const { resetFeed } = postSlice.actions;
export default postSlice.reducer;

