# 1440.kor.gallery

온라인 전시 서비스. 디자이너와 아티스트가 `이름.kor.gallery` 주소로 자기 전시·포트폴리오 사이트를 만드는 한국어 사이트 빌더입니다.

An online exhibition service. Designers and artists pick a form (template), edit it in the browser, and publish a portfolio site at `name.kor.gallery`. Built and operated by one person.

> **무료 서비스 전환:** 수익성 한계로 2026년 12월 25일부터 무료로 제공할 예정입니다.
> **Free from 2026-12-25:** the service does not earn enough to keep charging for it, so it will become free to use. The paid-pass and payment code in this repository describes the service up to that date.

## What is in this repository

| Part | What it does |
|---|---|
| `index.html`, `templates.html`, `assets/` | The static site: landing page, form picker, in-browser editor. No build step; the files are served as they are. |
| `assets/tpl-gen.js`, `assets/templates.js` | 1,440 distinct forms: 80 hand-made and 1,360 produced by a generator that combines menu position, opening layout, text placement, captions and features. |
| `assets/editor.js` | The editor. Written for people who do not know the web: plain-language names, switches instead of option lists, instant preview, undo. |
| `api/worker.js` | Account server on a Cloudflare Worker: sign-up with an e-mail code, login, publishing sites, uploads to R2, payment approval (NICEPAY), a daily renewal job. Data lives in D1 (`api/schema.sql`). |
| `tools/check-templates.js`, `tools/check-api.mjs` | Checks run before a release: no two forms with the same feature set, no repeated pictures inside a form, and a test run of the account API. |
| `BRAND.md` | Voice and wording rules for every piece of text on the site. |

## Stack

Plain HTML, CSS and JavaScript on the front end. Cloudflare Workers (static assets and API), D1, R2 and cron triggers on the back end. Resend for e-mail. GitHub Actions for deployment.

## Run it locally

```bash
python3 tools/serve.py 8440     # http://localhost:8440
node tools/check-templates.js   # form checks
node tools/check-api.mjs        # API checks, needs Node 22.5 or newer
```

Without the account server the pages fall back to a browser-only preview of accounts (`assets/account.js`), so the front end works on its own.

## Deployment

Two GitHub Actions workflows copy only the files the site needs into `dist/` and deploy them with Wrangler.

- `preview.yml` deploys to a separate preview Worker. It runs on pushes to preview branches and by hand.
- `launch.yml` deploys the live site. It runs only when started by hand.

The account server is deployed separately, see the header of `api/wrangler.jsonc`. Secrets (payment secret key, mail key, Cloudflare token) are stored as Wrangler and GitHub secrets, not in this repository. The payment client key in `api/wrangler.jsonc` is the public browser key.

## Notes

- Sample images and 3D models are free-licence material. Sources are listed in `assets/img/samples/CREDITS.md` and `assets/3d/CREDITS.md`. Fonts keep their own licence files in `assets/fonts/`.
- Everything is written to scale with the screen (`clamp()`, `vw`), and is checked at about 375 px and on wide desktop screens.
- Edit drafts and favourites are saved only in the visitor's browser. Published sites and accounts are saved on the server.
