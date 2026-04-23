<div style="position:relative; width:100%; height:0px; padding-bottom:95.238%"><iframe allow="fullscreen" allowfullscreen height="100%" src="https://streamable.com/e/uf2ehw?" width="100%" style="border:none; width:100%; height:100%; position:absolute; left:0px; top:0px; overflow:hidden;"></iframe></div>

# 🎓 Study-Point (StudyGenie)

Study-Point is an advanced, AI-powered educational platform designed to enhance the learning experience. By leveraging artificial intelligence (Google Gemini) and Natural Language Processing (NLP), Study-Point allows users to upload documents (PDFs) and automatically generates insights, summaries, and study materials. The platform features a stunning, modern user interface with 3D interactive elements and data visualization.

## ✨ Key Features

- **🧠 AI-Powered Insights:** Integrates with the Google Gemini API to analyze study materials and provide intelligent summaries.
- **📄 PDF Processing:** Seamlessly upload and parse PDF documents for text extraction and NLP processing.
- **💬 Interactive AI Tutor:** Real-time chat assistance during study sessions to answer questions about your materials.
- **🎮 Gamified Learning:** Stay motivated with daily streaks, climb the competitive leaderboard, earn points, and unlock rewards through a fully gamified educational experience.
- **📝 Automated Assessments:** Generate custom quizzes and assessments based directly on your uploaded study materials.
- **🚀 Immersive 3D UI:** Interactive 3D environments and backgrounds built with React Three Fiber, featuring custom animations and transition effects.
- **🔐 Secure Authentication:** Full user authentication system with JWT and Bcrypt for secure access.
- **💎 Tiered Membership:** Flexible subscription plans (Weekly, Monthly, Yearly) to unlock premium features and higher limits.
- **💰 Smart Rewards Wallet:** Track your earned points and see their real-world value (e.g., potential internet data) in a dedicated wallet interface.
- **📊 Progress Tracking:** Visualize learning progress and data with Recharts.
- **🗄️ Relational Database:** Robust data management using MySQL.

---

## 🎨 Visual Experience

Study-Point isn't just a study tool; it's a visual experience. The platform features:
- **3D Interactive Backgrounds:** Experience dynamic scenes like the "Graduation Caps" background that reacts to your progress.
- **Smooth Page Transitions:** Seamless navigation powered by Framer Motion.
- **Gamified Feedback:** Instant visual feedback with the Points Toast and Streak Milestone modals when you achieve your goals.
- **Modern Dark/Light Themes:** Fully responsive design that looks great in any mode.

---

## 📖 How It Works (Application Flow)

