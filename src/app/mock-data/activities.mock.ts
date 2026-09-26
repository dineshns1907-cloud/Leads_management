import { Activity } from '../models';

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-feed-1',
    leadId: 'lead-1',
    leadCompany: 'ABC Technologies',
    type: 'email',
    title: 'ABC Technologies replied to email',
    description: 'David Sterling: "We reviewed the proposal and are ready to discuss implementation."',
    timestamp: '10:32 AM',
    salesRep: 'Alex Morgan',
    impactScore: 12
  },
  {
    id: 'act-feed-2',
    leadId: 'lead-4',
    leadCompany: 'Apex Cloud Systems',
    type: 'proposal',
    title: 'Apex Cloud Systems uploaded MSA redlines',
    description: 'Jennifer Ross marked up contract terms with minor adjustments for COO execution.',
    timestamp: '8:40 AM',
    salesRep: 'System',
    impactScore: 20
  },
  {
    id: 'act-feed-3',
    leadId: 'lead-2',
    leadCompany: 'TechCorp Solutions',
    type: 'demo',
    title: 'TechCorp Solutions completed product demo',
    description: '45-minute technical validation demo completed with Elena Rostova and Infosec team.',
    timestamp: 'Yesterday, 2:15 PM',
    salesRep: 'Sarah Chen',
    impactScore: 16
  },
  {
    id: 'act-feed-4',
    leadId: 'lead-3',
    leadCompany: 'Global Industries',
    type: 'proposal',
    title: 'Global Industries opened proposal',
    description: 'Multi-year proposal viewed for 8 minutes by procurement division.',
    timestamp: 'Yesterday, 4:10 PM',
    salesRep: 'System',
    impactScore: 8
  },
  {
    id: 'act-feed-5',
    leadId: 'lead-1',
    leadCompany: 'ABC Technologies',
    type: 'quotation',
    title: 'ABC Technologies requested quotation',
    description: 'Generated formal PDF quotation for 50 enterprise seats ($84k ARR).',
    timestamp: 'Yesterday, 3:45 PM',
    salesRep: 'System',
    impactScore: 18
  },
  {
    id: 'act-feed-6',
    leadId: 'lead-8',
    leadCompany: 'Veritas Financial',
    type: 'call',
    title: 'Veritas Financial completed terms negotiation call',
    description: 'Confirmed multi-year payment terms and volume discount with Jonathan Wu.',
    timestamp: 'Today, 9:15 AM',
    salesRep: 'Sarah Chen',
    impactScore: 18
  },
  {
    id: 'act-feed-7',
    leadId: 'lead-6',
    leadCompany: 'QuantumSecure Labs',
    type: 'demo',
    title: 'QuantumSecure Labs completed API architecture demo',
    description: 'Engineering leadership evaluated webhook streaming and requested sandbox keys.',
    timestamp: 'Today, 11:30 AM',
    salesRep: 'Alex Morgan',
    impactScore: 15
  },
  {
    id: 'act-feed-8',
    leadId: 'lead-14',
    leadCompany: 'OmniStream Analytics',
    type: 'meeting',
    title: 'OmniStream Analytics CEO session completed',
    description: 'Tariq Al-Mansoor reviewed enterprise security architecture and requested pricing.',
    timestamp: 'Today, 1:00 PM',
    salesRep: 'Alex Morgan',
    impactScore: 16
  },
  {
    id: 'act-feed-9',
    leadId: 'lead-5',
    leadCompany: 'BioPulse Diagnostics',
    type: 'call',
    title: 'BioPulse Diagnostics completed clinical discovery call',
    description: 'Dr. Thorne walked through diagnostic pipeline constraints and Q4 budget readiness.',
    timestamp: 'Yesterday, 11:00 AM',
    salesRep: 'Sarah Chen',
    impactScore: 12
  },
  {
    id: 'act-feed-10',
    leadId: 'lead-13',
    leadCompany: 'Zephyr Health Networks',
    type: 'stage_change',
    title: 'Zephyr Health Networks moved to Won',
    description: 'Executed 3-year enterprise agreement ($165k ARR). Handed to Customer Success.',
    timestamp: 'Yesterday, 4:50 PM',
    salesRep: 'Sarah Chen',
    impactScore: 30
  }
];
