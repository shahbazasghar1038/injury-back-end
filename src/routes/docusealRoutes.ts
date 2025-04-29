import express from "express";
import { getDocusealToken } from "../controllers/docusealController";

const router = express.Router();

router.get("/token", getDocusealToken);

export default router;
