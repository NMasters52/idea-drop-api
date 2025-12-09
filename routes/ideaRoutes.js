import express from "express";
const router = express.Router();
import Idea from "../models/Idea.js";
import mongoose from "mongoose";
import { proctect } from "../middleware/authMiddleware.js";

// @route               GET /api/ideas
// @description         Get all ideas
// @access              PUBLIC
// @query               _limit (optional limit for ideas returned)
router.get("/", async (req, res, next) => {
  try {
    const limit = parseInt(req.query._limit);
    const query = Idea.find().sort({ createdAt: -1 });

    if (!isNaN(limit)) {
      query.limit(limit);
    }

    const ideas = await query.exec();
    res.json(ideas);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// @route               GET /api/ideas
// @description         Get single ideas
// @access              PUBLIC
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    // check if the id exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not Found");
    }
    const idea = await Idea.findById(id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea Not Found");
    }
    res.json(idea);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// @route               POST /api/ideas
// @description         Create new idea
// @access              Public
router.post("/", proctect, async (req, res) => {
  try {
    const { title, summary, description, tags } = req.body || {};

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400); // bad request
      throw new Error("Title, Summary, and Description are required"); // this gets thrown to  middleware/errorHandler.js
    }

    const newIdea = new Idea({
      title,
      summary,
      description,
      tags:
        typeof tags === "string"
          ? tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : Array.isArray(tags)
          ? tags
          : [],
    });

    const savedIdea = await newIdea.save();
    res.status(201).json(savedIdea);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// @route               Delete /api/ideas/:id
// @description         Delete single ideas
// @access              PUBLIC
router.delete("/:id", proctect, async (req, res, next) => {
  try {
    const { id } = req.params;
    // check if the id exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not Found");
    }
    const idea = await Idea.findByIdAndDelete(id);
    if (!idea) {
      res.status(404);
      throw new Error("Idea Not Found");
    }
    res.json({ message: "Idea Deleted Successfully" });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// @route               PUT /api/ideas/:id
// @description         Update Data
// @access              PUBLIC

router.put("/:id", proctect, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    const { title, summary, description, tags } = req.body || {};

    if (!title?.trim() || !summary?.trim() || !description?.trim()) {
      res.status(400); // bad request
      throw new Error("Title, Summary, and Description are required"); // this gets thrown to  middleware/errorHandler.js
    }

    const updatedIdea = await Idea.findByIdAndUpdate(
      id,
      {
        title,
        summary,
        description,
        tags: Array.isArray(tags) ? tags : tags.split(",").map((t) => t.trim()),
      },
      { new: true, runValidators: true }
    );

    if (!updatedIdea) {
      res.status(404);
      throw new Error("Idea Not Found");
    }

    res.json(updatedIdea);
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export default router;
