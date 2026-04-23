/**
 * API client for StudyPoints backend.
 * All user-related endpoints under /api/v1/users.
 * Proxied via Next.js rewrites to the Express backend.
 */

const BASE = "/api/v1/users";
const BASE_UPLOAD = "/api/v1/upload";
const BASE_SESSIONS = "/api/v1/sessions";
const BASE_POINTS = "/api/v1/points";
const BASE_GAMIFICATION = "/api/v1";
const BASE_REWARDS = "/api/v1/rewards";

// ── Types ──────────────────────────────────────────────

export interface ApiUser {
  id: number;
  name: string;
  phone: string;
  email: string;
}

export interface SignupResponse {
  user: ApiUser;
  accessToken: string;
}

export interface LoginResponse {
  user: ApiUser;
  accessToken: string;
}

export interface ProfileResponse {
  id: number;
  name: string;
  phone: string;
  email: string;
  points: number;
  daily_streak: number;
  current_streak: number;
  longest_streak: number;
  plan: "free" | "premium";
  level: string | null;
  goal: string | null;
  daily_time_commitment: string | null;
}

export interface OnboardingResponse {
  message: string;
  awarded_points: number;
}

export interface MessageResponse {
  message: string;
}

export interface UploadResponse {
  message: string;
  document_url: string;
  quiz_id?: number;
  quiz_data?: AssessmentQuestion[];
}

export interface ApiSession {
  id: number;
  user_id: number;
  title: string;
  subject: string;
  document_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiMessage {
  id: number;
  session_id: number;
  role: "user" | "ai";
  content: string;
  created_at: string;
}

export interface CreateSessionResponse {
  message: string;
  session_id: number;
}

export interface ListSessionsResponse {
  sessions: ApiSession[];
}

export interface ListSessionMessagesResponse {
  messages: ApiMessage[];
}

export interface SendSessionMessageResponse {
  message: string;
  ai_reply: string;
}

export interface ApiPointHistoryItem {
  id: number;
  user_id: number;
  type: "quiz" | "exam" | "streak" | "login" | "onboarding" | "study" | "redemption";
  label: string;
  amount: number;
  created_at: string;
}

export interface PointsHistoryResponse {
  history: ApiPointHistoryItem[];
}

export interface LeaderboardUser {
  id: number;
  name: string;
  points: number;
  plan: "free" | "premium";
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
}

export interface CheckStreakResponse {
  streak: number;
  longest_streak: number;
  updated: boolean;
}

export interface AssessmentQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface GenerateAssessmentResponse {
  quiz_id?: number;
  quiz_data?: AssessmentQuestion[];
  exam_id?: number;
  exam_data?: AssessmentQuestion[];
}

export interface ApiQuiz {
  id: number;
  user_id: number;
  session_id: number | null;
  score: number;
  total_questions: number;
  created_at: string;
  quiz_data?: AssessmentQuestion[];
}

export interface ListQuizzesResponse {
  quizzes: ApiQuiz[];
}

export interface GetQuizResponse {
  quiz: ApiQuiz;
}

export interface SubmitAssessmentResponse {
  message: string;
  quiz_id?: number;
  exam_id?: number;
  awarded_points: number;
  streak?: number;
  longest_streak?: number;
  streak_milestone?: {
    badge: string;
    points: number;
  } | null;
}

export interface RedeemRewardResponse {
  message: string;
  redeemed_points: number;
}

// ── Error helper ───────────────────────────────────────

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) {
    const detail = typeof data.detail === "string" ? ` (${data.detail})` : "";
    throw new ApiError(res.status, (data.message || "Something went wrong") + detail);
  }
  return data as T;
}

// ── Auth header helper ─────────────────────────────────

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

// ── Endpoints ──────────────────────────────────────────

/**
 * POST /api/v1/users/signup
 * Body: { name, phone, email, password }
 */
