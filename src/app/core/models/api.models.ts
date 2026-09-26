export interface ApiUserResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiToken {
  access_token: string;
  token_type: string;
  user: ApiUserResponse;
}

export interface ApiScoreFactor {
  signal: string;
  points: number;
}

export interface ApiScoreBreakdown {
  positive_factors: ApiScoreFactor[];
  negative_factors: ApiScoreFactor[];
  explanation: string;
}

export interface ApiActivityResponse {
  id: string;
  lead_id: string;
  lead_public_id?: string | null;
  user_id?: string | null;
  sales_rep_name?: string | null;
  lead_company_name?: string | null;
  activity_type: string;
  description: string;
  activity_date: string;
  activity_metadata?: Record<string, any>;
  score_impact?: number;
  created_at: string;
}

export interface ApiNoteResponse {
  id: string;
  lead_id: string;
  user_id?: string | null;
  author_name?: string | null;
  content: string;
  ai_signals?: string[];
  created_at: string;
  updated_at: string;
}

export interface ApiLeadResponse {
  id: string;
  public_lead_id?: string | null;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string | null;
  industry: string;
  company_size?: string | null;
  location?: string | null;
  contact_role?: string | null;
  lead_source: string;
  estimated_value: number;
  stage: string;
  status: string;
  owner_id?: string | null;
  owner_name?: string | null;
  business_priority_score?: number;
  business_priority_tier?: string;
  business_priority_factors?: string[];
  expected_investment?: number;
  expected_investment_formatted?: string;
  referred_by_id?: string | null;
  ai_score: number;
  conversion_probability: number;
  classification: string;
  engagement_level: string;
  days_in_current_stage: number;
  total_days_in_pipeline: number;
  stagnation_status: string;
  recommended_action?: string | null;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface ApiReferralResponse {
  id: string;
  referrer_customer_id: string;
  referrer_customer_name?: string | null;
  referrer_public_lead_id?: string | null;
  referred_lead_id: string;
  referred_lead_name?: string | null;
  referred_public_lead_id?: string | null;
  referral_date: string;
  status: string;
  reward_type: string;
  reward_value: number;
  reward_status: string;
  deal_value?: number | null;
  deal_value_formatted?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiReferralSummary {
  total_referrals: number;
  pending_referrals: number;
  successful_referrals: number;
  reward_eligible_referrals: number;
  rewards_granted_count: number;
  total_rewards_granted_value: number;
  formatted_rewards_granted: string;
  recent_referrals: ApiReferralResponse[];
}

export interface ApiCustomerOption {
  id: string;
  company_name: string;
  contact_name: string;
  industry?: string | null;
}

export interface ApiAdminDashboard {
  total_salespeople: number;
  active_salespeople: number;
  total_leads: number;
  active_opportunities: number;
  won_deals: number;
  total_pipeline_value: number;
  formatted_pipeline_value: string;
  sales_team: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string | null;
    status: string;
    is_active: boolean;
    assigned_leads: number;
    created_at: string;
  }>;
}

export interface ApiLeadDetailResponse extends ApiLeadResponse {
  score_breakdown?: ApiScoreBreakdown | null;
  recent_activities?: ApiActivityResponse[];
  notes?: ApiNoteResponse[];
  recommended_action_reason?: string | null;
  pipeline_history?: Array<Record<string, any>>;
  referral_info?: ApiReferralResponse | null;
}

export interface ApiLeadCreate {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string | null;
  industry: string;
  company_size?: string | null;
  location?: string | null;
  contact_role?: string | null;
  lead_source: string;
  estimated_value: number;
  expected_investment?: number;
  referred_by_id?: string | null;
  stage?: string;
  status?: string;
  owner_id?: string | null;
}

export interface ApiLeadUpdate {
  company_name?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  industry?: string;
  company_size?: string;
  location?: string;
  contact_role?: string;
  lead_source?: string;
  estimated_value?: number;
  expected_investment?: number;
  referred_by_id?: string;
  stage?: string;
  status?: string;
  owner_id?: string;
}

export interface ApiLeadStageUpdate {
  stage: string;
  note?: string;
}

export interface ApiScoreRecalculateResponse {
  lead_id: string;
  previous_score: number;
  new_score: number;
  score_change: number;
  conversion_probability: number;
  classification: string;
  engagement_level: string;
  positive_factors: ApiScoreFactor[];
  negative_factors: ApiScoreFactor[];
  recalculated_at: string;
}

export interface ApiRecommendationResponse {
  id: string;
  lead_id: string;
  company_name?: string | null;
  contact_name?: string | null;
  contact_role?: string | null;
  ai_score?: number | null;
  conversion_probability?: number | null;
  action: string;
  recommended_action?: string | null;
  reason: string;
  urgency: string;
  category: string;
  completed: boolean;
  last_touch?: string | null;
  created_at: string;
}

export interface ApiFocusLeadResponse {
  lead_id: string;
  company_name: string;
  contact_name: string;
  contact_role?: string | null;
  industry: string;
  estimated_value: number;
  stage: string;
  score: number;
  conversion_probability: number;
  probability?: number | null;
  classification: string;
  engagement_level: string;
  stagnation_status: string;
  days_in_current_stage: number;
  focus_reason: string;
  reason?: string | null;
  recommended_action: string;
  urgency: string;
  lead?: Record<string, any>;
}

export interface ApiSourceMetric {
  source: string;
  count: number;
  percentage: number;
  color: string;
}

export interface ApiStageMetric {
  stage: string;
  count: number;
  value: number;
  formatted_value: string;
  conversion_rate: string;
}

export interface ApiEngagementMetric {
  week: string;
  calls: number;
  emails: number;
  demos: number;
}

export interface ApiConversionMetric {
  month: string;
  rate: number;
  benchmark: number;
}

export interface ApiBehavioralInsight {
  insight_type: string;
  title: string;
  description: string;
  affected_leads: number;
  severity: string;
}

export interface ApiPipelineOverview {
  stages: Record<string, ApiLeadResponse[]>;
  lead_count: number;
  total_pipeline_value: number;
  formatted_pipeline_value: string;
  average_score: number;
}

export interface ApiAnalyticsOverview {
  total_leads: number;
  active_opportunities: number;
  won_leads: number;
  lost_leads: number;
  conversion_rate: number;
  average_score: number;
  average_pipeline_time: number;
  average_stage_time: number;
  pipeline_value: number;
  total_leads_trend?: string;
  conversion_rate_trend?: string;
  avg_score_trend?: string;
}

export interface ApiConversionProbabilitySummary {
  hot: number;
  warm: number;
  nurture: number;
  cold: number;
  hot_percentage: number;
  warm_percentage: number;
  nurture_percentage: number;
  cold_percentage: number;
}

export interface ApiDashboardResponse {
  total_leads: number;
  active_opportunities: number;
  hot_leads_count: number;
  average_score: number;
  follow_ups_due: number;
  conversion_rate: number;
  pipeline_value: number;
  priority_leads: ApiLeadResponse[];
  ai_insights: ApiBehavioralInsight[];
  pipeline_stages: ApiStageMetric[];
  recent_activities: ApiActivityResponse[];
  recommendations: ApiRecommendationResponse[];
  conversion_probability_summary?: ApiConversionProbabilitySummary;
  probability_distribution?: ApiConversionProbabilitySummary;
}
