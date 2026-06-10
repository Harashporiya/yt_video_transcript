import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface PlanLimits {
  videoLimit: number;
  chatLimit: number;
}

export interface PlanStatus {
  plan: "free" | "pro";
  planExpiry: string | null;
  videosUsedThisMonth: number;
  isExpired: boolean;
  limits: PlanLimits;
}

interface PaymentState {
  planStatus: PlanStatus | null;
  loading: boolean;
  error: string | null;
  orderLoading: boolean;
  verifyLoading: boolean;
  successMessage: string | null;
}

const initialState: PaymentState = {
  planStatus: null,
  loading: false,
  error: null,
  orderLoading: false,
  verifyLoading: false,
  successMessage: null,
};


export const fetchPlanStatus = createAsyncThunk(
  "payment/fetchPlanStatus",
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${BACKEND}/api/payment/plan-status`, {
        headers: { Authorization: token },
      });
      return res.data as PlanStatus & { success: boolean };
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch plan status");
    }
  }
);


export const createPaymentOrder = createAsyncThunk(
  "payment/createOrder",
  async ({ token, plan }: { token: string; plan: "monthly" | "yearly" }, { rejectWithValue }) => {
    try {
      const res = await axios.post(
        `${BACKEND}/api/payment/create-order`,
        { plan },
        { headers: { Authorization: token } }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to create order");
    }
  }
);


export const verifyPayment = createAsyncThunk(
  "payment/verifyPayment",
  async (
    {
      token,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }: {
      token: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post(
        `${BACKEND}/api/payment/verify`,
        { razorpay_order_id, razorpay_payment_id, razorpay_signature },
        { headers: { Authorization: token } }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Payment verification failed");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentError(state) {
      state.error = null;
    },
    clearSuccessMessage(state) {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPlanStatus
    builder
      .addCase(fetchPlanStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlanStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.planStatus = {
          plan: action.payload.plan,
          planExpiry: action.payload.planExpiry,
          videosUsedThisMonth: action.payload.videosUsedThisMonth,
          isExpired: action.payload.isExpired,
          limits: action.payload.limits,
        };
      })
      .addCase(fetchPlanStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createPaymentOrder
    builder
      .addCase(createPaymentOrder.pending, (state) => {
        state.orderLoading = true;
        state.error = null;
      })
      .addCase(createPaymentOrder.fulfilled, (state) => {
        state.orderLoading = false;
      })
      .addCase(createPaymentOrder.rejected, (state, action) => {
        state.orderLoading = false;
        state.error = action.payload as string;
      });

    // verifyPayment
    builder
      .addCase(verifyPayment.pending, (state) => {
        state.verifyLoading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.verifyLoading = false;
        state.successMessage = action.payload.message || "Plan activated successfully!";
        state.planStatus = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.verifyLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPaymentError, clearSuccessMessage } = paymentSlice.actions;
export default paymentSlice.reducer;
