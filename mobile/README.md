# ShopNG mobile (Expo / React Native)

Mobile client for the ShopNG web app in the parent directory. It talks to the web app's JSON API
(`/api/products`, `/api/orders`, `/api/mobile/auth`), so the web app must be deployed first.

## Run in development
    cp .env.example .env   # set EXPO_PUBLIC_API_URL to your deployed (or LAN) web app URL
    npm install --legacy-peer-deps
    npx expo start

## Build an APK
1. Deploy the web app (with the new `src/app/api/**` routes) and note its URL.
2. Put that URL in `eas.json` → `build.apk.env.EXPO_PUBLIC_API_URL`.
3. `npx eas-cli login && npx eas-cli build -p android --profile apk`
   EAS prints a download link for the .apk when the build finishes.

Google sign-in uses the web app's existing OAuth client — no new Google credentials needed.
