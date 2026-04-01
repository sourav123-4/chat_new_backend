import { Router } from "express";
import { generateToken, initiateCall } from "../controllers/call.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/token", auth, generateToken);
router.post("/initiate", auth, initiateCall);

export default router;
