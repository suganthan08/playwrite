import fs from "fs";
import path from "path";
import readline from "readline";
import { google } from "googleapis";
import { fileURLToPath } from "url";

// ✅ Fix for ESM: define __dirname and __filename manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Paths for credentials & token
const CREDENTIALS_PATH = path.join(__dirname, "credentials.json");
const TOKEN_PATH = path.join(__dirname, "token.json");

async function authorizeGmail() {
  try {
    // 🔹 Load client credentials
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf-8"));
    const { client_secret, client_id, redirect_uris } = credentials.installed;

    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

    // 🔹 Generate auth URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.readonly"],
    });
    console.log("👉 Authorize this app by visiting this URL:\n", authUrl);

    // 🔹 Ask user to paste auth code
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Paste the authorization code here: ", async (code) => {
      const tokenResponse = await oAuth2Client.getToken(code);
      oAuth2Client.setCredentials(tokenResponse.tokens);

      // 🔹 Save token for later use
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenResponse.tokens, null, 2));
      console.log(`✅ Token saved successfully to ${TOKEN_PATH}`);
      rl.close();
    });
  } catch (err) {
    console.error("❌ Error in Gmail auth:", err);
  }
}

authorizeGmail();