export async function apiSignup(
  name: string,
  phone: string,
  email: string,
  password: string,
): Promise<SignupResponse> {
  const res = await fetch(`${BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone, email, password }),
  });
  return handleResponse<SignupResponse>(res);
}

/**
 * POST /api/v1/users/login
 * Body: { email, password }
 */
export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<LoginResponse>(res);
}

/**
 * POST /api/v1/users/logout
 * Requires Bearer token
 */
export async function apiLogout(token: string): Promise<MessageResponse> {
  const res = await fetch(`${BASE}/logout`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse<MessageResponse>(res);
}

/**
 * POST /api/v1/users/profile
 * Requires Bearer token
 */
export async function apiGetProfile(token: string): Promise<ProfileResponse> {
  const res = await fetch(`${BASE}/profile`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse<ProfileResponse>(res);
}

/**
 * POST /api/v1/users/onboarding
 * Body: { level, goal, daily_time_commitment }
 * Requires Bearer token
 */
export async function apiUpdateOnboarding(
  token: string,
  level: string,
  goal: string,
  dailyTimeCommitment: string,
): Promise<OnboardingResponse> {
  const res = await fetch(`${BASE}/onboarding`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ level, goal, daily_time_commitment: dailyTimeCommitment }),
  });
  return handleResponse<OnboardingResponse>(res);
}

/**
 * POST /api/v1/users/plan
 * Upgrades user to premium
 * Requires Bearer token
 */
export async function apiUpgradePlan(token: string, plan: string): Promise<MessageResponse> {
  const res = await fetch(`${BASE}/plan`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ plan }),
  });
  return handleResponse<MessageResponse>(res);
}

/**
 * POST /api/v1/upload
 * Body: { document_url }
 * Requires Bearer token
 */
export async function apiUploadDocument(
  token: string,
  file: File,
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_UPLOAD}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  return handleResponse<UploadResponse>(res);
}

/**
 * POST /api/v1/sessions/create
 * Body: { title, subject, document_url }
 * Requires Bearer token
 */
export async function apiCreateSession(
  token: string,
  title: string,
  subject: string,
  documentUrl?: string,
): Promise<CreateSessionResponse> {
  const res = await fetch(`${BASE_SESSIONS}/create`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ title, subject, document_url: documentUrl }),
  });
  return handleResponse<CreateSessionResponse>(res);
}

/**
 * POST /api/v1/sessions/list
 * Requires Bearer token
 */
export async function apiListSessions(token: string): Promise<ListSessionsResponse> {
  const res = await fetch(`${BASE_SESSIONS}/list`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse<ListSessionsResponse>(res);
}

/**
 * POST /api/v1/sessions/messages/list
 * Body: { session_id }
 * Requires Bearer token
 */
export async function apiListSessionMessages(
  token: string,
  sessionId: number,
): Promise<ListSessionMessagesResponse> {
  const res = await fetch(`${BASE_SESSIONS}/messages/list`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ session_id: sessionId }),
  });
  return handleResponse<ListSessionMessagesResponse>(res);
}

/**
 * POST /api/v1/sessions/messages/send
 * Body: { session_id, content }
 * Requires Bearer token
 */
export async function apiSendSessionMessage(
  token: string,
  sessionId: number,
  content: string,
): Promise<SendSessionMessageResponse> {
  const res = await fetch(`${BASE_SESSIONS}/messages/send`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ session_id: sessionId, content }),
  });
  return handleResponse<SendSessionMessageResponse>(res);
}

/**
 * POST /api/v1/sessions/delete
 * Body: { session_id }
 * Requires Bearer token
 */
export async function apiDeleteSession(
  token: string,
  sessionId: number,
): Promise<MessageResponse> {
  const res = await fetch(`${BASE_SESSIONS}/delete`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ session_id: sessionId }),
  });
  return handleResponse<MessageResponse>(res);
}

export async function apiUpdateSessionDocument(
  token: string,
  sessionId: number,
  documentUrl: string,
): Promise<MessageResponse> {
  const res = await fetch(`${BASE_SESSIONS}/update-doc`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ session_id: sessionId, document_url: documentUrl }),
  });
  return handleResponse<MessageResponse>(res);
}

/**
 * POST /api/v1/points/add
 * Body: { type, label, amount }
 * Requires Bearer token
 */
export async function apiAddPoints(
  token: string,
  type: string,
  label: string,
  amount: number,
): Promise<MessageResponse> {
  const res = await fetch(`${BASE_POINTS}/add`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ type, label, amount }),
  });
  return handleResponse<MessageResponse>(res);
}

/**
 * POST /api/v1/points/history
 * Requires Bearer token
 */
export async function apiGetPointsHistory(token: string): Promise<PointsHistoryResponse> {
  const res = await fetch(`${BASE_POINTS}/history`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse<PointsHistoryResponse>(res);
}

/**
 * POST /api/v1/leaderboard
 * Requires Bearer token
 */
export async function apiGetLeaderboard(token: string): Promise<LeaderboardResponse> {
  const res = await fetch(`${BASE_GAMIFICATION}/leaderboard`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse<LeaderboardResponse>(res);
}

/**
 * POST /api/v1/streak/check
 * Requires Bearer token
 */
export async function apiCheckStreak(token: string): Promise<CheckStreakResponse> {
  const res = await fetch(`${BASE_GAMIFICATION}/streak/check`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse<CheckStreakResponse>(res);
}

/**
 * POST /api/v1/quiz/generate
 * Requires Bearer token
 */
export async function apiGenerateQuiz(token: string, topic?: string, sessionId?: number): Promise<GenerateAssessmentResponse> {
  const res = await fetch(`${BASE_GAMIFICATION}/quiz/generate`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ topic, session_id: sessionId }),
  });
  return handleResponse<GenerateAssessmentResponse>(res);
}

/**
 * POST /api/v1/quiz/submit
 * Requires Bearer token
 */
export async function apiSubmitQuiz(
  token: string,
  quizId: number,
  score: number,
  totalQuestions: number
): Promise<SubmitAssessmentResponse> {
  const res = await fetch(`${BASE_GAMIFICATION}/quiz/submit`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ quiz_id: quizId, score, total_questions: totalQuestions }),
  });
  return handleResponse<SubmitAssessmentResponse>(res);
}

export async function apiGetQuizzes(token: string): Promise<ListQuizzesResponse> {
  const res = await fetch(`${BASE_GAMIFICATION}/quiz/list`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse<ListQuizzesResponse>(res);
}

export async function apiGetQuiz(token: string, id: number): Promise<GetQuizResponse> {
  const res = await fetch(`${BASE_GAMIFICATION}/quiz/${id}`, {
    method: "POST",
    headers: authHeaders(token),
  });
  return handleResponse<GetQuizResponse>(res);
}

/**
 * POST /api/v1/exam/generate
 * Requires Bearer token
 */
export async function apiGenerateExam(token: string, topic?: string, sessionId?: number, examData?: AssessmentQuestion[]): Promise<GenerateAssessmentResponse> {
  const res = await fetch(`${BASE_GAMIFICATION}/exam/generate`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ topic, session_id: sessionId, exam_data: examData }),
  });
  return handleResponse<GenerateAssessmentResponse>(res);
}

/**
 * POST /api/v1/exam/submit
 * Requires Bearer token
 */
export async function apiSubmitExam(
  token: string,
  sessionId: number | null,
  examData: AssessmentQuestion[],
  score: number,
  totalQuestions: number
): Promise<SubmitAssessmentResponse> {
  const res = await fetch(`${BASE_GAMIFICATION}/exam/submit`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ session_id: sessionId, exam_data: examData, score, total_questions: totalQuestions }),
  });
  return handleResponse<SubmitAssessmentResponse>(res);
}

/**
 * POST /api/v1/rewards/redeem
 * Body: { points, label }
 * Requires Bearer token
 */
export async function apiRedeemReward(
  token: string,
  points: number,
  label: string,
): Promise<RedeemRewardResponse> {
  const res = await fetch(`${BASE_REWARDS}/redeem`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ points, label }),
  });
  return handleResponse<RedeemRewardResponse>(res);
}
