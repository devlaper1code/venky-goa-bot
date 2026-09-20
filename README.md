# Telegram Join Bot — Text + Video + Voice + APK

## What it does

User starts the bot → joins the main Telegram channel → Telegram sends a
`chat_member` update → the bot automatically sends:

1. Text
2. Video
3. Voice clip
4. APK

## Important

The user must start the bot first. Telegram bots cannot normally start a
private conversation with a user who has never opened the bot.

The bot must be an administrator of the channel and the webhook must request
`chat_member` updates.

## Vercel Environment Variables

Add these in Vercel:

BOT_TOKEN = BotFather token
CHANNEL_ID = numeric ID of your channel, usually like -1001234567890
CHANNEL_LINK = your channel invite link
MESSAGE_TEXT = text you want to send
VIDEO_FILE_ID = Telegram video file_id
VOICE_FILE_ID = Telegram voice file_id
APK_FILE_ID = Telegram document file_id

Do NOT put BOT_TOKEN in GitHub.

## Files

api/webhook.js
package.json

## Webhook

After deployment, set the Telegram webhook to:

https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=https://YOUR-VERCEL-DOMAIN.vercel.app/api/webhook&allowed_updates=["message","chat_member"]

Replace the placeholders with your real values.

## Getting media file IDs

Send the video, APK and voice clip to your bot (or another chat where you can
retrieve them) and use Telegram's API/update response to obtain their file_id.
Put those file_id values into the Vercel environment variables.

Do not upload the APK, video or voice clip into GitHub unless you have a specific
reason. Telegram file_ids are better for this bot.
