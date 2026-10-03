{
  "name": "myioi-vote-collect",
  "private": true,
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev --workspace apps/api\" \"npm run dev --workspace apps/web\"",
    "build": "npm run build --workspace apps/web",
    "lint": "npm run lint --workspace apps/web"
  },
  "devDependencies": {
    "concurrently": "^9.0.1"
  }
}
