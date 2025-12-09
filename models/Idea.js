import mongoose from "mongoose";

const ideaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
    },
    title: {
      type: String,
      reqired: true,
      trim: true,
    },
    summary: {
      type: String,
      reqired: true,
      trim: true,
    },
    description: {
      type: String,
      reqired: true,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Idea = mongoose.model("idea", ideaSchema);

export default Idea;
