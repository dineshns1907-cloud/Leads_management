export * from './user.model';

export type PipelineStage = 
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Demo'
  | 'Proposal'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type LeadPriority = 'hot' | 'warm' | 'nurture' | 'cold';
export type ConversionProbability = 'High' | 'Medium' | 'Nurture' | 'Low' | 'Won' | 'Lost';
export type EngagementLevel = 'High' | 'Medium' | 'Low';
export type StagnationStatus = 'normal' | 'warning' | 'critical';

export type LeadSource = 
  | 'Website' 
  | 'Referral' 
  | 'Advertisement' 
  | 'Cold Call' 
  | 'LinkedIn' 
  | 'Partner' 
  | 'Event' 
  | 'Webinar' 
  | 'Outbound';

export interface ScoreContribution {
  signal: string;
  points: number;
}

export interface ScoreBreakdown {
  positiveSignals: ScoreContribution[];
  negativeSignals: ScoreContribution[];
  explanation: string;
}

export interface Note {
  id: string;
  leadId: string;
  author: string;
  avatar?: string;
  date: string;
  content: string;
  aiSignals: string[];
}

export interface Activity {
  id: string;
  leadId: string;
  leadPublicId?: string;
  leadCompany: string;
  type: 'call' | 'email' | 'meeting' | 'demo' | 'proposal' | 'quotation' | 'stage_change' | 'note';
  title: string;
  description: string;
  timestamp: string;
  salesRep: string;
  impactScore?: number;
  stage?: PipelineStage;
}

export interface Lead {
  id: string;
  publicLeadId?: string;
  leadCode?: string;
  company: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
  avatarUrl?: string;
  industry: string;
  source: LeadSource;
  stage: PipelineStage;
  dealSize: string;
  estimatedAnnualValue?: string;
  expectedInvestment?: number;
  expectedInvestmentFormatted?: string;
  businessPriorityScore?: number;
  businessPriorityTier?: 'VERY HIGH' | 'HIGH' | 'MEDIUM' | 'LOW';
  businessPriorityFactors?: string[];
  referredById?: string;
  referralInfo?: {
    id: string;
    referrerCustomerId: string;
    referrerCustomerName?: string;
    referrerPublicLeadId?: string;
    referredLeadId: string;
    referredLeadName?: string;
    referredPublicLeadId?: string;
    referralDate: string;
    status: string;
    rewardType: string;
    rewardValue: number;
    rewardStatus: string;
    dealValueFormatted?: string;
    notes?: string;
  };
  aiScore: number;
  previousScore: number;
  scoreChange: number;
  conversionProbability: ConversionProbability;
  conversionPercentage: number;
  priority: LeadPriority;
  engagementLevel: EngagementLevel;
  stageAgeDays: number;
  stagnationStatus: StagnationStatus;
  companySize?: string;
  location?: string;
  leadOwner?: string;
  createdDate?: string;
  previousInteractions?: string;
  recommendedAction: string;
  actionReason: string;
  actionCompleted: boolean;
  lastActivity: string;
  lastActivityDate: string;
  nextAction: string;
  scoreBreakdown: ScoreBreakdown;
  notes: Note[];
  activities: Activity[];
  recentSimulationNote?: string;
}

export interface Referral {
  id: string;
  referrerCustomerId: string;
  referrerCustomerName?: string;
  referrerPublicLeadId?: string;
  referredLeadId: string;
  referredLeadName?: string;
  referredPublicLeadId?: string;
  referralDate: string;
  status: 'PENDING' | 'CONVERTED' | 'REJECTED' | 'REWARD_ELIGIBLE' | 'REWARD_GRANTED' | string;
  rewardType: 'PERCENTAGE_DISCOUNT' | 'FIXED_DISCOUNT' | 'CREDIT' | 'AWARD_RECOGNITION' | string;
  rewardValue: number;
  rewardStatus: 'PENDING' | 'ELIGIBLE' | 'GRANTED' | 'CANCELLED' | string;
  dealValue?: number;
  dealValueFormatted?: string;
  notes?: string;
  createdAt?: string;
}

export interface ReferralSummary {
  totalReferrals: number;
  pendingReferrals: number;
  successfulReferrals: number;
  rewardEligibleReferrals: number;
  rewardsGrantedCount: number;
  totalRewardsGrantedValue: number;
  formattedRewardsGranted: string;
  recentReferrals: Referral[];
}

export interface Recommendation {
  id: string;
  leadId: string;
  company: string;
  contact: string;
  contactRole: string;
  aiScore: number;
  probabilityPercentage: number;
  action: string;
  reason: string;
  urgency: 'immediate' | 'today' | 'this_week';
  category: 'Contact' | 'Follow-up' | 'Demo' | 'Proposal' | 'Nurture';
  completed: boolean;
  lastTouch: string;
}

export interface LeadScore {
  leadId: string;
  score: number;
  previousScore: number;
  percentile: number;
  breakdown: ScoreBreakdown;
  lastCalculated: string;
}

export interface AnalyticsData {
  totalLeads: number;
  totalLeadsTrend: string;
  hotLeads: number;
  hotLeadsTrend: string;
  avgScore: number;
  avgScoreTrend: string;
  followUpsDue: number;
  followUpsDueTrend: string;
  conversionRate: number;
  conversionRateTrend: string;
  avgDaysInPipeline: number;
  pipelineHealth: Array<{
    stage: PipelineStage;
    count: number;
    value: string;
    conversionRate: string;
  }>;
  probabilityDistribution: {
    hot: number;
    warm: number;
    nurture: number;
    cold: number;
  };
  leadsBySource: Array<{
    source: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  leadsByStage: Array<{
    stage: PipelineStage;
    count: number;
    value: string;
  }>;
  conversionTrend: Array<{
    month: string;
    rate: number;
    benchmark: number;
  }>;
  scoreDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  engagementTrend: Array<{
    week: string;
    calls: number;
    emails: number;
    demos: number;
  }>;
}
