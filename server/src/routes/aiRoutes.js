import { Router } from "express";
import { createChatReply, createFlashcards, createStudyPack } from "../controllers/aiController.js";

const router = Router();
router.post("/study-pack", createStudyPack);
router.post("/chat", createChatReply);
router.post("/flashcards", createFlashcards);

export default router;
