import { Router } from "express";
import {
  listTopics,
  readChatHistory,
  readTopic,
  removeTopic,
} from "../controllers/historyController.js";

const router = Router();

router.get("/topics", listTopics);
router.get("/topics/:topicId", readTopic);
router.delete("/topics/:topicId", removeTopic);
router.get("/chat", readChatHistory);

export default router;
