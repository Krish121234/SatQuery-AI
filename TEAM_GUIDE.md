# Team Guide — SatQuery AI

Read this before you touch anything. It covers Git, the project setup, Colab, and the workflow we're following for the next 10 days. If something breaks and it's not covered here, ask in the group chat before you panic and start deleting things.

---

## 1. One-time setup (do this first, only once)

### 1.1 Install Git
- **Windows:** download from [git-scm.com](https://git-scm.com), install with default options.
- **Mac:** open Terminal, type `git --version` — it'll prompt you to install if missing.
- **Linux:** `sudo apt install git`

Then set your identity (one time only):
```bash
git config --global user.name "Your Name"
git config --global user.email "your.github.email@example.com"
```

### 1.2 Get access to the repo
You should have received a GitHub collaborator invite — accept it via email or your GitHub notifications. If you haven't received one, ping the repo owner.

### 1.3 Clone the repo
Pick a folder on your computer where you keep projects, open a terminal there, and run:
```bash
git clone https://github.com/<owner-username>/satquery-ai.git
cd satquery-ai
```
This downloads the whole project to your machine.

### 1.4 Set up your Python environment
```bash
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```
Every time you open a new terminal to work on this project, run `source venv/bin/activate` (or the Windows equivalent) again before running any Python code — this activates the isolated environment so packages don't conflict with other projects on your machine.

### 1.5 Set up the API key (only needed for Members 3 & 5)
We're using **one shared team key** rather than everyone generating their own — only the language layer (Member 3) and backend (Member 5) actually call the Gemini API directly, so this stays simple.

1. Get the key privately from the repo owner (DM, not group chat).
2. In the project folder, copy the template: `cp .env.example .env`
3. Open `.env` in a text editor, paste the key in:
   ```
   GEMINI_API_KEY=the_shared_key_here
   ```
4. **Never commit this file.** It's already in `.gitignore`. Run `git status` after this and confirm `.env` does NOT appear — if it does, stop and ask before doing anything else.

If you're not on the language layer or backend, you don't need this step at all.

---

## 2. Project structure — where does my work go?

```
satquery-ai/
├── grounding/          ← Member 1: segmentation/detection model, Colab notebooks
├── data/                ← Member 2: RSVQA + Bhuvan dataset curation
├── language_layer/      ← Member 3: prompt templates, Gemini API calls
├── backend/              ← Member 5: FastAPI orchestration
├── frontend/              ← Member 4: chat UI, image upload, overlays
└── docs/                  ← Member 6: SRS plan, API contract, PPT source
```

Work inside **your own folder**. If your work needs to call into someone else's folder (e.g. backend calling the grounding pipeline), check `docs/api_contract.md` first for the agreed data shape — don't invent your own format without updating that doc and telling the team.

---

## 3. Git workflow — how we avoid stepping on each other

**Never work directly on `main`.** `main` should always be in a working, demo-able state. Everyone works on their own branch.

### 3.1 Before you start work each day
```bash
git checkout main
git pull
```
This makes sure you're starting from the latest version before branching off.

### 3.2 Create your branch (once, or per feature)
```bash
git checkout -b feature/your-name-thing
```
Example: `feature/grounding-pipeline`, `feature/chat-ui`, `feature/prompt-templates`

### 3.3 Save your work as you go
```bash
git add .
git status                          # check what's about to be committed — make sure it's not junk
git commit -m "short description of what you did"
```
Commit often — small, frequent commits are easier to fix than one giant one at the end.

### 3.4 Push your branch
```bash
git push -u origin feature/your-name-thing
```
(The `-u` is only needed the first time you push that branch; after that, just `git push`.)

### 3.5 Open a Pull Request (PR)
Go to the GitHub repo in your browser — it'll usually show a banner offering to open a PR from your just-pushed branch. Click it, add a short description of what you changed, and submit. Someone else on the team (or you, if it's a small isolated change) merges it into `main` once it looks good.

