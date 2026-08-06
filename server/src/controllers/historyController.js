import { z } from "zod";
import {
  deleteStudyTopic,
  getChatHistory,
  getStudyTopic,
  listStudyTopics,
} from "../services/historyService.js";

const emailSchema = z.string().trim().email().max(254);

export async function listTopics(req, res, next) {
  try {
    const userEmail = emailSchema.parse(req.query.userEmail);
    const topics = await listStudyTopics(userEmail);
    res.json({ topics });
  } catch (error) {
    next(error);
  }
}

export async function readTopic(req, res, next) {
  try {
    const userEmail = emailSchema.parse(req.query.userEmail);
    const topicId = z.string().trim().min(1).parse(req.params.topicId);
    const topic = await getStudyTopic({ topicId, userEmail });

    if (!topic) return res.status(404).json({ message: "Study topic not found." });
    return res.json({ topic });
  } catch (error) {
    return next(error);
  }
}

export async function removeTopic(req, res, next) {
  try {
    const userEmail = emailSchema.parse(req.query.userEmail);
    const topicId = z.string().trim().min(1).parse(req.params.topicId);
    const removed = await deleteStudyTopic({ topicId, userEmail });

    if (!removed) return res.status(404).json({ message: "Study topic not found." });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
}

export async function readChatHistory(req, res, next) {
  try {
    const userEmail = emailSchema.parse(req.query.userEmail);
    const messages = await getChatHistory(userEmail);
    res.json({ messages });
  } catch (error) {
    next(error);
  }
}
