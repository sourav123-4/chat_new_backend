import { Router } from "express";
import { generateToken, initiateCall, signalCall } from "../controllers/call.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/token", auth, generateToken);
router.post("/initiate", auth, initiateCall);
router.post("/signal", auth, signalCall);

export default router;
