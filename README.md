# Insta

A personal, distraction-free way to use Instagram on iPhone and Android.

Insta opens Instagram's own website inside an app and hides the parts built to waste time:

- **Home feed shows only accounts you follow** (the Following view, newest first)
- **No Reels tab**, and Reels pages send you back home
- **Search without Explore**: you can still find people, but there's no suggested grid
- Suggested posts in the feed are hidden

Everything else works as on instagram.com: stories, DMs, profiles, likes, comments and posting.
You log in with your normal Instagram account. The app never sees or stores your password; Instagram's website handles login as in any browser.

Not affiliated with Instagram or Meta. For personal use only.

## Install

See **[INSTALL.md](INSTALL.md)**. Downloads are on the [latest release](../../releases/latest).

## Change what's hidden

Edit [`src/settings.json`](src/settings.json) and push. GitHub Actions rebuilds both apps (about 15 minutes).

| Setting | Default | What it does |
| --- | --- | --- |
| `followingOnlyFeed` | `true` | Home always opens the Following feed |
| `hideReelsTab` | `true` | Removes the Reels button |
| `blockReelsPage` | `true` | Opening the Reels feed sends you home. Single Reels sent in DMs still open |
| `hideReelsInFeed` | `false` | Also hides Reels posted by people you follow |
| `searchWithoutExplore` | `true` | Search opens straight to the search box, no suggested grid |
| `hideSuggestedPosts` | `true` | Hides "Suggested for you" posts |

## How it's built

- [Capacitor](https://capacitorjs.com/) wraps one web view for iOS and Android.
- `src/focus.js` + `src/focus.css` do all the hiding. `npm run build` turns them into `www/inject.js` (loaded by the app) and `dist/insta.user.js` (a userscript for testing in a browser).
- The app injects the script before each instagram.com page loads:
  - Android: `android/app/src/main/java/io/github/insta/focus/FocusPlugin.java`
  - iOS: `MainViewController` in `ios/App/App/AppDelegate.swift`
- `.github/workflows/build.yml` builds an Android APK and an unsigned iPhone IPA on GitHub's free runners and publishes them as a release.

### Notes

- The Android signing key (`android/app/insta.keystore`, password `insta-public`) is in the repo on purpose so every build installs as an update. That's fine for a personal app; don't reuse it for anything else.
- The iPhone IPA is unsigned. Each person signs it with their own free Apple ID when installing (see INSTALL.md).
- If Instagram changes its website and something reappears, the fix is usually one line in `src/focus.css` or `src/focus.js`.

## Develop locally (optional)

```
npm install
npm run sync        # builds the script and copies it into the iOS and Android projects
npx cap open android
```
