import Razorpay from "razorpay";
import dotenv from "dotenv";
dotenv.config();

export const PLANS = {
  monthly: {
    amount: 19900,      
    label: "Pro Monthly",
    durationDays: 30,
    videoLimit: 5,
    chatLimit: 15,
  },
  yearly: {
    amount: 99900,        
    label: "Pro Yearly",
    durationDays: 365,
    videoLimit: 30,
    chatLimit: 35,
  },
};

export const FREE_LIMITS = {
  videoLimit: 1,
  chatLimit: 3,
};

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
