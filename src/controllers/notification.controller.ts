import { Request, Response } from "express";
import admin from "../config/firebase";

export const sendPushNotification = async (req: Request, res: Response) => {
  try {
    const { token, title, body } = req.body;

    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: {
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
    };

    const response = await admin.messaging().send(message);

    return res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      response,
    });
  } catch (error) {
    console.error("Push Error:", error);
    return res.status(500).json({ success: false, error });
  }
};