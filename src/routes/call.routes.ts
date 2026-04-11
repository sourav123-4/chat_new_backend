import { Router } from "express";
import { generateToken, initiateCall, signalCall, webrtcSignal } from "../controllers/call.controller";
import { auth } from "../middlewares/auth.middleware";

const router = Router();

router.post("/token", auth, generateToken);
router.post("/initiate", auth, initiateCall);
router.post("/signal", auth, signalCall);
router.post("/webrtc-signal", auth, webrtcSignal);

export default router;
