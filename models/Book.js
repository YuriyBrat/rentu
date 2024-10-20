import mongoose from "mongoose";

const Book = mongoose.Schema(
  {
    name: String,
    age:Number
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Book || mongoose.model("Book", Book);