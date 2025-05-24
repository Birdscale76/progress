# Progress

A full-stack drone-powered site progress monitoring web app built with Next.js, TypeScript, React and Tailwind CSS.

## 🚀 Features

- **360° Walkthroughs**  
  Upload 360° images, define hotspots for scene transitions and “issue spots” for annotations.
- **Progress Comparison**  
  Side-by-side image comparison to visualize site progress over time.
- **User Authentication**  
  Sign up, sign in, and protected routes (via Supabase or your choice of auth).
- **Modular Components**  
  Reusable UI components under `/components` and custom hooks under `/lib`/`/utils`.
- **Responsive Design**  
  Fully responsive layouts powered by Tailwind CSS.
- **API Routes**  
  Serverless functions for image uploads and data persistence.

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)  
- **Language:** TypeScript  
- **Styling:** Tailwind CSS, PostCSS  
- **Authentication & Database:** Supabase (or configure your own)  
- **Image Storage:** Local disk or configure S3-compatible bucket  
- **Linting & Formatting:** ESLint, Prettier  

## 📂 Repository Structure

```
/
├── app/                      # Next.js App Router pages & layouts
│   ├── (auth-pages)/         # Sign-in, sign-up, forgot-password
│   ├── protected/            # Auth-protected routes
│   └── page.tsx              # Public landing
├── components/               # Reusable React components
├── lib/                      # Shared libraries (hooks, configs)
├── public/                   # Static assets (images, fonts)
├── utils/                    # Utility functions
├── middleware.ts             # Global middleware (e.g. auth redirects)
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
├── tsconfig.json             # TypeScript configuration
├── .env.example              # Sample environment variables
├── package.json              # Scripts & dependencies
└── README.md                 # ← You are here
```

## 🔧 Getting Started

### Prerequisites

- Node.js ≥ 18  
- npm or Yarn  

### Install

1. **Clone the repo**
   ```bash
   git clone https://github.com/Birdscale76/progress.git
   cd progress
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Configure environment**
   - Copy `.env.example` → `.env.local`
   - Fill in your Supabase (or other) keys, storage bucket URLs, etc.

### Run Locally

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Start

```bash
npm run build
npm start
# or
yarn build && yarn start
```

## 🚢 Deployment

You can deploy on Vercel with zero-config:

1. Push this repo to GitHub.
2. Import the project into Vercel.
3. Point environment variables in your Vercel dashboard.
4. Deploy!

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/YourFeature`.
3. Commit your changes: `git commit -m 'Add YourFeature'`.
4. Push to the branch: `git push origin feature/YourFeature`.
5. Open a Pull Request.

Please ensure all new code is linted (`npm run lint`) and formatted (`npm run format`).

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

> Created with ❤️ by Birdscale76
