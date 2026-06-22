// Pratik Tarifler Admin — TypeScript tip tanımları

export interface Recipe {
  id: string;
  title: string;
  description: string;
  language: string;
  cuisine: string;
  meal_type: string[];
  difficulty: "easy" | "medium" | "hard";
  diet_tags: string[];
  total_time_min: number;
  active_time_min: number;
  servings: number;
  is_premium: boolean;
  rating_avg: number;
  rating_count: number;
  ingredients: Ingredient[];
  steps: Step[];
  tips: string[];
  image: RecipeImage;
  image_status: "pending" | "processing" | "ready" | "failed";
  primary_ingredients: string[];
  ingredient_tokens: string[];
  created_at: number;
  updated_at: number;
  published: boolean;
}

export interface Ingredient {
  token: string;
  amount: string;
  note?: string;
}

export interface Step {
  order: number;
  title: string;
  body: string;
  timer_sec?: number;
}

export interface RecipeImage {
  url_full?: string;
  url_thumb?: string;
  blur_hash?: string;
  source?: "unsplash" | "pexels" | "pixabay" | "dalle" | "flux" | "manual";
  source_id?: string;
  photographer?: string;
  photographer_url?: string;
  license?: string;
  score?: number;
  requires_review?: boolean;
}

export interface User {
  uid: string;
  email: string;
  display_name?: string;
  photo_url?: string;
  language: string;
  created_at: number;
  last_active: number;
  subscription: Subscription;
  favorites_count: number;
  scan_count_today: number;
  total_scans: number;
  banned: boolean;
  ban_reason?: string;
}

export interface Subscription {
  status: "free" | "trial" | "active" | "cancelled" | "expired";
  plan: "monthly" | "yearly" | null;
  expires_at?: number;
  trial_ends_at?: number;
  revenuecat_subscriber_id?: string;
  granted_by_admin?: string;
}

export interface PushCampaign {
  id: string;
  title: string;
  title_localized: Record<string, string>;
  body: string;
  body_localized: Record<string, string>;
  image_url?: string;
  deep_link?: string;
  segment: PushSegment;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
  scheduled_at?: number;
  sent_at?: number;
  recipients_count: number;
  delivered_count: number;
  opened_count: number;
  created_by: string;
  created_at: number;
}

export interface PushSegment {
  type: "all" | "premium" | "free" | "language" | "country" | "custom";
  languages?: string[];
  countries?: string[];
  custom_query?: string;
}

export interface Announcement {
  id: string;
  type: "tip" | "announcement" | "promo" | "update";
  title: string;
  title_localized: Record<string, string>;
  body: string;
  body_localized: Record<string, string>;
  image_url?: string;
  action_label?: string;
  action_link?: string;
  display_locations: ("home_banner" | "explore_card" | "modal")[];
  start_date: number;
  end_date?: number;
  priority: number;
  audience: "all" | "premium" | "free";
  published: boolean;
  views: number;
  clicks: number;
  created_at: number;
}

export interface SupportTicket {
  id: string;
  user_uid: string;
  user_email: string;
  user_name?: string;
  subject: string;
  body: string;
  category: "bug" | "feature_request" | "billing" | "account" | "content" | "other";
  status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assigned_to?: string;
  messages: SupportMessage[];
  attachments: string[];
  app_version?: string;
  device_info?: string;
  created_at: number;
  updated_at: number;
  resolved_at?: number;
}

export interface SupportMessage {
  from: "user" | "admin";
  author_uid: string;
  author_name: string;
  body: string;
  attachments: string[];
  timestamp: number;
}

export interface RemoteConfigItem {
  key: string;
  type: "boolean" | "string" | "number" | "json";
  default_value: string;
  variants: RemoteConfigVariant[];
  description?: string;
  updated_at: number;
  updated_by: string;
}

export interface RemoteConfigVariant {
  name: string;
  value: string;
  conditions: {
    language?: string[];
    country?: string[];
    app_version_min?: string;
    user_segment?: "all" | "premium" | "free";
    percentage?: number;
  };
}

export interface ImageJob {
  id: string;
  recipe_id: string;
  status: "queued" | "searching" | "generating" | "processing" | "ready" | "failed";
  attempts: ImageAttempt[];
  current_image_url?: string;
  requires_review: boolean;
  approved: boolean;
  approved_by?: string;
  created_at: number;
  updated_at: number;
}

export interface ImageAttempt {
  source: string;
  query: string;
  result_url?: string;
  score?: number;
  error?: string;
  timestamp: number;
}

export interface AnalyticsKpi {
  // Acquisition
  total_users: number;
  new_users_today: number;
  new_users_7d: number;
  new_users_30d: number;

  // Engagement
  dau: number;
  wau: number;
  mau: number;
  avg_session_duration: number;
  sessions_per_user: number;

  // Monetization
  mrr: number;
  total_subscribers: number;
  new_subscribers_30d: number;
  trial_to_paid: number;
  churn_rate: number;
  arpu: number;

  // Content
  total_recipes: number;
  recipes_with_images: number;
  avg_recipe_rating: number;

  // Health
  crash_free_rate: number;
  avg_api_response_ms: number;
}
