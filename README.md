# MediBridge

A responsive caregiver demo for reviewing a sample prescription, confirming extracted fields, and tracking a daily medication routine.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite. Use `npm run build` to verify the production build.

## Deploy

Import this repository into Vercel or Netlify as a Vite project. Use `npm run build` as the build command and `dist` as the output directory. No server or environment variables are required for this demo.

## Demo scope

- The prescription and field extraction are deterministic sample data. Camera and gallery controls preview an image locally; live OCR is not connected.
- Required fields must be confirmed by the caregiver before creating a routine. Missing information remains visible and is never filled in automatically.
- Routine times are editable sample defaults; the prototype does not send notifications. Dose statuses are caregiver entries, not proof of ingestion.
- The quick log supports typing and browser voice recognition where available. A dose and status must be selected before saving.
- Changes are stored in this browser's local storage and can be reset from Privacy.
