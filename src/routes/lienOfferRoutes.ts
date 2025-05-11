import { Router } from "express";
import {
  createLienOffer,
  getAllLienOffers,
} from "../controllers/lienOfferController";

const router = Router();

// Route to create a lien offer
router.post("/create", createLienOffer);

// Route to get all lien offers
router.get("/all", getAllLienOffers);

export default router;
