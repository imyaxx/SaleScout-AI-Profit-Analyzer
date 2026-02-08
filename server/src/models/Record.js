import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema(
  {
    productUrl: {
      type: String,
      required: true,
      trim: true
    },
    productHost: {
      type: String,
      required: true
    },
    productPath: {
      type: String,
      required: true
    },
    shopName: {
      type: String,
      required: true,
      trim: true
    },
    leaderPrice: {
      type: Number,
      required: true
    },
    myPrice: {
      type: Number,
      required: true
    },
    offers: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        rating: { type: Number, required: false, default: null },
        reviewCount: { type: Number, required: false, default: null }
      }
    ],
    position: {
      type: Number,
      required: false
    }
  },
  { timestamps: true }
);

export default mongoose.model('Record', recordSchema);
