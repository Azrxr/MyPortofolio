# Portfolio V5

Hello everyone\! 👋

Let me introduce myself, I'm **Eki Zulfar Rachman**. On this occasion, I'd like to share the portfolio website project that I've developed.

## 🚀 Live Demo

**Website Link:** [https://www.eki.my.id/](https://www.eki.my.id/)

## 🛠️ Tech Stack

This project is built using modern web technologies:

- **ReactJS** - Frontend framework
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Backend for portfolio data, certificates, and comment system
- **AOS** - Animate On Scroll library
- **Framer Motion** - Animation library
- **Lucide** - Icon library
- **Material UI** - React component library
- **SweetAlert2** - Beautiful alert dialogs

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (version 14.x or higher)
- **npm** or **yarn** package manager

## 🏃‍♂️ Getting Started

Follow these steps to run the project locally:

### 1\. Clone the Repository

```bash
git clone https://github.com/EkiZR/Portofolio_V5.git
cd Portofolio_V5
```

### 2\. Install Dependencies

```bash
npm install
```

If you encounter peer dependency issues, use:

```bash
npm install --legacy-peer-deps
```

### 3\. Run the Development Server

```bash
npm run dev
```

### 4\. Open in Browser

Access the application through the link displayed in your terminal (usually `http://localhost:5173`).

## 🏗️ Building for Production

To create a production-ready build:

1.  Run the build command:

    ```bash
    npm run build
    ```

2.  The build files will be saved in the `dist` folder. Upload this folder to your hosting server.

## ⚙️ Configuration (Firebase)

All backend data for this project (portfolio, certificates, and comments) is managed by Firebase.

### 1\. Create Firebase Project

- Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
- Enable Firestore Database and Storage for your project.
- Keep your Firebase config handy. You can find it in **Project Settings > General > Your apps > Web app config**.

### 2\. Setup Firestore Collections

Create the following collections in your Firestore Database:

#### `projects` collection

Documents should have fields:

- `title` (string)
- `description` (string)
- `img` (string - image URL)
- `link` (string - live demo URL)
- `github` (string - GitHub repo URL)
- `features` (array of strings)
- `techStack` (array of strings)
- `pin` (boolean - for pinned projects)
- `createdAt` (timestamp)

#### `certificates` collection

Documents should have fields:

- `img` (string - certificate image URL)
- `createdAt` (timestamp)

#### `tech_stack` collection

Documents should have fields:

- `title` (string)
- `img` (string - tech stack icon URL)

#### `portfolio_comments` collection

Documents should have fields:

- `content` (string)
- `userName` (string)
- `profileImage` (string - optional profile image URL)
- `isPinned` (boolean)
- `createdAt` (timestamp)

### 3\. Setup Firebase Storage

Create a storage bucket and set up the following folder structure:

- `profile-images/` - For user profile images in comments

## 🔧 Environment Variables Setup

Create a file named `.env` in the root of your project and add your Firebase credentials.

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

**Important:**

- All environment variables must be prefixed with `VITE_` for Vite to access them.
- Restart your development server after creating or modifying the `.env` file.
- **Never** commit your `.env` file to version control. Ensure it's listed in your `.gitignore` file.

### Configuration File (`firebase/firebase.js`)

Ensure your Firebase client configuration file uses these environment variables.

## 🚨 Troubleshooting

If you encounter issues while running the project:

- Ensure Node.js is correctly installed.
- Verify you're in the correct project directory.
- Check that all dependencies are installed without errors.
- Make sure your Firebase configuration in the `.env` file is correct and the server has been restarted.
- Clear your browser cache and try again.

## 📝 Usage & Credits

We would appreciate it if you decide to use this project. Please include proper credit when using it. Thank you\! 🙏

## 📞 Contact

If you have any questions or need help with the setup, feel free to reach out\!

**Eki Zulfar Rachman**

- Website: [https://www.eki.my.id/](https://www.eki.my.id/)
- GitHub: [EkiZR](https://github.com/EkiZR)

---

⭐ If this project helped you, please consider giving it a star on GitHub\!
