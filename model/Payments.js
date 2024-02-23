import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    productId: {
        type:  mongoose.Types.ObjectId,
        required: [true, " product id reqired"],
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, "user id required"],
    },
},
    {
        timestamps: true,
    }
);

export const Payment = mongoose.model("Payment", paymentSchema);
