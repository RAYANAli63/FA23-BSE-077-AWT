import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

// ── Async Thunks ──────────────────────────────────────────────────────────────

export const fetchLectures = createAsyncThunk(
  'lectures/fetchAll',
  async (search = '', { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/lectures${search ? `?search=${search}` : ''}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchLectureBySlug = createAsyncThunk(
  'lectures/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/lectures/${slug}`);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createLecture = createAsyncThunk(
  'lectures/create',
  async (lectureData, { rejectWithValue }) => {
    try {
      const { data } = await API.post('/lectures', lectureData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateLecture = createAsyncThunk(
  'lectures/update',
  async ({ id, ...lectureData }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/lectures/id/${id}`, lectureData);
      return data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteLecture = createAsyncThunk(
  'lectures/delete',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/lectures/id/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const lectureSlice = createSlice({
  name: 'lectures',
  initialState: {
    lectures: [],
    currentLecture: null,
    loading: false,
    lectureLoading: false,
    error: null,
    searchQuery: '',
  },
  reducers: {
    setSearchQuery(state, action) {
      state.searchQuery = action.payload;
    },
    clearCurrentLecture(state) {
      state.currentLecture = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchLectures
    builder
      .addCase(fetchLectures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLectures.fulfilled, (state, action) => {
        state.loading = false;
        state.lectures = action.payload;
      })
      .addCase(fetchLectures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchLectureBySlug
    builder
      .addCase(fetchLectureBySlug.pending, (state) => {
        state.lectureLoading = true;
        state.error = null;
      })
      .addCase(fetchLectureBySlug.fulfilled, (state, action) => {
        state.lectureLoading = false;
        state.currentLecture = action.payload;
      })
      .addCase(fetchLectureBySlug.rejected, (state, action) => {
        state.lectureLoading = false;
        state.error = action.payload;
      });

    // createLecture
    builder.addCase(createLecture.fulfilled, (state, action) => {
      state.lectures.push(action.payload);
    });

    // updateLecture
    builder.addCase(updateLecture.fulfilled, (state, action) => {
      const idx = state.lectures.findIndex((l) => l._id === action.payload._id);
      if (idx !== -1) state.lectures[idx] = action.payload;
      if (state.currentLecture?._id === action.payload._id) {
        state.currentLecture = action.payload;
      }
    });

    // deleteLecture
    builder.addCase(deleteLecture.fulfilled, (state, action) => {
      state.lectures = state.lectures.filter((l) => l._id !== action.payload);
    });
  },
});

export const { setSearchQuery, clearCurrentLecture, clearError } = lectureSlice.actions;
export default lectureSlice.reducer;
