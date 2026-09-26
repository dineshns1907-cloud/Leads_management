import {
  Lead,
  Activity,
  Note,
  Recommendation,
  PipelineStage,
  LeadPriority,
  ConversionProbability,
  EngagementLevel,
  StagnationStatus,
  ScoreBreakdown,
  User,
  UserRole,
  Referral
} from '../../models';
import {
  ApiUserResponse,
  ApiLeadResponse,
  ApiLeadDetailResponse,
  ApiActivityResponse,
  ApiNoteResponse,
  ApiRecommendationResponse,
  ApiScoreBreakdown,
  ApiReferralResponse
} from '../models/api.models';

export function formatCurrency(value?: number): string {
  if (value === undefined || value === null || value === 0) return '₹0';
  const val = Math.abs(value);
  if (val >= 10_000_000) {
    const cr = (val / 10_000_000).toFixed(1).replace(/\.0$/, '');
    return `₹${cr} Cr`;
  }
  if (val >= 100_000) {
    const l = (val / 100_000).toFixed(1).replace(/\.0$/, '');
    return `₹${l}L`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

export function parseCurrencyValue(str?: string): number {
  if (!str) return 50000;
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(num)) return 50000;
  const upper = str.toUpperCase();
  if (upper.includes('CR')) return num * 10_000_000;
  if (upper.includes('L')) return num * 100_000;
  if (upper.includes('M')) return num * 1_000_000;
  if (upper.includes('K')) return num * 1_000;
  return num;
}

export function formatRelativeDate(isoDate?: string): string {
  if (!isoDate) return 'Just now';
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export function mapStageFromApi(apiStage: string): PipelineStage {
  const norm = (apiStage || '').toUpperCase();
  switch (norm) {
    case 'NEW': return 'New';
    case 'CONTACTED': return 'Contacted';
    case 'QUALIFIED': return 'Qualified';
    case 'DEMO': return 'Demo';
    case 'PROPOSAL': return 'Proposal';
    case 'NEGOTIATION': return 'Negotiation';
    case 'WON': return 'Won';
    case 'LOST': return 'Lost';
    default: return 'New';
  }
}

export function mapStageToApi(stage: PipelineStage): string {
  return stage.toUpperCase();
}

export function mapConversionProbability(prob: number, stage: string): ConversionProbability {
  const normStage = (stage || '').toUpperCase();
  if (normStage === 'WON') return 'Won';
  if (normStage === 'LOST') return 'Lost';
  if (prob >= 0.8) return 'High';
  if (prob >= 0.6) return 'Medium';
  if (prob >= 0.4) return 'Nurture';
  return 'Low';
}

export function mapUserFromApi(apiUser: ApiUserResponse): User {
  const r = (apiUser.role || '').toUpperCase();
  const role: UserRole = r === 'ADMIN' ? 'admin' : (r === 'MANAGER' ? 'manager' : 'salesperson');
  const title = r === 'ADMIN'
    ? 'System Administrator'
    : (r === 'MANAGER' ? 'Sales Manager' : 'Sales Representative');
  const department = r === 'ADMIN'
    ? 'System Administration'
    : (r === 'MANAGER' ? 'Revenue Strategy & Global Sales' : 'Commercial & Mid-Market Accounts');
  const avatarText = apiUser.name
    ? apiUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'SP';

  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role,
    title,
    avatarText,
    department,
    phone: apiUser.phone || undefined
  };
}

export function mapActivityTypeFromApi(apiType: string): Activity['type'] {
  const norm = (apiType || '').toUpperCase();
  switch (norm) {
    case 'CALL': return 'call';
    case 'EMAIL':
    case 'EMAIL_RESPONSE': return 'email';
    case 'MEETING': return 'meeting';
    case 'DEMO': return 'demo';
    case 'PROPOSAL': return 'proposal';
    case 'QUOTATION': return 'quotation';
    case 'STAGE_CHANGE': return 'stage_change';
    default: return 'call';
  }
}

export function formatActivityTitle(apiType: string, desc: string): string {
  const norm = (apiType || '').toUpperCase();
  switch (norm) {
    case 'CALL': return 'Phone conversation logged';
    case 'EMAIL': return 'Outbound email sent';
    case 'EMAIL_RESPONSE': return 'Customer email reply';
    case 'MEETING': return 'Executive meeting';
    case 'DEMO': return 'Product demonstration';
    case 'PROPOSAL': return 'Proposal document reviewed';
    case 'QUOTATION': return 'Quotation generated';
    case 'STAGE_CHANGE': return desc || 'Stage moved';
    case 'PRICING_PAGE_VISIT': return 'Customer pricing page visit';
    case 'WEBSITE_VISIT': return 'Customer website visit';
    default: return desc || 'Activity recorded';
  }
}

export function mapActivityFromApi(apiAct: ApiActivityResponse): Activity {
  return {
    id: apiAct.id,
    leadId: apiAct.lead_id,
    leadPublicId: apiAct.lead_public_id || undefined,
    leadCompany: apiAct.lead_company_name || 'Lead',
    type: mapActivityTypeFromApi(apiAct.activity_type),
    title: formatActivityTitle(apiAct.activity_type, apiAct.description),
    description: apiAct.description,
    timestamp: formatRelativeDate(apiAct.activity_date),
    salesRep: apiAct.sales_rep_name || 'Sales Representative',
    impactScore: apiAct.score_impact || 0
  };
}

export function mapNoteFromApi(apiNote: ApiNoteResponse): Note {
  return {
    id: apiNote.id,
    leadId: apiNote.lead_id,
    author: apiNote.author_name || 'Sales Representative',
    date: formatRelativeDate(apiNote.created_at),
    content: apiNote.content,
    aiSignals: apiNote.ai_signals || []
  };
}

export function mapRecommendationFromApi(apiRec: ApiRecommendationResponse): Recommendation {
  const prob = apiRec.conversion_probability || 0.5;
  const urgencyNorm = (apiRec.urgency || 'today').toLowerCase();
  const urgency = (urgencyNorm === 'immediate' || urgencyNorm === 'today' || urgencyNorm === 'this_week')
    ? urgencyNorm
    : 'today';

  return {
    id: apiRec.id,
    leadId: apiRec.lead_id,
    company: apiRec.company_name || 'Opportunity',
    contact: apiRec.contact_name || 'Primary Contact',
    contactRole: apiRec.contact_role || 'Decision Maker',
    aiScore: apiRec.ai_score || 65,
    probabilityPercentage: Math.round(prob * 100),
    action: apiRec.action || apiRec.recommended_action || 'Next Action',
    reason: apiRec.reason || 'Calculated based on real-time buying signals.',
    urgency: urgency as 'immediate' | 'today' | 'this_week',
    category: (apiRec.category || 'Follow-up') as any,
    completed: apiRec.completed || false,
    lastTouch: apiRec.last_touch || 'Today'
  };
}

export function mapScoreBreakdownFromApi(raw?: ApiScoreBreakdown | null): ScoreBreakdown {
  if (!raw) {
    return {
      positiveSignals: [
        { signal: 'Matches target account ICP profile', points: 14 },
        { signal: 'Decision maker verified on LinkedIn', points: 8 }
      ],
      negativeSignals: [],
      explanation: 'AI score calculated from behavioral telemetry, interaction velocity, and demographic fit.'
    };
  }

  return {
    positiveSignals: (raw.positive_factors || []).map(f => ({
      signal: f.signal,
      points: f.points
    })),
    negativeSignals: (raw.negative_factors || []).map(f => ({
      signal: f.signal,
      points: Math.abs(f.points)
    })),
    explanation: raw.explanation || 'Behavioral momentum and time decay factors.'
  };
}

export function mapLeadFromApi(apiLead: ApiLeadResponse | ApiLeadDetailResponse): Lead {
  const detail = apiLead as ApiLeadDetailResponse;
  const stage = mapStageFromApi(apiLead.stage);
  const probVal = apiLead.conversion_probability ?? 0.5;
  const prob = mapConversionProbability(probVal, apiLead.stage);
  const pct = Math.round(probVal * 100);

  const priorityVal = (apiLead.classification || 'WARM').toLowerCase();
  const priority: LeadPriority = (priorityVal === 'hot' || priorityVal === 'warm' || priorityVal === 'nurture' || priorityVal === 'cold')
    ? priorityVal
    : (apiLead.ai_score >= 80 ? 'hot' : (apiLead.ai_score >= 60 ? 'warm' : 'nurture'));

  const engVal = (apiLead.engagement_level || 'MEDIUM').toLowerCase();
  const engagementLevel: EngagementLevel = engVal === 'high' ? 'High' : (engVal === 'low' ? 'Low' : 'Medium');

  const stagVal = (apiLead.stagnation_status || 'normal').toLowerCase();
  const stagnationStatus: StagnationStatus = stagVal === 'critical' ? 'critical' : (stagVal === 'warning' ? 'warning' : 'normal');

  const notes: Note[] = detail.notes ? detail.notes.map(mapNoteFromApi) : [];
  const activities: Activity[] = detail.recent_activities ? detail.recent_activities.map(mapActivityFromApi) : [];

  const tier = (apiLead.business_priority_tier || '').toUpperCase();
  const validTier = (tier === 'VERY HIGH' || tier === 'HIGH' || tier === 'MEDIUM' || tier === 'LOW') ? tier : undefined;

  let referralInfo: Lead['referralInfo'] = undefined;
  if (detail.referral_info) {
    referralInfo = {
      id: detail.referral_info.id,
      referrerCustomerId: detail.referral_info.referrer_customer_id,
      referrerCustomerName: detail.referral_info.referrer_customer_name || 'Customer Account',
      referrerPublicLeadId: detail.referral_info.referrer_public_lead_id || undefined,
      referredLeadId: detail.referral_info.referred_lead_id,
      referredLeadName: detail.referral_info.referred_lead_name || apiLead.company_name,
      referredPublicLeadId: detail.referral_info.referred_public_lead_id || apiLead.public_lead_id || undefined,
      referralDate: formatRelativeDate(detail.referral_info.referral_date),
      status: detail.referral_info.status,
      rewardType: detail.referral_info.reward_type,
      rewardValue: detail.referral_info.reward_value,
      rewardStatus: detail.referral_info.reward_status,
      dealValueFormatted: detail.referral_info.deal_value_formatted || undefined,
      notes: detail.referral_info.notes || undefined
    };
  }

  const pubId = apiLead.public_lead_id || undefined;

  return {
    id: apiLead.id,
    publicLeadId: pubId,
    leadCode: pubId,
    company: apiLead.company_name,
    contactName: apiLead.contact_name,
    contactEmail: apiLead.contact_email,
    contactPhone: apiLead.contact_phone || '+1 (555) 012-3456',
    contactRole: apiLead.contact_role || 'Decision Maker',
    industry: apiLead.industry || 'Technology',
    source: (apiLead.lead_source || 'Website') as any,
    stage,
    dealSize: apiLead.expected_investment_formatted || formatCurrency(apiLead.estimated_value),
    estimatedAnnualValue: apiLead.expected_investment_formatted || formatCurrency(apiLead.estimated_value),
    expectedInvestment: apiLead.expected_investment ?? apiLead.estimated_value,
    expectedInvestmentFormatted: apiLead.expected_investment_formatted || formatCurrency(apiLead.estimated_value),
    businessPriorityScore: apiLead.business_priority_score,
    businessPriorityTier: validTier as any,
    businessPriorityFactors: apiLead.business_priority_factors || [],
    referredById: apiLead.referred_by_id || undefined,
    referralInfo,
    aiScore: apiLead.ai_score ?? 50,
    previousScore: apiLead.ai_score ?? 50,
    scoreChange: 0,
    conversionProbability: prob,
    conversionPercentage: pct,
    priority,
    engagementLevel,
    stageAgeDays: apiLead.days_in_current_stage ?? 0,
    stagnationStatus,
    companySize: apiLead.company_size || '250-500 employees',
    location: apiLead.location || 'San Francisco, CA',
    leadOwner: apiLead.owner_name || 'Alex Rivera',
    createdDate: formatRelativeDate(apiLead.created_at),
    previousInteractions: `${activities.length} interactions logged`,
    recommendedAction: apiLead.recommended_action || 'Initial discovery and executive outreach',
    actionReason: detail.recommended_action_reason || 'Identified by predictive intent model.',
    actionCompleted: false,
    lastActivity: activities.length > 0 ? activities[0].title : (apiLead.recommended_action || 'Touchpoint recorded'),
    lastActivityDate: formatRelativeDate(apiLead.last_activity_at),
    nextAction: apiLead.recommended_action || 'Schedule next engagement',
    scoreBreakdown: mapScoreBreakdownFromApi(detail.score_breakdown),
    notes,
    activities
  };
}

export function mapReferralFromApi(apiRef: ApiReferralResponse): Referral {
  return {
    id: apiRef.id,
    referrerCustomerId: apiRef.referrer_customer_id,
    referrerCustomerName: apiRef.referrer_customer_name || 'Customer Account',
    referrerPublicLeadId: apiRef.referrer_public_lead_id || undefined,
    referredLeadId: apiRef.referred_lead_id,
    referredLeadName: apiRef.referred_lead_name || 'Referred Lead',
    referredPublicLeadId: apiRef.referred_public_lead_id || undefined,
    referralDate: formatRelativeDate(apiRef.referral_date),
    status: apiRef.status,
    rewardType: apiRef.reward_type,
    rewardValue: apiRef.reward_value,
    rewardStatus: apiRef.reward_status,
    dealValue: apiRef.deal_value || undefined,
    dealValueFormatted: apiRef.deal_value_formatted || (apiRef.deal_value ? formatCurrency(apiRef.deal_value) : undefined),
    notes: apiRef.notes || undefined,
    createdAt: formatRelativeDate(apiRef.created_at)
  };
}
