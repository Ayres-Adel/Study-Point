# StudyPoints - Backend Architecture & Suggested DB Models

Based on the frontend analysis of the gamified learning / EdTech application, here are the suggested database tables and backend endpoints to support the current feature set.

## Core Idea Summary
The application is a gamified learning platform where students can:
- **Study & Chat**: Upload educational PDFs or select subjects to start a study session with an AI chat assistant.
- **Test Knowledge**: Take quizzes and final exams based on the study materials.
- **Earn Points**: Get rewarded with points for activities like daily logins, studying, completing quizzes, and maintaining a streak.
- **Redeem Rewards**: Convert earned points into tangible rewards (specifically "Mobilis data", targeting Algerian users).
- **Gamification**: The app features a daily points cap, study streaks, and a leaderboard.

---

## Suggested Database Schema (Tables)

### 1. `users`
Stores user profile, authentication, and overall gamification state.
- `id` (UUID, Primary Key)
- `name` (String)
- `phone` (String, Unique)
- `level` (String) - e.g., High School, University
- `goal` (String) - Goal set during onboarding
- `daily_time_commitment` (String) - Time commitment set during onboarding
- `plan` (Enum: `free`, `premium`) - Default `free`
- `points` (Integer) - Current available balance
- `streak` (Integer) - Current daily login streak
- `last_login_date` (Date) - Used to track streaks and daily cap resets
- `created_at` (Timestamp)

### 2. `sessions`
Represents a study session created from either an uploaded PDF or a selected topic.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `title` (String) - e.g., "Math Study Session" or "FileName"
- `subject` (String) - e.g., "Math", "Physics"
- `document_url` (String, Nullable) - Link to uploaded PDF in cloud storage (S3/Cloudinary)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### 3. `messages`
Stores the chat history between the user and the AI within a study session.
- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key -> `sessions.id`)
- `role` (Enum: `user`, `ai`)
- `content` (Text)
- `created_at` (Timestamp)

### 4. `point_histories`
Ledger of all points earned or spent to maintain an accurate wallet history.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `type` (Enum: `quiz`, `exam`, `streak`, `login`, `onboarding`, `study`, `redemption`)
- `label` (String) - e.g., "Daily login bonus"
- `amount` (Integer) - Positive for earned, negative for redeemed
- `created_at` (Timestamp)

### 5. `quizzes`
Stores generated quizzes and user scores.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `session_id` (UUID, Nullable, Foreign Key -> `sessions.id`)
- `quiz_data` (JSON) - Stores the structured quiz JSON (questions, options, correct answers).
- `score` (Integer)
- `total_questions` (Integer)
- `created_at` (Timestamp)

### 6. `exams`
Stores final exams and user scores.
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key -> `users.id`)
- `session_id` (UUID, Nullable, Foreign Key -> `sessions.id`)
- `exam_data` (JSON) - Stores the structured exam JSON.
- `score` (Integer)
- `total_questions` (Integer)
- `created_at` (Timestamp)

---

## Suggested REST Endpoints

### Auth & User Profile
- **`POST /api/v1/users/signup`**: Register a new user.
- **`POST /api/v1/users/login`**: Authenticate returning a JWT and profile.
- **`POST /api/v1/users/logout`**: Terminate the current session.
- **`POST /api/v1/users/profile`**: Fetch current user state (points, streak, plan, daily points earned).
- **`POST /api/v1/users/onboarding`**: Update user profile with level, goal, and daily time commitment. Awards onboarding points.
- **`POST /api/v1/users/plan`**: Upgrade to premium plan.

### Study Sessions & Materials
- **`POST /api/v1/upload`**: Upload a PDF document. Returns the document URL or extracted text.
- **`POST /api/v1/sessions/create`**: Create a new session with a title, subject, and optional document URL.
- **`POST /api/v1/sessions/list`**: List recent sessions for the dashboard.
- **`POST /api/v1/sessions/messages/list`**: Fetch chat history for a specific session (passing session_id in body).
- **`POST /api/v1/sessions/messages/send`**: Send a message to the AI. The backend processes the message (RAG on the PDF or prompt on the topic) and returns the AI's reply. 

### Gamification & Points
- **`POST /api/v1/points/add`**: Add points for actions (study, quiz completion). Backend must validate against the `dailyCap` limit to prevent abuse.
- **`POST /api/v1/points/history`**: Get wallet earning history.
- **`POST /api/v1/leaderboard`**: Fetch top users based on total points or current streak.
- **`POST /api/v1/streak/check`**: Check and increment daily login streak upon first session of the day.

### Quizzes & Exams
- **`POST /api/v1/quiz/generate`**: Generate a quiz array of questions dynamically based on a session's subject or PDF content using AI.
- **`POST /api/v1/quiz/submit`**: Submit quiz results to store score and automatically calculate/award points.
- **`POST /api/v1/exam/generate`**: Generate final exam (longer/harder than a standard quiz).
- **`POST /api/v1/exam/submit`**: Submit exam results.

### Rewards (Wallet)
- **`POST /api/v1/rewards/redeem`**: Redeem current points for Mobilis data. Validates if user has enough points, deducts balance, and triggers top-up API.
