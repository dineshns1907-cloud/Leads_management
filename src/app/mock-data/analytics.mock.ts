import { AnalyticsData } from '../models';

export const INITIAL_ANALYTICS: AnalyticsData = {
  totalLeads: 524,
  totalLeadsTrend: '+14% vs last month',
  hotLeads: 48,
  hotLeadsTrend: '+8 new this week',
  avgScore: 71,
  avgScoreTrend: '+4 pts overall',
  followUpsDue: 31,
  followUpsDueTrend: '6 high priority',
  conversionRate: 28.4,
  conversionRateTrend: '+3.2% vs Q2',
  avgDaysInPipeline: 21,
  pipelineHealth: [
    { stage: 'New', count: 112, value: '$1.4M', conversionRate: '68%' },
    { stage: 'Contacted', count: 94, value: '$1.8M', conversionRate: '54%' },
    { stage: 'Qualified', count: 86, value: '$2.1M', conversionRate: '62%' },
    { stage: 'Demo', count: 68, value: '$2.9M', conversionRate: '48%' },
    { stage: 'Proposal', count: 74, value: '$3.8M', conversionRate: '58%' },
    { stage: 'Negotiation', count: 42, value: '$3.1M', conversionRate: '74%' },
    { stage: 'Won', count: 48, value: '$4.2M', conversionRate: '100%' }
  ],
  probabilityDistribution: {
    hot: 48,
    warm: 136,
    nurture: 210,
    cold: 130
  },
  leadsBySource: [
    { source: 'Website', count: 184, percentage: 35, color: '#E76F51' },
    { source: 'Referral', count: 115, percentage: 22, color: '#2A9D8F' },
    { source: 'LinkedIn', count: 98, percentage: 19, color: '#7B61FF' },
    { source: 'Outbound', count: 79, percentage: 15, color: '#E9A23B' },
    { source: 'Event / Webinar', count: 48, percentage: 9, color: '#A0522D' }
  ],
  leadsByStage: [
    { stage: 'New', count: 112, value: '$1.4M' },
    { stage: 'Contacted', count: 94, value: '$1.8M' },
    { stage: 'Qualified', count: 86, value: '$2.1M' },
    { stage: 'Demo', count: 68, value: '$2.9M' },
    { stage: 'Proposal', count: 74, value: '$3.8M' },
    { stage: 'Negotiation', count: 42, value: '$3.1M' },
    { stage: 'Won', count: 48, value: '$4.2M' }
  ],
  conversionTrend: [
    { month: 'Apr', rate: 21.2, benchmark: 22.0 },
    { month: 'May', rate: 23.5, benchmark: 22.5 },
    { month: 'Jun', rate: 24.8, benchmark: 23.0 },
    { month: 'Jul', rate: 26.1, benchmark: 23.5 },
    { month: 'Aug', rate: 27.4, benchmark: 24.0 },
    { month: 'Sep', rate: 28.4, benchmark: 24.5 }
  ],
  scoreDistribution: [
    { range: '90-100 (Exceptional)', count: 48, percentage: 9 },
    { range: '80-89 (High Intent)', count: 92, percentage: 18 },
    { range: '70-79 (Warm/Active)', count: 144, percentage: 27 },
    { range: '50-69 (Nurturing)', count: 138, percentage: 26 },
    { range: '0-49 (Cold/At Risk)', count: 102, percentage: 20 }
  ],
  engagementTrend: [
    { week: 'W34', calls: 38, emails: 142, demos: 14 },
    { week: 'W35', calls: 45, emails: 165, demos: 18 },
    { week: 'W36', calls: 52, emails: 184, demos: 22 },
    { week: 'W37', calls: 64, emails: 210, demos: 27 },
    { week: 'W38 (Current)', calls: 71, emails: 238, demos: 31 }
  ]
};
