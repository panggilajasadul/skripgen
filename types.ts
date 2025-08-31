export type View = 'home' | 'generator' | 'history' | 'templates' | 'linkGenerator' | 'hookGenerator' | 'brandProfile' | 'angleGenerator' | 'login' | 'hashtagGenerator' | 'videoGenerator' | 'contentPlanner' | 'admin-dashboard' | 'admin-users' | 'admin-settings' | 'admin-intelligence' | 'marketResearch' | 'imageStudio' | 'loading';

export type AdminView = 'dashboard' | 'users' | 'settings' | 'intelligence';
export type PersonalBrandView = 'profile' | 'insights';


export interface User {
  id: string;
  username: string;
  password?: string; // Only used for local authentication. Not stored in session state.
  // password is now handled by Supabase Auth and should not be stored in the frontend state.
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  expiresAt: string | null; // ISO string date, null for lifetime
  durationDays: number | null; // Duration in days, null for lifetime
  createdAt: string;
  lastLogin: string | null;
  scriptsGenerated: number;
  loginHistory?: { timestamp: string; ip: string }[];
  isSuspicious?: boolean;
  uniqueDeviceCountLast30Days: number;
  directMessage?: {
    id: string;
    title: string;
    message: string;
    link?: string;
    isPermanent: boolean;
  } | null;
}

export interface DashboardAnalytics {
    totalUsers: number;
    activeUsersToday: number;
    scriptsGeneratedTotal: number;
    mostPopularFeature: string;
    featureUsage: { name: string; count: number }[];
    recentActivity: { user: string; action: string, timestamp: string }[];
}

export interface ContentIntelligenceData {
    mostSuccessfulFormula: string;
    mostSuccessfulHookType: string;
    mostSuccessfulTone: string;
    nichePopularity: { name: string; count: number }[];
}


export interface BrandProfile {
  personaType: 'user' | 'brand';
  brandName: string;
  brandDescription: string;
  toneOfVoice: string;
  forbiddenWords: string;
  mainAudience: string;
}

export interface FormData {
  productName: string;
  productAdvantages: string[];
  usp: string;
  audienceProblem: string;
  targetAudience: string;
  scriptGoal: string;
  videoDuration: string;
  copywritingFormula: string;
  hookTypes: string[];
  toneAndStyle: string;
  ctaStyle: string;
  customCTA: string;
  includeVisuals: boolean;
}

export interface LinkFormData {
  productLink: string;
  targetAudience: string;
  contentStyle: string;
  videoDuration: string;
  hookKillers: string[];
  hookFormat: string;
  contentType: string;
}

export interface HookGeneratorFormData {
  product: string;
  benefit: string;
  category: string;
}

export interface AngleGeneratorFormData {
  product: string;
  benefit: string;
  audience: string;
}

export interface HashtagGeneratorFormData {
  productTopic: string;
  audience: string;
}

export interface VideoGeneratorFormData {
  prompt: string;
  image: {
    mimeType: string;
    data: string; // base64 encoded string
  } | null;
  style: string;
  aspectRatio: string;
}

export interface ImageStudioFormData {
  prompt: string;
  image: {
    mimeType: string;
    data: string; // base64 encoded string
  };
}

export interface EditedImageOutput {
    image: {
        mimeType: string;
        data: string; // base64
    } | null;
    text: string | null;
}

export interface ContentPlannerFormData {
    productName: string;
    campaignGoal: string;
    campaignDuration: string;
    targetAudience: string;
    usp: string;
}

export interface MarketResearchFormData {
    niche: string;
}

export interface MarketResearchResult {
    trendingProducts: { name: string; reason: string }[];
    audiencePainPoints: string[];
    popularContentFormats: string[];
    killerHookIdeas: string[];
}


export interface ContentPlanDay {
    day: number;
    theme: string;
    angle: string;
    hookIdea: string;
    cta: string;
}

export interface ContentPlan {
    overallStrategy: string;
    dailyPlan: ContentPlanDay[];
}


export interface HashtagCategory {
  categoryName: string;
  hashtags: string[];
}

export interface ReviewAngle {
  title: string;
  description: string;
  exampleHook: string;
  exampleBody: string;
  exampleCta: string;
}

export interface GeneratedScriptOutput {
    killerTitle: string;
    variations: Script[];
    explanation: string;
    caption: string;
    hashtags: string;
}


export interface LinkScript {
    killerTitle: string;
    hook: string;
    body: string;
    cta: string;
    explanation: string;
    caption: string;
    hashtags: string;
}

export interface ScriptPart {
  partName: string; // e.g., "Hook", "Problem", "Solution", "CTA"
  content: string;
}

export interface PerformanceData {
    views: number;
    likes: number;
    sales: number;
}


export interface Script {
  title: string;
  parts: ScriptPart[];
  feedback?: 'good' | 'bad';
  performance?: PerformanceData;
}

export interface ScriptData {
  id: string;
  user_id?: string; // Foreign key to user
  createdAt: string;
  formData: FormData;
  variations: Script[];
}

export interface Template {
  id: string;
  niche: string;
  title: string;
  description: string;
  formData: Partial<FormData>;
}

export interface Toast {
  id: number;
  message: string;
}

export interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string) => void;
  removeToast: (id: number) => void;
}

// Data to be pre-filled in the generator from the content planner
export type InitialGeneratorData = Partial<FormData>;

export interface Announcement {
  id: string;
  title: string;
  message: string;
}

export interface Quote {
    id: string;
    author: string;
    quote: string;
}

export interface QuoteSettings {
    motivationalEnabled: boolean;
    toughLoveEnabled: boolean;
    toughLoveThreshold: number;
}


export interface VoiceOption {
    id: string;
    name: string;
    description: string;
}

export interface VoiceoverRequest {
    text: string;
    voiceId: string;
}

export interface PersonalInsights {
    topFormula: string;
    topHook: string;
    topTone: string;
}