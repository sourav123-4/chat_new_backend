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
  if (!deviceToken || deviceToken.trim() === "") {
    console.log("[Push] Skipped — no device token");
    return;
  }

  // Ensure all data values are strings
  const stringData: Record<string, string> = {};
  for (const key of Object.keys(data)) {
    stringData[key] = String(data[key]);
  }

  try {
    const result = await admin.messaging().send({
      token: deviceToken,
      data: {
        click_action: "CHATAPP_NOTIFICATION",
        title,
        body,
        ...stringData,
      },
      android: { priority: "high" },
      apns: { payload: { aps: { sound: "default" } } },
    });
    console.log("[Push] Sent successfully:", result);
  } catch (error: any) {
    console.error("[Push] Failed:", error?.errorInfo || error?.message || error);
  }
};
