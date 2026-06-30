# The Black Book India — Registration Form

**India's Premier Creative Directory**  
A 7-step registration form for creative professionals. Submissions are stored in a Google Sheet and trigger an email notification. No database or server required.

---

## Project Structure

```
saby-code/
├── index.html                      # The registration form (7-step multi-page)
├── styles.css                      # Dark/gold design system
├── script.js                       # Form logic, validation, submission
└── BlackBookIndia AppsScript.js    # Google Apps Script backend
```

---

## How to Deploy

### Step 1 — Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet.
2. Name it **"Black Book India — Submissions"**.
3. Copy the **Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/ >>> THIS PART <<< /edit
   ```

---

### Step 2 — Set Up the Apps Script Backend

1. From your Google Sheet, go to **Extensions → Apps Script**.
2. Delete any existing code in the editor.
3. Copy the entire contents of `BlackBookIndia AppsScript.js` and paste it in.
4. At the top of the script, update these two lines:
   ```js
   var SHEET_ID = 'PASTE_YOUR_SHEET_ID_HERE'; // ← your Sheet ID from Step 1
   var NOTIFY_EMAIL = 'your@email.com';        // ← where you want submission alerts
   ```
5. **Run the setup function once:**
   - In the function dropdown (top toolbar), select `setupSheet`
   - Click **Run** and grant any permissions it requests
   - This creates the `Submissions`, `Review Dashboard`, and `Stats` tabs automatically

---

### Step 3 — Deploy as a Web App

1. Click **Deploy → New Deployment**
2. Click the gear icon next to **Type** and select **Web App**
3. Set:
   - **Execute as:** `Me`
   - **Who has access:** `Anyone`
4. Click **Deploy** and copy the **Web App URL**.

---

### Step 4 — Wire Up the Form

Open `script.js` and replace line 3:

```js
// BEFORE:
const APPS_SCRIPT_URL = 'YOUR_WEB_APP_URL_HERE';

// AFTER:
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_ACTUAL_ID/exec';
```

---

### Step 5 — Deploy the Frontend

**GitHub Pages (recommended — free)**
1. Push this folder to a GitHub repository
2. Go to repo **Settings → Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Your form is live at `https://yourusername.github.io/repo-name/`

> `BlackBookIndia AppsScript.js` is for the GAS editor only — it does not need to be served publicly, but keep it in the repo for version control.

---

## Review Workflow (Google Sheets)

Every submission appears as a new row in the **Submissions** tab.

| Column | Purpose |
|--------|---------|
| **A** | Timestamp |
| **B** | Submission ID (e.g. `BB-2026-00001`) |
| **C** | **Status** — update this to manage the review pipeline |

**Status values:**
- 🟡 `Pending Review` — default for all new submissions
- 🟢 `Approved` — profile cleared for publication
- 🔴 `Rejected` — does not meet the standard
- 🔵 `Follow-up` — more information needed

Colours update automatically via the `onEdit` trigger in the Apps Script.

---

## Email Notifications

Every submission sends an alert to `NOTIFY_EMAIL` with name, profession, city, email, and a direct Sheet link.

To disable: set `SEND_EMAIL_NOTIFICATIONS = false;` in the Apps Script.

---

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Backend:** Google Apps Script (serverless, free)
- **Database:** Google Sheets
- **Fonts:** Outfit (Google Fonts)
- **Icons:** Font Awesome 6
