const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

const VIDEO_FILE_ID = process.env.VIDEO_FILE_ID;
const APK_FILE_ID = process.env.APK_FILE_ID;
const VOICE_FILE_ID = process.env.VOICE_FILE_ID;

const MESSAGE_TEXT =
  process.env.MESSAGE_TEXT ||
  "🎉 Welcome! Your access is confirmed.";

const CHANNEL_LINK =
  process.env.CHANNEL_LINK ||
  "https://t.me/+fUppjhiC3b05Y2Nl";

async function telegram(method, body) {
  const response = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await response.json();

  console.log(`Telegram ${method}:`, JSON.stringify(data));

  return data;
}

async function sendWelcome(chatId) {
  console.log("Sending files to:", chatId);

  await telegram("sendMessage", {
    chat_id: chatId,
    text: MESSAGE_TEXT,
  });

  if (VIDEO_FILE_ID) {
    await telegram("sendVideo", {
      chat_id: chatId,
      video: VIDEO_FILE_ID,
    });
  }

  if (VOICE_FILE_ID) {
    await telegram("sendVoice", {
      chat_id: chatId,
      voice: VOICE_FILE_ID,
    });
  }

  if (APK_FILE_ID) {
    await telegram("sendDocument", {
      chat_id: chatId,
      document: APK_FILE_ID,
      caption: "📦 APK File",
    });
  }
}

async function checkMembership(userId) {
  return await telegram("getChatMember", {
    chat_id: CHANNEL_ID,
    user_id: userId,
  });
}

async function handleStart(chatId, userId) {
  const membership = await checkMembership(userId);

  console.log(
    "Membership:",
    JSON.stringify(membership)
  );

  if (!membership.ok) {
    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        "⚠️ Membership check failed.\n\n" +
        "Please join the channel and try /start again.",
    });

    return;
  }

  const status = membership.result.status;

  const joined =
    status === "member" ||
    status === "administrator" ||
    status === "creator";

  if (!joined) {
    await telegram("sendMessage", {
      chat_id: chatId,
      text:
        "👋 Welcome!\n\n" +
        "1️⃣ Join our main channel:\n" +
        CHANNEL_LINK +
        "\n\n" +
        "2️⃣ Wait until your join request is approved.\n\n" +
        "3️⃣ Then send /start again.",
    });

    return;
  }

  await sendWelcome(chatId);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Telegram bot is running");
  }

  if (!BOT_TOKEN) {
    return res.status(500).send("BOT_TOKEN is missing");
  }

  if (!CHANNEL_ID) {
    return res.status(500).send("CHANNEL_ID is missing");
  }

  try {
    const update = req.body || {};

    console.log(
      "Telegram update:",
      JSON.stringify(update)
    );

    // /start
    if (update.message?.text?.startsWith("/start")) {
      const chatId = update.message.chat.id;
      const userId = update.message.from.id;

      await handleStart(chatId, userId);
    }

    // Channel membership update
    if (
      update.chat_member &&
      update.chat_member.chat &&
      update.chat_member.new_chat_member
    ) {
      const memberUpdate = update.chat_member;

      const joinedUser =
        memberUpdate.new_chat_member.user;

      const newStatus =
        memberUpdate.new_chat_member.status;

      const oldStatus =
        memberUpdate.old_chat_member?.status;

      const isOurChannel =
        String(memberUpdate.chat.id) ===
        String(CHANNEL_ID);

      const memberStatuses = [
        "member",
        "administrator",
        "creator",
      ];

      const becameMember =
        isOurChannel &&
        memberStatuses.includes(newStatus) &&
        !memberStatuses.includes(oldStatus);

      if (
        becameMember &&
        joinedUser &&
        !joinedUser.is_bot
      ) {
        console.log(
          "NEW MEMBER:",
          joinedUser.id
        );

        await sendWelcome(joinedUser.id);
      }
    }

    return res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook error:", error);

    return res.status(500).send("Webhook error");
  }
}