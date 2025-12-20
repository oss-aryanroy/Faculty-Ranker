<div align="center">
  <img src="faculty-ranker/logo.svg" alt="VIT-AP Faculty Ranker Logo" width="200"/>
  
  # 🎓 VIT-AP Faculty Ranker
  
  ### *Pick Your Faculty Wisely*
  
  [![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-vitap--faculty--ranker.online-4285F4?style=for-the-badge)](https://vitap-faculty-ranker.online)
  [![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  
  <p align="center">
    <strong>A modern, community-driven platform for VIT-AP students to rate and review their faculty members</strong>
  </p>
  
  [View Demo](https://vitap-faculty-ranker.online) · [Report Bug](https://github.com/oss-aryanroy/Faculty-Ranker/issues) · [Request Feature](https://github.com/oss-aryanroy/Faculty-Ranker/issues)
</div>

---

## ✨ Features

<table>
  <tr>
    <td align="center">
      <img src="https://img.icons8.com/fluency/96/000000/search.png" width="60"/>
      <br />
      <strong>Smart Search</strong>
      <br />
      Fuzzy search with Levenshtein distance algorithm
    </td>
    <td align="center">
      <img src="https://img.icons8.com/fluency/96/000000/star.png" width="60"/>
      <br />
      <strong>Multi-Criteria Ratings</strong>
      <br />
      Rate on Attendance, Leniency & Marking
    </td>
    <td align="center">
      <img src="https://img.icons8.com/fluency/96/000000/comments.png" width="60"/>
      <br />
      <strong>Community Comments</strong>
      <br />
      Share experiences with edit/delete support
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://img.icons8.com/fluency/96/000000/google-logo.png" width="60"/>
      <br />
      <strong>Google OAuth</strong>
      <br />
      Secure login with VIT-AP email verification
    </td>
    <td align="center">
      <img src="https://img.icons8.com/fluency/96/000000/sun.png" width="60"/>
      <br />
      <strong>Dark/Light Mode</strong>
      <br />
      Beautiful theme toggle with smooth transitions
    </td>
    <td align="center">
      <img src="https://img.icons8.com/?size=100&id=2754&format=png&color=000000" width="60"/>
      <br />
      <strong>Report System</strong>
      <br />
      Flag incorrect faculty information
    </td>
  </tr>
</table>

---

## 🚀 Tech Stack

### **Frontend**
- **React 18.3** - Modern UI library with hooks
- **React Router DOM** - Client-side routing with URL state management
- **Tailwind CSS** - Utility-first styling with custom color themes
- **Vite** - Lightning-fast build tool and dev server
- **Lucide React** - Beautiful, consistent icon library

### **Authentication**
- **Google OAuth 2.0** - Secure authentication flow
- **JWT Tokens** - Session management with httpOnly cookies

### **State Management**
- **React Context API** - Theme, Auth, and Toast contexts
- **URL Search Params** - Persistent search and pagination state

### **Backend Integration**
- RESTful API endpoints for faculty data, ratings, and comments
- Cookie-based session authentication
- Real-time rating aggregation

---

## 🎨 Design Highlights

<div align="center">
  <img src="https://img.shields.io/badge/Design-Minimalist-000000?style=for-the-badge" />
  <img src="https://img.shields.io/badge/UX-Intuitive-4285F4?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Performance-Optimized-00C853?style=for-the-badge" />
</div>

### 🌓 Theme System
- **Dark Mode**: Sleek black/zinc palette with subtle gradients
- **Light Mode**: Clean white/gray design with high contrast
- Smooth 500ms transitions between themes
- Persistent theme preference in localStorage

### 🎯 User Experience
- **Fuzzy Search**: Intelligent matching with typo tolerance
- **Pagination**: URL-backed page state for shareable links
- **Smooth Scrolling**: Auto-scroll to top on page change
- **Loading States**: Skeleton screens and spinners
- **Toast Notifications**: Non-intrusive success/error feedback

### 📱 Responsive Design
- Mobile-first approach
- Grid layouts that adapt from 1 to 3 columns
- Touch-friendly interactive elements
- Optimized for all screen sizes

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 16+ and npm/yarn
- VIT-AP email account for testing

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=your_backend_api_url
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### Installation Steps

```bash
# Clone the repository
git clone https://github.com/oss-aryanroy/Faculty-Ranker.git
cd vitap-faculty-ranker

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

---

## 📂 Project Structure

Frontend
```
faculty-ranker/
├── public/
│   └── logo.svg                 # Public app logo
│
├── src/
│   ├── assets/                  # Static assets (images, icons, etc.)
│   │
│   ├── helpers/
│   │   └── functions.js         # Shared utility/helper functions
│   │
│   ├── AdminPanel.jsx           # Admin dashboard / moderation panel
│   ├── App.css                  # Global app styles
│   ├── App.jsx                  # Main app router & layout
│   ├── App.test.jsx             # App-level tests
│   ├── AuthContext.jsx          # Authentication context provider
│   ├── faculty.json             # Static faculty seed/mock data
│   ├── FacultyCard.jsx          # Faculty card UI component
│   ├── FacultyListPage.jsx      # Homepage with search & faculty grid
│   ├── FacultyPage.jsx          # Individual faculty detail page
│   ├── GoogleSignIn.jsx         # Google OAuth sign-in button
│   ├── index.css                # Base/global CSS
│   ├── main.jsx                 # Vite app entry point
│   ├── Pagination.jsx           # Pagination component
│   ├── ReportButton.jsx         # Faculty report/flag action button
│   ├── StarRow.jsx              # Star rating display/input component
│   ├── ThemeContext.tsx         # Theme provider & theme switch logic
│   └── Toast.jsx                # Toast notification system
│
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── eslint.config.js             # ESLint configuration
├── index.html                   # Vite HTML entry file
├── package-lock.json            # Dependency lockfile
├── package.json                 # Project dependencies & scripts
├── postcss.config.js            # PostCSS configuration
├── README.md                    # Project documentation
├── tailwind.config.js           # Tailwind CSS configuration
└── vite.config.js               # Vite build & dev server config
```

Backend
```
faculty-ranker-api/
├── helpers/
│   └── functions.js          # Shared helper utilities (auth, validation, etc.)
│
├── models/
│   ├── Comment.js            # Comment schema & model
│   ├── Professor.js          # Faculty/professor schema & model
│   ├── Rating.js             # Rating schema & aggregation logic
│   ├── Report.js             # Abuse/report schema
│   └── User.js               # User schema & auth-related fields
│
├── node_modules/             # Installed dependencies
│
├── routes/
│   └── (various route files) # API route handlers (auth, faculty, comments, etc.)
│
├── .env                      # Environment variables (DB URI, secrets)
├── ingest.js                 # Data ingestion / syncing script
├── package-lock.json         # Dependency lockfile
├── package.json              # Backend dependencies & scripts
└── server.js                 # Express app entry point & server bootstrap
```

---

## 🔑 Key Features Explained

### 🔍 Advanced Search Algorithm
Implements Levenshtein distance calculation for fuzzy matching, allowing students to find faculty even with misspelled names or incomplete information.

```javascript
// Tolerates up to 33% character difference
const threshold = Math.max(1, Math.floor(maxLen / 3));
```

### ⭐ Rating System
Three distinct categories with real-time aggregation:
- **Attendance** - Strictness on attendance policies
- **Leniency** - Flexibility in grading and deadlines
- **Marking** - Fairness in evaluation

Each faculty displays:
- Community average ratings (from all users)
- Individual user's own ratings (editable)
- Overall score calculated from the three categories

### 💬 Comment System
- **Create**: Post experiences and feedback
- **Edit**: Modify your own comments anytime
- **Delete**: Remove comments with confirmation modal
- **Pagination**: Load more comments progressively
- **Timestamps**: Shows creation and edit times

### 🔒 Authentication Flow
1. Click "Sign in with Google"
2. Redirect to Google OAuth consent screen
3. Backend verifies email domain (`@vitap.ac.in`)
4. Session created with httpOnly cookie
5. User data stored in Auth Context

---

## 🎯 API Endpoints Used

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/allFaculty` | Fetch all faculty with ratings |
| `GET` | `/api/faculty/:id` | Get specific faculty details |
| `GET` | `/api/my-rating?facultyId=X` | Fetch user's existing rating |
| `POST` | `/api/faculty/rate` | Submit/update faculty rating |
| `GET` | `/api/comments?facultyId=X&page=Y` | Paginated comments |
| `POST` | `/api/comment` | Create new comment |
| `PUT` | `/api/comment/:id` | Edit existing comment |
| `DELETE` | `/api/comment/:id` | Delete comment |
| `POST` | `/api/report` | Report faculty information issue |
| `POST` | `/auth/google` | Google OAuth login |
| `POST` | `/auth/logout` | Clear session |
| `GET` | `/api/me` | Check current session |

---

## 🌟 Highlights & Achievements

- 🎨 **Dual Theme System**: Carefully crafted dark and light modes with consistent design language
- 🔐 **Secure Authentication**: Email domain verification ensures only VIT-AP students can access
- 🚀 **Optimized Performance**: Lazy loading, memoization, and efficient re-renders
- 📱 **Fully Responsive**: Seamless experience across desktop, tablet, and mobile
- ♿ **Accessible**: Semantic HTML, ARIA labels, and keyboard navigation support
- 🎭 **Smooth Animations**: Micro-interactions and transitions for delightful UX

---

## 📸 Screenshots

<div align="center">
  <img src="https://github.com/user-attachments/assets/e767aa94-d61f-4044-9ecd-8fb8c4347647" alt="Home Page Screenshot" />
  <img src="https://github.com/user-attachments/assets/37f6b49e-4a03-4108-a44a-4fa3a4da236b" alt="Faculty Page Screenshot" />
</div>

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This is a portfolio project created for educational purposes.

---

## 👨‍💻 Author

**Aryan Roy**

- LinkedIn: [Aryan Roy](https://www.linkedin.com/in/aryan-roy-168987252/)
- GitHub: [@ossaryanroy](https://github.com/oss-aryanroy)

---

## 🙏 Acknowledgments

- VIT-AP University for the inspiration
- All contributors and testers
- The amazing React and Tailwind CSS communities

---

<div align="center">
  <p>Made with ❤️ by students, for students</p>
  <p>
    <a href="https://vitap-faculty-ranker.online">🌐 Visit Live Site</a>
  </p>
</div>