### 3.6 Keep your branch updated
If `main` has moved on while you were working, merge the latest changes into your branch before opening a PR:
```bash
git checkout main
git pull
git checkout feature/your-name-thing
git merge main
```
If this causes a **merge conflict** (Git will tell you clearly, showing `<<<<<<<` markers in the affected files), open the file, manually decide which version of the conflicting lines to keep, delete the `<<<<<<<`/`=======`/`>>>>>>>` markers, save, then:
```bash
git add .
git commit -m "resolve merge conflict"
git push
```
If you're not sure how to resolve a conflict, don't guess — ask in the group chat with a screenshot.

---

## 4. Common Git issues & fixes

| Problem | Fix |
|---|---|
| `git push` says "rejected — non-fast-forward" | Someone else pushed changes you don't have. Run `git pull` first, resolve any conflicts, then push again. |
| Accidentally committed `.env` or another secret | Tell the team immediately — don't just delete it and re-commit, the secret is still in Git history. We'll walk through removing it properly and rotating the key. |
| "fatal: not a git repository" | You're not inside the project folder. `cd` into `satquery-ai` first. |
| Forgot to `git pull` before making changes, now conflicts everywhere | Don't panic. `git status` shows what's conflicting. Resolve file by file, or ask for help before force-pushing anything. |
| Accidentally committed to `main` directly | Let the team know — we can usually move the commit onto a proper branch without losing work. |
| `git status` shows a huge list of unrelated file changes | You're probably not inside a virtual environment, or `node_modules`/`venv` aren't being ignored properly. Check `.gitignore` before committing anything. |

**Golden rule:** if you're not sure what a Git command will do, don't run it on `main` and don't use `--force` anything without asking first. Almost every Git mistake is fixable if we catch it early.

---

## 5. Using Google Colab (for ML-side work)

Colab is a free, browser-based Python notebook with free GPU access — this is where grounding/model work happens, since it needs more compute than a laptop comfortably gives.

1. Go to [colab.research.google.com](https://colab.research.google.com), sign in with Google, click "New notebook."
2. Turn on free GPU: **Runtime → Change runtime type → T4 GPU → Save**.
3. Code goes in "cells" — write code, press `Shift+Enter` to run it, output appears below.
4. Install packages inside a cell with `!pip install package-name` (the `!` runs it as a terminal command).
5. Notebooks auto-save to your Google Drive. Share via **File → Share**, same as a Google Doc.
6. **Colab sessions disconnect** after inactivity or ~12 hours max, and anything not saved to Drive or downloaded is lost. Save important outputs (like grounding JSON results) regularly.
7. Once your code works reliably in Colab, **move the final version into the actual `grounding/` folder in the repo** — Colab is for experimenting, GitHub is for the real project that gets graded.

### Using your API key in Colab safely
Don't paste your key directly into a code cell (it can leak if you share the notebook). Use Colab's Secrets manager:
1. Click the 🔑 key icon in the left sidebar → Add new secret.
2. Name it `GEMINI_API_KEY`, paste your key, toggle notebook access on.
3. In code:
   ```python
   from google.colab import userdata
   api_key = userdata.get('GEMINI_API_KEY')
   ```

---

## 6. Daily workflow checklist

1. `git checkout main && git pull` — start from the latest version
2. `git checkout your-branch` (or create a new one if starting fresh work)
3. Do your work
4. Commit often, in small chunks, with clear messages
5. Push your branch
6. Quick check-in with the team (what you did, what's blocked, anything that changes `docs/api_contract.md`)
7. Open a PR once your piece is working, even partially — better to merge early and often than to have one giant unreviewed change at the end

---

## 7. Who to ask

| Problem area | Ask |
|---|---|
| Git issues, repo structure | Whoever set up the repo |
| Grounding pipeline / Colab | Member 1 |
| Dataset questions | Member 2 |
| Prompt/API/language layer | Member 3 |
| Frontend/UI | Member 4 |
| Backend/API contract | Member 5 |
| PPT, demo script, docs | Member 6 |

If you're stuck for more than 15–20 minutes on something that isn't your core area, ask before burning more time — with 10 days total, getting unblocked fast matters more than figuring it out solo.

---

*See `docs/SatQuery_AI_SRS_Execution_Plan.md` for the full architecture and day-by-day plan, and `docs/api_contract.md` for the exact data shapes passed between components.*
