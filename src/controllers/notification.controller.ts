import { Request, Response } from "express";
import admin from "../config/firebase";

export const sendPushNotification = async ({
  deviceToken,
  title,
  body,
  data = {},
}: {
  deviceToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}) => {
  try {
    await admin.messaging().send({
      token: deviceToken,
      notification: { title, body },
      data: { click_action: "FLUTTER_NOTIFICATION_CLICK", ...data },
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default", badge: 1 } } },
    });
  } catch (error) {
    console.error("Push notification error:", error);
  }
};
