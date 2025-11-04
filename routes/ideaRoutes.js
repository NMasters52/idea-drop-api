import express from "express";
const router = express.Router();

// @route               GET /api/ideas
// @description         Get all ideas
// @access              PUBLIC
router.get("/", (req, res) => {
  const ideas = [
    { id: 1, title: "Idea 1", description: "This is Idea 1" },
    { id: 2, title: "Idea 2", description: "This is Idea 2" },
    { id: 3, title: "Idea 3", description: "This is Idea 3" },
  ];

  res.status(400);
  throw new Error("this is a new error");
  res.json(ideas);
});

// @route               POST /api/ideas
// @description         Creat new idea
// @access              Public
router.post("/", (req, res) => {
  const { title, description } = req.body;

  console.log(description);
  res.send(title);
});

export default router;
