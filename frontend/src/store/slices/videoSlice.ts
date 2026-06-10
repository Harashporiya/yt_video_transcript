import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;


export interface Video {
  id: string;
  videoId: string;
  title: string;
  [key: string]: any;
}

interface VideoState {
  videos: Video[];
  isLoading: boolean;
  successMessage: string | null;
}

const initialState: VideoState = {
  videos: [],
  isLoading: true,
  successMessage: null,
};


export const fetchVideos = createAsyncThunk(
  "video/fetchVideos",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BACKEND}/api/users/videos`, {
        headers: { Authorization: token },
      });
      if (res.data.success) return res.data.videos as Video[];
      return rejectWithValue("Failed to fetch videos");
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch videos");
    }
  }
);

const videoSlice = createSlice({
  name: "video",
  initialState,
  reducers: {
    setSuccessMessage(state, action: PayloadAction<string | null>) {
      state.successMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.videos = action.payload;
      })
      .addCase(fetchVideos.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setSuccessMessage } = videoSlice.actions;
export default videoSlice.reducer;
