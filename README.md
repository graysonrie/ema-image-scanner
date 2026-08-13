# EMA Image Scanner

Made for my Coworker Ben at EMA primarily for scanning mechanical equipment, which is why the released app is called "Ben's Image Scanner".

Moreover, this is a desktop app for reading equipment photos with OpenAI vision. Use it to pull structured fields from nameplates on demand, or batch-process project image sets and export files renamed with suggested identifiers (unit tags, serials, model numbers, etc.).

You need a valid [OpenAI API key](https://platform.openai.com/account/api-keys) before anything will evaluate.

<img width="900" height="700" alt="image (1)" src="https://github.com/user-attachments/assets/bbd9825a-321f-4e9e-bc12-026d58be3211" />

---

## Getting started

1. Launch the app (install from a release, or run it locally with Tauri).
2. On the home screen under **App Settings**, paste your OpenAI API key.
3. Optionally open **Prompt Settings** to customize the global analysis prompt and determinism used by **Projects** (on-demand mode uses templates instead).

From home you can either open **On Demand Images** for quick one-off extraction, or create/open a **Project** for batch work.

---

## On Demand Images

Best for quick field extraction into a paste-ready text block (for example into another program).

### 1. Create a template

1. From home, click **On Demand Images**.
2. Click **+** to create a template (or pick an existing one from the dropdown).
3. Name the template and add fields (e.g. `Tag`, `Make`, `Model #`).
4. Mark fields optional when they may be missing; add a short description when you need a specific format (e.g. `Voltage/Phase`).
5. Click **Save**.

Templates define both what to extract and the exact `FieldName: value` output format.

### 2. Manage templates (optional)

Open the gear icon next to the template list to:

- Reorder or delete templates
- **Export** all templates to a JSON file
- **Load** templates from a previously exported JSON file

### 3. Drop images and evaluate

1. Drag one or more images onto the drop zone.
2. By default, evaluation starts as soon as images are dropped.
3. Check **Wait for manual evaluation** if you want to stage images first, then click **Evaluate**.
4. Results appear under **Program Output** as plain text lines matching your template fields.
5. Enable **Automatically copy to system clipboard** (on by default after first use) to paste results immediately elsewhere.
6. Use **Clear all images** when you have multiple images loaded and want to start over.

Missing required fields come back as `Unknown`. Missing optional fields are omitted.

---

## Projects

Best for larger sets of equipment photos where you want suggested filename suffixes and bulk export.

### 1. Create or open a project

1. On the home screen, click **New Project** and give it a name or click an existing project to open it.
2. Projects can be archived or deleted from the project list menu. Archived projects can be restored later.

### 2. Add and organize images

1. Click **Add Images** and select photo files.
2. Use the sidebar to select images (multi-select supported for moves).
3. Create folders in the sidebar, then use **Move** to group images into folders.
4. Click a folder to focus it; folder-scoped evaluate actions become available while focused.

### 3. Evaluate images

Open the **Evaluate** menu:

| Action                  | What it does                                                                |
| ----------------------- | --------------------------------------------------------------------------- |
| **Evaluate This Image** | Runs analysis on the currently selected image                               |
| **Evaluate New Images** | Evaluates only images that do not have results yet                          |
| **Reevaluate All**      | Re-runs every image and overwrites existing results (uses more API credits) |

When a folder is focused, the menu switches to folder-scoped **Evaluate New** / **Reevaluate All** variants.

Each successful evaluation stores:

- A short **brief description** of what was seen
- An optional **filepath suffix** derived from identifiers in the photo (e.g. `_UNIT_123`)

Tune the global prompt under home **Prompt Settings** if your equipment labels or naming conventions differ from the defaults.

### 4. Export renamed copies

Once images have evaluations:

1. Open **Export**.
2. Choose **Export all** (flat output folder) or **Export by folders** (preserves your project folder structure).
3. Pick a destination directory.
4. The app copies each evaluated image into that directory, appending the suggested suffix to the original filename (e.g. `photo.jpg` → `photo_UNIT_123.jpg`).

Images without a usable suffix are still exported using the original stem. Name collisions get a numeric disambiguator (`_2`, `_3`, …).

---

## Tech stack & architecture

**Stack:** Tauri (Rust) desktop shell, Next.js (static export) + React frontend, Zustand for UI state, Tauri Store for persisted settings/templates/API key, shadcn/ui + Lucide, OpenAI vision (`gpt-4.1-mini` by default) via the local `ocr_image_thing` crate.

**Architecture (high level):**

- **Frontend (`app/`, `components/`)** - Home, project workspace, and on-demand screens. Talks to the backend through Tauri commands.
- **Tauri backend (`src-tauri/`)** - Project/file management, image import/export, folders, clipboard helpers, and on-demand evaluation commands.
- **Vision client (`src-tauri/ocr_image_thing/`)** - Encodes images and calls OpenAI; project mode expects JSON (`filepath_suffix` + `brief_description`), on-demand mode returns template-shaped plain text.
- **Persistence** - Project media and evaluations live under the OS app data directory; settings and templates use the Tauri Store plugin. Auto-updates pull from GitHub Releases when available.
