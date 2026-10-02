# Receipt to Sheet

**Project status: Complete**

A simple web app that turns receipt images into a table using Gemini. Review or edit the extracted data, then download the current rows as CSV.

## Main features

- Upload multiple receipt images; each image is processed separately.
- Extract merchant, date, total, VAT, and category.
- Edit every value and delete individual rows.
- Export the current rows in that order, including manual edits.
- Arabic and English friendly interface; CSV uses [UTF-8 with a BOM](https://support.microsoft.com/en-us/excel/opening-csv-utf-8-files-correctly-in-excel) for Arabic text in Excel.
- Commas, quotes, and line breaks are escaped in CSV. Formula-like values are prefixed with an apostrophe to treat them as spreadsheet text.
- Data stays in browser memory and is cleared on reload. No database or login.

## Stack

Next.js App Router, React, TypeScript, CSS, and the server-side Gemini API.

## Run locally

Use Node.js 20.9 or newer and npm.

```bash
git clone https://github.com/H-dev0/receipt-to-sheet.git
cd receipt-to-sheet
npm install
```

Create `.env.local` in the project root:

```dotenv
GEMINI_API_KEY=your_gemini_api_key
```

Use a valid Gemini API key from Google AI Studio. The server reads the key; it is never sent to the browser. `.env.local` is ignored by Git and must remain local.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Restart the server after changing the key.

## Checks

```bash
npm run build
npm run lint
npx tsc --noEmit
```

## Limitations

- Use one receipt per image, up to 10 MB each (JPG, PNG, WebP, HEIC/HEIF).
- Images are sent to Gemini for extraction; a valid key and available API quota are required.
- AI can misread receipts. Review the results before exporting; missing fields are left blank.
- Rows and edits are lost when the page is reloaded or closed. Download CSV before leaving.
