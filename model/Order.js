import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
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

export const Order = mongoose.model("Order", orderSchema);
