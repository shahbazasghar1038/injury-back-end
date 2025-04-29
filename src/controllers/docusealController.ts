import { Request, Response } from "express";
import jwt from "jsonwebtoken";

export const getDocusealToken = (req: Request, res: Response): void => {
  const payload = {
    user_email: "mahtabnadeem1994+test@gmail.com",
    integration_email: "signer@example.com",
    external_id: "TestForm123",
    name: "Integration W-9 Test Form",
    document_urls: ["https://www.irs.gov/pub/irs-pdf/fw9.pdf"],
  };

  const secretKey = process.env.DOCUSEAL_SECRET;
  if (!secretKey) {
    res.status(500).json({ error: "DocuSeal secret not configured." });
    return;
  }

  try {
    const token = jwt.sign(payload, secretKey);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Failed to generate token" });
  }
};