1. **User Onboarding:** Users sign up securely and log into their personalized dashboard.
2. **Material Upload:** Users upload their study documents (like PDFs). The backend handles the upload and extracts the text for Natural Language Processing (NLP).
3. **AI Generation:** The extracted text is sent to the **Google Gemini AI**, which analyzes the content to generate concise study notes, summaries, and customized quizzes/assessments.
4. **Active Study Sessions:** Users can start dedicated study sessions where they review materials, take generated assessments, and **chat with an AI Tutor** in real-time to clarify complex topics.
5. **Gamification & Community:** As users complete study sessions and pass assessments, they earn points, maintain daily streaks, unlock rewards, and compete with peers on the global leaderboard.
6. **Membership Tiers:** Users can choose between free and premium plans to increase their upload limits, access advanced AI models, and unlock exclusive rewards.
7. **Data Visualization:** All learning progress, points, and session statistics are visualized on the dashboard using interactive charts and a stunning 3D interface.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router) & [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/) (Shadcn UI inspired)
- **3D Graphics:** [Three.js](https://threejs.org/) & [React Three Fiber / Drei](https://docs.pmnd.rs/react-three-fiber/getting-started/introduction)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms & Validation:** [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Charts:** [Recharts](https://recharts.org/)

### Backend
- **Runtime:** [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database:** [MySQL](https://www.mysql.com/) (via `mysql2`)
- **AI & NLP:** `@google/genai` (Gemini API) & `natural` (NLP library)
- **File Handling:** `multer` & `pdf-parse`
- **Security:** `bcrypt` & `jsonwebtoken` (JWT)

---

## System Entity Mapping

<div align="center">
<br />
<a href="https://ibb.co/Kz5Js08n"><img src="https://i.ibb.co/7NSqpY0h/image.png" alt="image" border="0"></a><br /><a target='_blank' href='https://usefulwebtool.com/fr/clavier-russe'></a><br />
</div>

### Model-to-Database Mapping
<br />
<div align="center">
<a href="https://ibb.co/k63V8R3p"><img src="https://i.ibb.co/jZV9McVd/image.png" alt="image" border="0"></a><br />
</div>


---

## Model-to-Database Mapping

To navigate the codebase, it is essential to understand how natural language concepts map to specific code entities and files.

### Concept to Code Mapping

<div align="center">
<a href="https://imgbb.com/"><img src="https://i.ibb.co/mCVnjZnm/image.png" alt="image" border="0"></a>
</div>

---
## 🚀 Live Demo

The application is fully hosted online! You can view and interact with the platform directly without any local setup.

**🌐 Live Website:** [Study-Point on Vercel](study-point-by-breakfast.vercel.app) 

---

## 📂 Project Structure

```text
Study-Point/
├── backend/                  # Express.js API
│   ├── Controllers/          # Route logic and business rules
│   ├── Routes/               # API endpoint definitions
│   ├── models/               # Database interactions
│   ├── middleware/           # Auth and file upload middlewares
│   ├── lib/                  # Helper functions and utilities
│   ├── uploads/              # Temporary storage for uploaded PDFs
│   ├── schemas.sql           # Database schema definitions
│   ├── db.js                 # Database connection setup
│   └── app.js                # Main Express application entry point
│
└── frontend/                 # Next.js Application
    ├── src/                  # Source code (Components, Pages, etc.)
    ├── public/               # Static assets (Images, Icons, 3D Models)
    ├── package.json          # Frontend dependencies
    └── next.config.ts        # Next.js configuration
```

---

---

## 🛠 API Overview

The backend is organized into modular routes for scalability:

- **`/api/users`**: Handles registration, login, and profile management.
- **`/api/upload`**: Manages PDF uploads and text extraction.
- **`/api/assessments`**: Generates and retrieves AI-powered quizzes.
- **`/api/sessions`**: Tracks active study time and session history.
- **`/api/gamification`**: Manages user streaks, levels, and achievements.
- **`/api/points`**: Handles XP/Points logic and leaderboard data.
- **`/api/rewards`**: Manages unlockable rewards and store items.

---

---

## 🚀 Future Roadmap

We are constantly working to improve Study-Point. Here is what's coming next:
- [ ] **Mobile App:** A dedicated React Native app for on-the-go learning.
- [ ] **Collaborative Study Rooms:** Study with friends in real-time.
- [ ] **Flashcard Export:** Export your generated flashcards to Anki or Quizlet.
- [ ] **More File Formats:** Support for `.docx`, `.txt`, and even image-based notes (OCR).
- [ ] **AI Tutor Bot:** A chat interface to ask questions about your study materials in real-time.
- [ ] **ISP Partnerships (Mobilis, Djezzy, Ooredoo):** Launching direct point-to-data redemption, allowing students to earn actual internet volume by completing study goals.

---

## 🛠️ Built With

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=threedotjs&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white)

---

##🎤 Presentation

Want a full overview of **Study-Point (StudyGenie)**?

You can check the complete presentation here:

👉 **[Study-Point](https://github.com/Ayres-Adel/Study-Point/releases)**

This presentation covers:
- 🚀 The problem and our solution  
- 🧠 AI-powered features and technology  
- 🎮 Gamified learning experience  
- 🏗️ System architecture and tech stack  
- 💰 Business model and future vision  


---


## 🤝 Contributing
Project made by breakfast team :
- [ ] **[Ayres-Adel](https://github.com/Ayres-Adel)**
- [ ] **[BILAL204-ME](https://github.com/BILAL204-ME)**
- [ ] **[lotfi1623](https://github.com/lotfi1623)**
- [ ] **[attalahmohamed72-netizen](https://github.com/attalahmohamed72-netizen)**
- [ ] **[Aybdell](https://github.com/Aybdell)**


Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/yourusername/Study-Point/issues).

---

## 📝 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).

---

## 📜 Dedication
This project is dedicated to:

📚 Every student who has ever felt overwhelmed by endless pages, yet refused to give up on learning.

💡 The curious minds who believe that education should be smarter, more engaging, and driven by innovation.

👨‍👩‍👧‍👦 Our families and friends — for their constant support, patience, and belief in our vision throughout this journey.

🎓 Our mentors and educators — for guiding us, challenging us, and inspiring us to merge technology with education to create meaningful impact.

🤖 The spirit of innovation — pushing us to explore the power of AI and redefine how knowledge is discovered, understood, and retained.

🕌 And above all, to Allah — for granting us the strength, clarity, and perseverance to bring this idea to life.

🙏 Finally, a special thanks to my teammate and partner — whose dedication, creativity, and commitment turned this vision into reality. This project stands as a reflection of our shared effort, late nights, and relentless ambition.

> "Behind every line of code and every idea — there was a light that never faded.💠❤️"
