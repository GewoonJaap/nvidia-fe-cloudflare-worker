# Nvidia FE Notification Setup

If you'd like to use this setup, follow the steps below:

1. **Download the ntfy app** from the following link: [https://ntfy.sh/](https://ntfy.sh/)

2. **Configure the app** with the following settings:
   - **Server Address:** `https://ntfy.mrproper.dev`
   - **Subscribe to one or more of the following topics:**
     - `nvidia-fe` → General Nvidia FE notifications
     - `nvidia-fe-5090` → Notifications for Nvidia 5090 (Nvidia, Coolblue, Bol.com)
     - `nvidia-fe-5080` → Notifications for Nvidia 5080 (Nvidia, Coolblue, Bol.com)

This setup will allow you to receive real-time notifications related to Nvidia FE availability.

## Development

```
npm install
npm run dev
```

```
npm run deploy
```
