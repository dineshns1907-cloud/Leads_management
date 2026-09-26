import { Lead } from '../models';

export const INITIAL_LEADS: Lead[] = [
  {
    "id": "lead-1",
    "company": "ABC Technologies",
    "contactName": "David Sterling",
    "contactEmail": "david.sterling@abctech.io",
    "contactPhone": "+1 (555) 234-8901",
    "contactRole": "VP of Revenue Operations",
    "industry": "Enterprise Software",
    "source": "Website",
    "stage": "Proposal",
    "dealSize": "$84,000 ARR",
    "aiScore": 91,
    "previousScore": 79,
    "scoreChange": 12,
    "conversionProbability": "High",
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 3,
    "recommendedAction": "Contact customer",
    "actionReason": "Quotation requested + repeated proposal engagement (4 views in 24h)",
    "actionCompleted": false,
    "lastActivity": "Replied to pricing inquiry email",
    "lastActivityDate": "Today, 10:32 AM",
    "nextAction": "Review procurement redlines and close date",
    "scoreBreakdown": {
      "explanation": "Extremely strong velocity: customer reviewed pricing schedule twice and involved CFO in email thread.",
      "positiveSignals": [
        {
          "signal": "Quotation requested",
          "points": 18
        },
        {
          "signal": "Product demo attended by 4 stakeholders",
          "points": 15
        },
        {
          "signal": "Email engagement (replied within 1 hour)",
          "points": 12
        },
        {
          "signal": "Proposal opened multiple times",
          "points": 10
        },
        {
          "signal": "Pipeline advancement to Proposal",
          "points": 8
        }
      ],
      "negativeSignals": [
        {
          "signal": "No contact for 3 days prior",
          "points": -2
        }
      ]
    },
    "notes": [
      {
        "id": "n-1",
        "leadId": "lead-1",
        "author": "Alex Morgan",
        "date": "Yesterday at 4:15 PM",
        "content": "Customer liked the enterprise package tier and requested custom pricing terms. They are discussing the budget internally with their CFO and need an updated SLA clause.",
        "aiSignals": [
          "High Budget Intent",
          "Executive Involvement",
          "Contract Pending"
        ]
      },
      {
        "id": "n-2",
        "leadId": "lead-1",
        "author": "Alex Morgan",
        "date": "Sep 22, 2026",
        "content": "Product demo went exceptionally well. Demonstrated AI lead prioritization and data pipeline integrations.",
        "aiSignals": [
          "Strong Feature Fit",
          "Technical Approval"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-1",
        "leadId": "lead-1",
        "leadCompany": "ABC Technologies",
        "type": "email",
        "title": "Email replied",
        "description": "David Sterling replied: \"We reviewed the proposal and are ready to discuss the implementation schedule.\"",
        "timestamp": "Today, 10:32 AM",
        "salesRep": "Alex Morgan",
        "impactScore": 12
      },
      {
        "id": "act-2",
        "leadId": "lead-1",
        "leadCompany": "ABC Technologies",
        "type": "quotation",
        "title": "Quotation viewed & downloaded",
        "description": "Procurement portal generated custom PDF quotation for 50 enterprise seats.",
        "timestamp": "Yesterday, 3:45 PM",
        "salesRep": "System",
        "impactScore": 18
      },
      {
        "id": "act-3",
        "leadId": "lead-1",
        "leadCompany": "ABC Technologies",
        "type": "proposal",
        "title": "Proposal opened",
        "description": "Proposal v2.4 viewed by CFO (finance@abctech.io) for 14 minutes.",
        "timestamp": "Sep 24, 2026",
        "salesRep": "System",
        "impactScore": 10
      },
      {
        "id": "act-4",
        "leadId": "lead-1",
        "leadCompany": "ABC Technologies",
        "type": "demo",
        "title": "Executive demo completed",
        "description": "45-minute live platform demonstration with RevOps and Sales leadership.",
        "timestamp": "Sep 22, 2026",
        "salesRep": "Alex Morgan",
        "impactScore": 15
      },
      {
        "id": "act-5",
        "leadId": "lead-1",
        "leadCompany": "ABC Technologies",
        "type": "stage_change",
        "title": "Stage moved to Proposal",
        "description": "Opportunity qualified and advanced from Demo to Proposal stage.",
        "timestamp": "Sep 21, 2026",
        "salesRep": "Alex Morgan",
        "impactScore": 8
      },
      {
        "id": "act-6",
        "leadId": "lead-1",
        "leadCompany": "ABC Technologies",
        "type": "call",
        "title": "Discovery call completed",
        "description": "30-minute initial discovery call regarding CRM latency and lead prioritization pain points.",
        "timestamp": "Sep 18, 2026",
        "salesRep": "Alex Morgan",
        "impactScore": 6
      }
    ],
    "estimatedAnnualValue": "$84,000 ARR",
    "conversionPercentage": 86,
    "stagnationStatus": "normal",
    "companySize": "250-500 employees",
    "location": "San Francisco, CA",
    "leadOwner": "Alex Rivera",
    "createdDate": "Sep 25, 2026",
    "previousInteractions": "Attended Q3 Product Webinar, downloaded AI Whitepaper"
  },
  {
    "id": "lead-2",
    "company": "TechCorp Solutions",
    "contactName": "Elena Rostova",
    "contactEmail": "e.rostova@techcorp.com",
    "contactPhone": "+1 (555) 492-1200",
    "contactRole": "Chief Technology Officer",
    "industry": "FinTech / Security",
    "source": "LinkedIn",
    "stage": "Demo",
    "dealSize": "$120,000 ARR",
    "aiScore": 87,
    "previousScore": 78,
    "scoreChange": 9,
    "conversionProbability": "High",
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 2,
    "recommendedAction": "Schedule decision-maker meeting",
    "actionReason": "Demo completed + repeated responses from CTO and Security Architect",
    "actionCompleted": false,
    "lastActivity": "Attended deep-dive technical demo",
    "lastActivityDate": "Yesterday, 2:15 PM",
    "nextAction": "Send SOC2 compliance package and technical FAQ",
    "scoreBreakdown": {
      "explanation": "High technical validation score; security team approved API specifications.",
      "positiveSignals": [
        {
          "signal": "Deep-dive architecture demo completed",
          "points": 16
        },
        {
          "signal": "Security questionnaire submitted",
          "points": 14
        },
        {
          "signal": "Prompt email engagement with technical lead",
          "points": 10
        },
        {
          "signal": "High website intent on Security page",
          "points": 8
        }
      ],
      "negativeSignals": [
        {
          "signal": "Procurement cycle stated as 45 days",
          "points": -3
        }
      ]
    },
    "notes": [
      {
        "id": "n-3",
        "leadId": "lead-2",
        "author": "Sarah Chen",
        "date": "Yesterday, 4:00 PM",
        "content": "Elena asked for our data encryption standards and GDPR compliance details. She confirmed their current tool is expiring in 60 days.",
        "aiSignals": [
          "High Urgency",
          "Budget Approved",
          "Compliance Sensitive"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-7",
        "leadId": "lead-2",
        "leadCompany": "TechCorp Solutions",
        "type": "demo",
        "title": "Completed technical product demo",
        "description": "Technical walkthrough of the REST API hooks and lead routing engine.",
        "timestamp": "Yesterday, 2:15 PM",
        "salesRep": "Sarah Chen",
        "impactScore": 16
      },
      {
        "id": "act-8",
        "leadId": "lead-2",
        "leadCompany": "TechCorp Solutions",
        "type": "email",
        "title": "Security questionnaire received",
        "description": "TechCorp infosec coordinator submitted vendor assessment.",
        "timestamp": "Sep 23, 2026",
        "salesRep": "System",
        "impactScore": 14
      }
    ],
    "estimatedAnnualValue": "$120,000 ARR",
    "conversionPercentage": 82,
    "stagnationStatus": "normal",
    "companySize": "500-1,000 employees",
    "location": "New York, NY",
    "leadOwner": "Elena Rostova",
    "createdDate": "Sep 24, 2026",
    "previousInteractions": "Inbound contact form inquiry from enterprise pricing page"
  },
  {
    "id": "lead-3",
    "company": "Global Industries",
    "contactName": "Marcus Vance",
    "contactEmail": "m.vance@globalind.net",
    "contactPhone": "+1 (555) 778-3401",
    "contactRole": "Head of Global Procurement",
    "industry": "Manufacturing & Logistics",
    "source": "Referral",
    "stage": "Proposal",
    "dealSize": "$150,000 ARR",
    "aiScore": 74,
    "previousScore": 79,
    "scoreChange": -5,
    "conversionProbability": "Medium",
    "priority": "warm",
    "engagementLevel": "Medium",
    "stageAgeDays": 9,
    "recommendedAction": "Follow up with executive sponsor",
    "actionReason": "Proposal viewed 3 days ago but follow-up email has not been answered yet",
    "actionCompleted": false,
    "lastActivity": "Proposal doc opened by procurement",
    "lastActivityDate": "3 days ago",
    "nextAction": "Phone call to Marcus regarding RFP clarification",
    "scoreBreakdown": {
      "explanation": "Moderate risk due to follow-up response lag despite strong deal value.",
      "positiveSignals": [
        {
          "signal": "Enterprise RFP shortlisted",
          "points": 15
        },
        {
          "signal": "Executive sponsor confirmed business case",
          "points": 12
        },
        {
          "signal": "Proposal document accessed",
          "points": 8
        }
      ],
      "negativeSignals": [
        {
          "signal": "No email reply for 72 hours",
          "points": -6
        },
        {
          "signal": "Follow-up task overdue",
          "points": -3
        }
      ]
    },
    "notes": [
      {
        "id": "n-4",
        "leadId": "lead-3",
        "author": "Alex Morgan",
        "date": "Sep 21, 2026",
        "content": "Marcus mentioned board review scheduled for end of month. Need to ensure our ROI calculations are highlighted.",
        "aiSignals": [
          "Board Review Pending",
          "Cost Sensitive"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-9",
        "leadId": "lead-3",
        "leadCompany": "Global Industries",
        "type": "proposal",
        "title": "Proposal accessed by procurement team",
        "description": "Multi-year proposal viewed for 8 minutes.",
        "timestamp": "3 days ago",
        "salesRep": "System",
        "impactScore": 8
      },
      {
        "id": "act-10",
        "leadId": "lead-3",
        "leadCompany": "Global Industries",
        "type": "email",
        "title": "Follow-up email dispatched",
        "description": "Sent check-in email regarding implementation timeline.",
        "timestamp": "2 days ago",
        "salesRep": "Alex Morgan",
        "impactScore": 0
      }
    ],
    "estimatedAnnualValue": "$150,000 ARR",
    "conversionPercentage": 70,
    "stagnationStatus": "warning",
    "companySize": "1,000-5,000 employees",
    "location": "Austin, TX",
    "leadOwner": "Sarah Chen",
    "createdDate": "Sep 23, 2026",
    "previousInteractions": "Referred by enterprise customer CTO; 3 prior email touchpoints"
  },
  {
    "id": "lead-4",
    "company": "Apex Cloud Systems",
    "contactName": "Jennifer Ross",
    "contactEmail": "jennifer.r@apexcloud.com",
    "contactPhone": "+1 (555) 345-6712",
    "contactRole": "VP of Sales Strategy",
    "industry": "Cloud Infrastructure",
    "source": "Website",
    "stage": "Negotiation",
    "dealSize": "$96,000 ARR",
    "aiScore": 94,
    "previousScore": 82,
    "scoreChange": 12,
    "conversionProbability": "High",
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 4,
    "recommendedAction": "Finalize legal terms",
    "actionReason": "Legal team returned redlines with minor adjustments; closing imminent",
    "actionCompleted": false,
    "lastActivity": "Master Services Agreement returned with markup",
    "lastActivityDate": "Today, 8:40 AM",
    "nextAction": "Review section 4 liability terms with in-house counsel",
    "scoreBreakdown": {
      "explanation": "Extremely high closing probability. Redlines indicate late-stage legal review.",
      "positiveSignals": [
        {
          "signal": "Legal redlines exchanged",
          "points": 20
        },
        {
          "signal": "CFO signed off on commercial terms",
          "points": 18
        },
        {
          "signal": "Security review passed with zero blockers",
          "points": 12
        },
        {
          "signal": "Rapid contract turnaround (<24h)",
          "points": 10
        }
      ],
      "negativeSignals": []
    },
    "notes": [
      {
        "id": "n-5",
        "leadId": "lead-4",
        "author": "Alex Morgan",
        "date": "Today, 9:00 AM",
        "content": "Jennifer confirmed: \"If we can resolve the indemnification cap today, our COO will execute the agreement by Friday.\"",
        "aiSignals": [
          "Immediate Closing",
          "Ready to Sign"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-11",
        "leadId": "lead-4",
        "leadCompany": "Apex Cloud Systems",
        "type": "quotation",
        "title": "MSA & Quotation markup uploaded",
        "description": "Jennifer Ross uploaded executed redline version 3.",
        "timestamp": "Today, 8:40 AM",
        "salesRep": "System",
        "impactScore": 20
      }
    ],
    "estimatedAnnualValue": "$96,000 ARR",
    "conversionPercentage": 88,
    "stagnationStatus": "normal",
    "companySize": "100-250 employees",
    "location": "Boston, MA",
    "leadOwner": "Alex Rivera",
    "createdDate": "Sep 22, 2026",
    "previousInteractions": "Met at SaaStr Annual 2026; requested API benchmark documentation"
  },
  {
    "id": "lead-5",
    "company": "BioPulse Diagnostics",
    "contactName": "Dr. Aris Thorne",
    "contactEmail": "a.thorne@biopulse.org",
    "contactPhone": "+1 (555) 890-2345",
    "contactRole": "Director of Clinical Operations",
    "industry": "Healthcare & Life Sciences",
    "source": "Event",
    "stage": "Qualified",
    "dealSize": "$68,000 ARR",
    "aiScore": 78,
    "previousScore": 66,
    "scoreChange": 12,
    "conversionProbability": "Medium",
    "priority": "warm",
    "engagementLevel": "High",
    "stageAgeDays": 5,
    "recommendedAction": "Deliver tailored clinical workflow demo",
    "actionReason": "Met at BioHealth Expo; customer completed qualification questionnaire with urgent need",
    "actionCompleted": false,
    "lastActivity": "Completed requirements discovery call",
    "lastActivityDate": "Yesterday, 11:00 AM",
    "nextAction": "Prepare HIPAA-compliant data routing scenario for presentation",
    "scoreBreakdown": {
      "explanation": "High intent in regulated medical sector; regulatory approval is primary hurdle.",
      "positiveSignals": [
        {
          "signal": "Met at industry conference with direct need",
          "points": 14
        },
        {
          "signal": "Qualification score 9.2/10",
          "points": 12
        },
        {
          "signal": "Budget allocated for Q4",
          "points": 10
        }
      ],
      "negativeSignals": [
        {
          "signal": "Long compliance review cycle",
          "points": -4
        }
      ]
    },
    "notes": [
      {
        "id": "n-6",
        "leadId": "lead-5",
        "author": "Sarah Chen",
        "date": "Yesterday, 1:30 PM",
        "content": "Dr. Thorne is replacing an antiquated internal tracking tool that fails audits. Demo must emphasize traceability.",
        "aiSignals": [
          "Compliance Driven",
          "Urgent Replacement"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-12",
        "leadId": "lead-5",
        "leadCompany": "BioPulse Diagnostics",
        "type": "call",
        "title": "Clinical discovery call completed",
        "description": "Analyzed workflow bottlenecks across 3 testing laboratories.",
        "timestamp": "Yesterday, 11:00 AM",
        "salesRep": "Sarah Chen",
        "impactScore": 12
      }
    ],
    "estimatedAnnualValue": "$68,000 ARR",
    "conversionPercentage": 74,
    "stagnationStatus": "normal",
    "companySize": "5,000+ enterprise",
    "location": "Chicago, IL",
    "leadOwner": "Alex Rivera",
    "createdDate": "Sep 21, 2026",
    "previousInteractions": "Requested security compliance package and interactive sandbox demo"
  },
  {
    "id": "lead-6",
    "company": "QuantumSecure Labs",
    "contactName": "Vikram Patel",
    "contactEmail": "vikram@quantumsecure.io",
    "contactPhone": "+1 (555) 612-4490",
    "contactRole": "VP of Cybersecurity",
    "industry": "Cybersecurity",
    "source": "Outbound",
    "stage": "Demo",
    "dealSize": "$110,000 ARR",
    "aiScore": 84,
    "previousScore": 75,
    "scoreChange": 9,
    "conversionProbability": "High",
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 1,
    "recommendedAction": "Send sandbox API credentials",
    "actionReason": "Demo finished; security engineers requested sandbox test environment today",
    "actionCompleted": false,
    "lastActivity": "Attended engineering demo with 5 staff",
    "lastActivityDate": "Today, 11:30 AM",
    "nextAction": "Provision API test sandbox and notify Vikram",
    "scoreBreakdown": {
      "explanation": "Technical team is proactive and engaged in sandbox prototyping.",
      "positiveSignals": [
        {
          "signal": "Sandbox environment requested",
          "points": 15
        },
        {
          "signal": "Multi-seat demo completed",
          "points": 12
        },
        {
          "signal": "VP level sponsor in all sessions",
          "points": 10
        }
      ],
      "negativeSignals": []
    },
    "notes": [
      {
        "id": "n-7",
        "leadId": "lead-6",
        "author": "Alex Morgan",
        "date": "Today, 12:15 PM",
        "content": "Engineers tested sample webhook payloads during the demo. Very impressed with real-time score streaming.",
        "aiSignals": [
          "Hands-on Tech Evaluator",
          "High Enthusiasm"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-13",
        "leadId": "lead-6",
        "leadCompany": "QuantumSecure Labs",
        "type": "demo",
        "title": "Platform architecture demonstration",
        "description": "Reviewed API schemas and real-time webhook delivery guarantees.",
        "timestamp": "Today, 11:30 AM",
        "salesRep": "Alex Morgan",
        "impactScore": 15
      }
    ],
    "estimatedAnnualValue": "$110,000 ARR",
    "conversionPercentage": 80,
    "stagnationStatus": "normal",
    "companySize": "50-100 employees",
    "location": "Seattle, WA",
    "leadOwner": "Elena Rostova",
    "createdDate": "Sep 20, 2026",
    "previousInteractions": "Visited pricing calculator 4 times; engaged with sales chatbot"
  },
  {
    "id": "lead-7",
    "company": "Lumina Retail Group",
    "contactName": "Chloe Bennett",
    "contactEmail": "cbennett@luminaretail.com",
    "contactPhone": "+1 (555) 789-4321",
    "contactRole": "Chief Digital Officer",
    "industry": "E-commerce & Retail",
    "source": "Website",
    "stage": "Contacted",
    "dealSize": "$54,000 ARR",
    "aiScore": 68,
    "previousScore": 62,
    "scoreChange": 6,
    "conversionProbability": "Medium",
    "priority": "warm",
    "engagementLevel": "Medium",
    "stageAgeDays": 16,
    "recommendedAction": "Book formal discovery call",
    "actionReason": "Downloaded whitepaper on Omnichannel Revenue Optimization and clicked booking link",
    "actionCompleted": false,
    "lastActivity": "Clicked scheduling link in follow-up email",
    "lastActivityDate": "Yesterday, 5:10 PM",
    "nextAction": "Send calendar invite with agenda tailored to retail seasonality",
    "scoreBreakdown": {
      "explanation": "Strong inbound interest from enterprise retail brand preparing for Q4 peak.",
      "positiveSignals": [
        {
          "signal": "Inbound content download",
          "points": 10
        },
        {
          "signal": "Calendar link interaction",
          "points": 8
        }
      ],
      "negativeSignals": [
        {
          "signal": "Initial response took 4 days",
          "points": -3
        }
      ]
    },
    "notes": [
      {
        "id": "n-8",
        "leadId": "lead-7",
        "author": "Alex Morgan",
        "date": "Yesterday, 5:30 PM",
        "content": "Chloe is aiming to modernize lead intake across their 45 regional franchise stores.",
        "aiSignals": [
          "Franchise Scale",
          "Omnichannel Goal"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-14",
        "leadId": "lead-7",
        "leadCompany": "Lumina Retail Group",
        "type": "email",
        "title": "Marketing email clicked",
        "description": "Clicked \"Schedule Demo with LeadIQ Sales Team\" button.",
        "timestamp": "Yesterday, 5:10 PM",
        "salesRep": "System",
        "impactScore": 8
      }
    ],
    "estimatedAnnualValue": "$54,000 ARR",
    "conversionPercentage": 65,
    "stagnationStatus": "critical",
    "companySize": "750-1,500 employees",
    "location": "Denver, CO",
    "leadOwner": "Alex Rivera",
    "createdDate": "Sep 19, 2026",
    "previousInteractions": "Attended Q3 Product Webinar, downloaded AI Whitepaper"
  },
  {
    "id": "lead-8",
    "company": "Veritas Financial",
    "contactName": "Jonathan Wu",
    "contactEmail": "j.wu@veritasfin.com",
    "contactPhone": "+1 (555) 901-5623",
    "contactRole": "Managing Director, Wealth Advisory",
    "industry": "Financial Services",
    "source": "Referral",
    "stage": "Negotiation",
    "dealSize": "$140,000 ARR",
    "aiScore": 92,
    "previousScore": 85,
    "scoreChange": 7,
    "conversionProbability": "High",
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 2,
    "recommendedAction": "Final commercial sign-off call",
    "actionReason": "Price discounts approved by sales management; closing agreement scheduled for Monday",
    "actionCompleted": false,
    "lastActivity": "Confirmed discount terms via phone",
    "lastActivityDate": "Today, 9:15 AM",
    "nextAction": "Deliver finalized agreement for DocuSign routing",
    "scoreBreakdown": {
      "explanation": "Top tier deal in late commercial negotiation stage with board-level sponsorship.",
      "positiveSignals": [
        {
          "signal": "Pricing discount terms agreed",
          "points": 18
        },
        {
          "signal": "Managing director approval",
          "points": 15
        },
        {
          "signal": "Target deployment scheduled for next quarter",
          "points": 10
        }
      ],
      "negativeSignals": []
    },
    "notes": [
      {
        "id": "n-9",
        "leadId": "lead-8",
        "author": "Sarah Chen",
        "date": "Today, 9:45 AM",
        "content": "Jonathan confirmed he has full budgetary sign-off up to $150k. Expect contract back within 48 hours.",
        "aiSignals": [
          "Budget Authority Confirmed",
          "Imminent Close"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-15",
        "leadId": "lead-8",
        "leadCompany": "Veritas Financial",
        "type": "call",
        "title": "Commercial terms negotiation call",
        "description": "Agreed on 2-year payment cadence and volume licensing tier.",
        "timestamp": "Today, 9:15 AM",
        "salesRep": "Sarah Chen",
        "impactScore": 18
      }
    ],
    "estimatedAnnualValue": "$140,000 ARR",
    "conversionPercentage": 86,
    "stagnationStatus": "normal",
    "companySize": "2,500-10,000 employees",
    "location": "Atlanta, GA",
    "leadOwner": "Marcus Vance",
    "createdDate": "Sep 18, 2026",
    "previousInteractions": "Inbound contact form inquiry from enterprise pricing page"
  },
  {
    "id": "lead-9",
    "company": "DataMesh Systems",
    "contactName": "Kavita Raman",
    "contactEmail": "kavita@datamesh.dev",
    "contactPhone": "+1 (555) 332-9011",
    "contactRole": "Head of Infrastructure",
    "industry": "Data & AI Infrastructure",
    "source": "Website",
    "stage": "Qualified",
    "dealSize": "$72,000 ARR",
    "aiScore": 76,
    "previousScore": 70,
    "scoreChange": 6,
    "conversionProbability": "Medium",
    "priority": "warm",
    "engagementLevel": "Medium",
    "stageAgeDays": 4,
    "recommendedAction": "Schedule technical deep dive",
    "actionReason": "Requested architectural overview of database synchronization",
    "actionCompleted": false,
    "lastActivity": "Submitted technical requirements form",
    "lastActivityDate": "Yesterday, 3:00 PM",
    "nextAction": "Coordinate with Solutions Architect for architectural session",
    "scoreBreakdown": {
      "explanation": "High technical validation needed. Fast growing AI startup.",
      "positiveSignals": [
        {
          "signal": "Submitted complete infrastructure survey",
          "points": 12
        },
        {
          "signal": "Series B funding announced ($32M)",
          "points": 10
        }
      ],
      "negativeSignals": []
    },
    "notes": [
      {
        "id": "n-10",
        "leadId": "lead-9",
        "author": "Alex Morgan",
        "date": "Yesterday, 3:30 PM",
        "content": "Kavita wants to make sure LeadIQ can scale to 500,000 lead events per day without degradation.",
        "aiSignals": [
          "Scalability Priority",
          "High Volume Potential"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-16",
        "leadId": "lead-9",
        "leadCompany": "DataMesh Systems",
        "type": "email",
        "title": "Requirements document received",
        "description": "Received 8-page architecture and latency requirements.",
        "timestamp": "Yesterday, 3:00 PM",
        "salesRep": "System",
        "impactScore": 12
      }
    ],
    "estimatedAnnualValue": "$72,000 ARR",
    "conversionPercentage": 72,
    "stagnationStatus": "normal",
    "companySize": "250-500 employees",
    "location": "San Jose, CA",
    "leadOwner": "Alex Rivera",
    "createdDate": "Sep 17, 2026",
    "previousInteractions": "Referred by enterprise customer CTO; 3 prior email touchpoints"
  },
  {
    "id": "lead-10",
    "company": "Hydra Logistics",
    "contactName": "Tyler Briggs",
    "contactEmail": "tbriggs@hydralog.com",
    "contactPhone": "+1 (555) 441-2983",
    "contactRole": "VP of Transportation",
    "industry": "Supply Chain & Freight",
    "source": "Outbound",
    "stage": "New",
    "dealSize": "$42,000 ARR",
    "aiScore": 58,
    "previousScore": 58,
    "scoreChange": 0,
    "conversionProbability": "Nurture",
    "priority": "nurture",
    "engagementLevel": "Low",
    "stageAgeDays": 8,
    "recommendedAction": "Re-engage via tailored case study",
    "actionReason": "Cold lead with 0 touchpoints in past 8 days",
    "actionCompleted": false,
    "lastActivity": "Lead imported via outbound campaign",
    "lastActivityDate": "8 days ago",
    "nextAction": "Send logistics-specific ROI benchmark study",
    "scoreBreakdown": {
      "explanation": "Early stage lead with low recent activity. Needs nurturing.",
      "positiveSignals": [
        {
          "signal": "Fleet size fits ideal customer profile",
          "points": 8
        }
      ],
      "negativeSignals": [
        {
          "signal": "No responses to 2 outreach sequences",
          "points": -8
        }
      ]
    },
    "notes": [],
    "activities": [
      {
        "id": "act-17",
        "leadId": "lead-10",
        "leadCompany": "Hydra Logistics",
        "type": "stage_change",
        "title": "Lead created from Outbound Prospecting",
        "description": "Added to automated logistics sequence.",
        "timestamp": "8 days ago",
        "salesRep": "System",
        "impactScore": 0
      }
    ],
    "estimatedAnnualValue": "$42,000 ARR",
    "conversionPercentage": 56,
    "stagnationStatus": "warning",
    "companySize": "500-1,000 employees",
    "location": "Toronto, ON",
    "leadOwner": "Alex Rivera",
    "createdDate": "Sep 16, 2026",
    "previousInteractions": "Met at SaaStr Annual 2026; requested API benchmark documentation"
  },
  {
    "id": "lead-11",
    "company": "AeroClean Dynamics",
    "contactName": "Sophie Martens",
    "contactEmail": "smartens@aeroclean.eu",
    "contactPhone": "+1 (555) 772-8819",
    "contactRole": "Chief Commercial Officer",
    "industry": "CleanTech & Energy",
    "source": "Webinar",
    "stage": "Contacted",
    "dealSize": "$56,000 ARR",
    "aiScore": 64,
    "previousScore": 52,
    "scoreChange": 12,
    "conversionProbability": "Medium",
    "priority": "warm",
    "engagementLevel": "Medium",
    "stageAgeDays": 10,
    "recommendedAction": "Follow up on webinar Q&A query",
    "actionReason": "Asked 2 questions during \"AI Lead Scoring vs Traditional Rules\" webinar",
    "actionCompleted": false,
    "lastActivity": "Attended live 60-min webinar",
    "lastActivityDate": "2 days ago",
    "nextAction": "Deliver direct answer to Sophie regarding European data residency",
    "scoreBreakdown": {
      "explanation": "Active participant in educational sessions with specific buying queries.",
      "positiveSignals": [
        {
          "signal": "Full webinar attendance (100% duration)",
          "points": 12
        },
        {
          "signal": "Submitted 2 targeted technical questions",
          "points": 10
        }
      ],
      "negativeSignals": [
        {
          "signal": "Has not yet confirmed discovery meeting",
          "points": -4
        }
      ]
    },
    "notes": [
      {
        "id": "n-11",
        "leadId": "lead-11",
        "author": "Alex Morgan",
        "date": "2 days ago",
        "content": "Sophie asked: \"Does your predictive scoring support decentralized sales reps across 6 European countries?\" Need to confirm multi-currency and timezone support.",
        "aiSignals": [
          "International Expansion",
          "Webinar High Intent"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-18",
        "leadId": "lead-11",
        "leadCompany": "AeroClean Dynamics",
        "type": "meeting",
        "title": "Webinar attendee verified",
        "description": "Attended webinar: AI Lead Scoring in Enterprise Sales.",
        "timestamp": "2 days ago",
        "salesRep": "Marketing",
        "impactScore": 12
      }
    ],
    "estimatedAnnualValue": "$56,000 ARR",
    "conversionPercentage": 61,
    "stagnationStatus": "warning",
    "companySize": "1,000-5,000 employees",
    "location": "San Francisco, CA",
    "leadOwner": "Sarah Chen",
    "createdDate": "Sep 15, 2026",
    "previousInteractions": "Requested security compliance package and interactive sandbox demo"
  },
  {
    "id": "lead-12",
    "company": "Starlight Media",
    "contactName": "Brandon Fox",
    "contactEmail": "b.fox@starlightmedia.co",
    "contactPhone": "+1 (555) 129-9944",
    "contactRole": "Director of Ad Operations",
    "industry": "Media & Advertising",
    "source": "LinkedIn",
    "stage": "New",
    "dealSize": "$36,000 ARR",
    "aiScore": 46,
    "previousScore": 46,
    "scoreChange": 0,
    "conversionProbability": "Nurture",
    "priority": "cold",
    "engagementLevel": "Low",
    "stageAgeDays": 12,
    "recommendedAction": "Archive or move to low-touch nurture",
    "actionReason": "Unopened emails and no visits for 12 days",
    "actionCompleted": false,
    "lastActivity": "Outreach email bounced back / unopened",
    "lastActivityDate": "12 days ago",
    "nextAction": "Verify email deliverability or find alternate contact",
    "scoreBreakdown": {
      "explanation": "Engagement dropped severely. No interactions recorded in two weeks.",
      "positiveSignals": [
        {
          "signal": "Company head-count matches ICP",
          "points": 6
        }
      ],
      "negativeSignals": [
        {
          "signal": "3 unopened email sequences",
          "points": -12
        },
        {
          "signal": "Inactive for >10 days",
          "points": -8
        }
      ]
    },
    "notes": [],
    "activities": [],
    "estimatedAnnualValue": "$36,000 ARR",
    "conversionPercentage": 44,
    "stagnationStatus": "warning",
    "companySize": "100-250 employees",
    "location": "New York, NY",
    "leadOwner": "Marcus Vance",
    "createdDate": "Sep 14, 2026",
    "previousInteractions": "Visited pricing calculator 4 times; engaged with sales chatbot"
  },
  {
    "id": "lead-13",
    "company": "Zephyr Health Networks",
    "contactName": "Rachel Adams",
    "contactEmail": "radams@zephyrhealth.com",
    "contactPhone": "+1 (555) 654-7890",
    "contactRole": "VP of Patient Engagement",
    "industry": "Healthcare & Life Sciences",
    "source": "Referral",
    "stage": "Qualified",
    "dealSize": "$165,000 ARR",
    "aiScore": 96,
    "previousScore": 92,
    "scoreChange": 4,
    "conversionProbability": "High",
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 1,
    "recommendedAction": "Execute onboarding kickoff",
    "actionReason": "Contract signed! Hand over to Customer Success team",
    "actionCompleted": true,
    "lastActivity": "DocuSign contract executed by CEO",
    "lastActivityDate": "Yesterday, 4:50 PM",
    "nextAction": "Schedule implementation kickoff call with CS team",
    "scoreBreakdown": {
      "explanation": "Closed Won. Exceptional velocity from first contact to execution in 26 days.",
      "positiveSignals": [
        {
          "signal": "Contract executed",
          "points": 30
        },
        {
          "signal": "Immediate payment wired",
          "points": 20
        },
        {
          "signal": "100% executive alignment",
          "points": 15
        }
      ],
      "negativeSignals": []
    },
    "notes": [
      {
        "id": "n-12",
        "leadId": "lead-13",
        "author": "Sarah Chen",
        "date": "Yesterday, 5:00 PM",
        "content": "Fantastic win! 3-year enterprise agreement closed with Zephyr Health. Customer Success team tagged.",
        "aiSignals": [
          "Closed Won",
          "Multi-year Contract",
          "Expansion Potential"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-19",
        "leadId": "lead-13",
        "leadCompany": "Zephyr Health Networks",
        "type": "stage_change",
        "title": "Stage moved to Closed Won",
        "description": "Successfully signed 3-year contract at $165k ARR.",
        "timestamp": "Yesterday, 4:50 PM",
        "salesRep": "Sarah Chen",
        "impactScore": 30
      }
    ],
    "estimatedAnnualValue": "$165,000 ARR",
    "conversionPercentage": 90,
    "stagnationStatus": "normal",
    "companySize": "5,000+ enterprise",
    "location": "Austin, TX",
    "leadOwner": "Alex Rivera",
    "createdDate": "Sep 13, 2026",
    "previousInteractions": "Attended Q3 Product Webinar, downloaded AI Whitepaper"
  },
  {
    "id": "lead-14",
    "company": "OmniStream Analytics",
    "contactName": "Tariq Al-Mansoor",
    "contactEmail": "tariq@omnistream.io",
    "contactPhone": "+1 (555) 831-7711",
    "contactRole": "Chief Executive Officer",
    "industry": "Enterprise Software",
    "source": "Website",
    "stage": "Demo",
    "dealSize": "$89,000 ARR",
    "aiScore": 82,
    "previousScore": 71,
    "scoreChange": 11,
    "conversionProbability": "High",
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 2,
    "recommendedAction": "Send custom quotation proposal",
    "actionReason": "Demo rated 5/5; Tariq requested pricing for 40 seats with dedicated Slack channel",
    "actionCompleted": false,
    "lastActivity": "Live product demo completed with leadership",
    "lastActivityDate": "Today, 1:00 PM",
    "nextAction": "Generate quotation and send via LeadIQ portal",
    "scoreBreakdown": {
      "explanation": "CEO directly involved and requested formal quotation within 2 hours of demo.",
      "positiveSignals": [
        {
          "signal": "CEO in demo session",
          "points": 16
        },
        {
          "signal": "Quotation request submitted",
          "points": 14
        },
        {
          "signal": "Active website exploration",
          "points": 8
        }
      ],
      "negativeSignals": []
    },
    "notes": [
      {
        "id": "n-13",
        "leadId": "lead-14",
        "author": "Alex Morgan",
        "date": "Today, 1:45 PM",
        "content": "Tariq said: \"Our current CRM scoring is based on naive rules and we lose deals every week. LeadIQ matches our expectations.\"",
        "aiSignals": [
          "High Buying Intent",
          "Frustrated with Incumbent"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-20",
        "leadId": "lead-14",
        "leadCompany": "OmniStream Analytics",
        "type": "demo",
        "title": "Executive Demo with CEO",
        "description": "Demonstrated real-time scoring and Slack alert integrations.",
        "timestamp": "Today, 1:00 PM",
        "salesRep": "Alex Morgan",
        "impactScore": 16
      }
    ],
    "estimatedAnnualValue": "$89,000 ARR",
    "conversionPercentage": 80,
    "stagnationStatus": "normal",
    "companySize": "50-100 employees",
    "location": "Boston, MA",
    "leadOwner": "Elena Rostova",
    "createdDate": "Sep 12, 2026",
    "previousInteractions": "Inbound contact form inquiry from enterprise pricing page"
  },
  {
    "id": "lead-15",
    "company": "Krypton Cyber Defense",
    "contactName": "Natasha Roman",
    "contactEmail": "natasha.r@kryptoncyber.com",
    "contactPhone": "+1 (555) 349-8822",
    "contactRole": "VP of Commercial Partnerships",
    "industry": "Cybersecurity",
    "source": "Event",
    "stage": "Qualified",
    "dealSize": "$98,000 ARR",
    "aiScore": 79,
    "previousScore": 72,
    "scoreChange": 7,
    "conversionProbability": "Medium",
    "priority": "warm",
    "engagementLevel": "High",
    "stageAgeDays": 15,
    "recommendedAction": "Schedule technical integration call",
    "actionReason": "Security questionnaire passed with 100% compliance",
    "actionCompleted": false,
    "lastActivity": "Security assessment completed",
    "lastActivityDate": "Yesterday, 10:15 AM",
    "nextAction": "Connect Solutions Engineer for single-sign-on (SSO) test",
    "scoreBreakdown": {
      "explanation": "Security and technical hurdles passed with flying colors.",
      "positiveSignals": [
        {
          "signal": "Zero security findings",
          "points": 15
        },
        {
          "signal": "Executive endorsement from VP",
          "points": 12
        }
      ],
      "negativeSignals": [
        {
          "signal": "Needs bespoke API rate limits",
          "points": -2
        }
      ]
    },
    "notes": [],
    "activities": [
      {
        "id": "act-21",
        "leadId": "lead-15",
        "leadCompany": "Krypton Cyber Defense",
        "type": "email",
        "title": "Security questionnaire approved",
        "description": "Vendor security team gave unconditional green light.",
        "timestamp": "Yesterday, 10:15 AM",
        "salesRep": "System",
        "impactScore": 15
      }
    ],
    "estimatedAnnualValue": "$98,000 ARR",
    "conversionPercentage": 75,
    "stagnationStatus": "critical",
    "companySize": "750-1,500 employees",
    "location": "Chicago, IL",
    "leadOwner": "Sarah Chen",
    "createdDate": "Sep 11, 2026",
    "previousInteractions": "Referred by enterprise customer CTO; 3 prior email touchpoints"
  },
  {
    "id": "lead-16",
    "company": "Synapse Robotics",
    "contactName": "Dr. Leonard Hofstadter",
    "contactEmail": "l.hofstadter@synapserobotics.com",
    "contactPhone": "+1 (555) 993-2144",
    "contactRole": "Chief Scientist",
    "industry": "Data & AI Infrastructure",
    "source": "Website",
    "stage": "Contacted",
    "dealSize": "$62,000 ARR",
    "aiScore": 61,
    "previousScore": 61,
    "scoreChange": 0,
    "conversionProbability": "Medium",
    "priority": "warm",
    "engagementLevel": "Medium",
    "stageAgeDays": 5,
    "recommendedAction": "Send automated case study",
    "actionReason": "Visited pricing page 3 times today without booking",
    "actionCompleted": false,
    "lastActivity": "Pricing page visited repeatedly",
    "lastActivityDate": "Today, 11:05 AM",
    "nextAction": "Automate gentle email trigger with ROI calculator link",
    "scoreBreakdown": {
      "explanation": "High latent interest on pricing and API documentation.",
      "positiveSignals": [
        {
          "signal": "Frequent pricing page visits",
          "points": 10
        },
        {
          "signal": "Downloaded technical whitepaper",
          "points": 8
        }
      ],
      "negativeSignals": [
        {
          "signal": "Hesitant to book initial sales call",
          "points": -5
        }
      ]
    },
    "notes": [],
    "activities": [],
    "estimatedAnnualValue": "$62,000 ARR",
    "conversionPercentage": 60,
    "stagnationStatus": "normal",
    "companySize": "2,500-10,000 employees",
    "location": "Seattle, WA",
    "leadOwner": "Alex Rivera",
    "createdDate": "Sep 10, 2026",
    "previousInteractions": "Met at SaaStr Annual 2026; requested API benchmark documentation"
  },
  {
    "id": "lead-17",
    "company": "Vanguard Solar Technologies",
    "contactName": "Carlos Morales",
    "contactEmail": "carlos@vanguardsolar.com",
    "contactPhone": "+1 (555) 771-3004",
    "contactRole": "VP of Commercial Operations",
    "industry": "CleanTech & Energy",
    "source": "Outbound",
    "stage": "Proposal",
    "dealSize": "$76,000 ARR",
    "aiScore": 81,
    "previousScore": 73,
    "scoreChange": 8,
    "conversionProbability": "High",
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 3,
    "recommendedAction": "Address contract questions",
    "actionReason": "Opened proposal and forwarded to internal counsel",
    "actionCompleted": false,
    "lastActivity": "Forwarded proposal email internally to legal",
    "lastActivityDate": "Yesterday, 1:40 PM",
    "nextAction": "Offer 15-minute call with our commercial counsel",
    "scoreBreakdown": {
      "explanation": "Strong internal advocacy. Forwarding proposal to legal indicates advanced intent.",
      "positiveSignals": [
        {
          "signal": "Proposal forwarded to 3 colleagues",
          "points": 14
        },
        {
          "signal": "Explicit purchase budget identified",
          "points": 12
        }
      ],
      "negativeSignals": []
    },
    "notes": [
      {
        "id": "n-14",
        "leadId": "lead-17",
        "author": "Alex Morgan",
        "date": "Yesterday, 2:00 PM",
        "content": "Carlos verified that solar tax credits are being finalized and they want software deployed by Nov 1.",
        "aiSignals": [
          "Target Deployment Date",
          "Regulatory Incentive"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-22",
        "leadId": "lead-17",
        "leadCompany": "Vanguard Solar Technologies",
        "type": "proposal",
        "title": "Proposal forwarded internally",
        "description": "Carlos Morales forwarded commercial proposal to legal@vanguardsolar.com.",
        "timestamp": "Yesterday, 1:40 PM",
        "salesRep": "System",
        "impactScore": 14
      }
    ],
    "estimatedAnnualValue": "$76,000 ARR",
    "conversionPercentage": 80,
    "stagnationStatus": "normal",
    "companySize": "250-500 employees",
    "location": "Denver, CO",
    "leadOwner": "Alex Rivera",
    "createdDate": "Sep 9, 2026",
    "previousInteractions": "Requested security compliance package and interactive sandbox demo"
  },
  {
    "id": "lead-18",
    "company": "Pulsewave Telematics",
    "contactName": "Danielle Miller",
    "contactEmail": "dmiller@pulsewave.io",
    "contactPhone": "+1 (555) 443-8871",
    "contactRole": "Head of Fleet Strategy",
    "industry": "Supply Chain & Freight",
    "source": "LinkedIn",
    "stage": "New",
    "dealSize": "$48,000 ARR",
    "aiScore": 52,
    "previousScore": 52,
    "scoreChange": 0,
    "conversionProbability": "Nurture",
    "priority": "nurture",
    "engagementLevel": "Low",
    "stageAgeDays": 9,
    "recommendedAction": "Trigger LinkedIn message sequence",
    "actionReason": "Accepted connection request on LinkedIn",
    "actionCompleted": false,
    "lastActivity": "Accepted connection request",
    "lastActivityDate": "3 days ago",
    "nextAction": "Send direct message regarding fleet dispatch optimization",
    "scoreBreakdown": {
      "explanation": "Initial connection accepted, no further sales dialogue initiated yet.",
      "positiveSignals": [
        {
          "signal": "Accepted LinkedIn connection",
          "points": 6
        }
      ],
      "negativeSignals": [
        {
          "signal": "No email address verified yet",
          "points": -4
        }
      ]
    },
    "notes": [],
    "activities": [],
    "estimatedAnnualValue": "$48,000 ARR",
    "conversionPercentage": 50,
    "stagnationStatus": "warning",
    "companySize": "500-1,000 employees",
    "location": "Atlanta, GA",
    "leadOwner": "Elena Rostova",
    "createdDate": "Sep 8, 2026",
    "previousInteractions": "Visited pricing calculator 4 times; engaged with sales chatbot"
  },
  {
    "id": "lead-19",
    "company": "Apex Health Systems",
    "contactName": "Gregory House",
    "contactEmail": "ghouse@apexhealthsys.org",
    "contactPhone": "+1 (555) 888-9900",
    "contactRole": "Chief Information Officer",
    "industry": "Healthcare & Life Sciences",
    "source": "Referral",
    "stage": "Qualified",
    "dealSize": "$180,000 ARR",
    "aiScore": 95,
    "previousScore": 90,
    "scoreChange": 5,
    "conversionProbability": "High",
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 2,
    "recommendedAction": "Coordinate executive dinner",
    "actionReason": "Closed enterprise contract for 12 hospital networks",
    "actionCompleted": true,
    "lastActivity": "Purchase order issued",
    "lastActivityDate": "2 days ago",
    "nextAction": "Kickoff meeting with regional hospital IT teams",
    "scoreBreakdown": {
      "explanation": "Flagship enterprise healthcare customer. Successfully closed.",
      "positiveSignals": [
        {
          "signal": "Purchase order received",
          "points": 30
        },
        {
          "signal": "Board approval granted",
          "points": 20
        }
      ],
      "negativeSignals": []
    },
    "notes": [],
    "activities": [
      {
        "id": "act-23",
        "leadId": "lead-19",
        "leadCompany": "Apex Health Systems",
        "type": "stage_change",
        "title": "Stage moved to Closed Won",
        "description": "Executed $180k ARR enterprise agreement.",
        "timestamp": "2 days ago",
        "salesRep": "Sarah Chen",
        "impactScore": 30
      }
    ],
    "estimatedAnnualValue": "$180,000 ARR",
    "conversionPercentage": 89,
    "stagnationStatus": "normal",
    "companySize": "1,000-5,000 employees",
    "location": "San Jose, CA",
    "leadOwner": "Alex Rivera",
    "createdDate": "Sep 7, 2026",
    "previousInteractions": "Attended Q3 Product Webinar, downloaded AI Whitepaper"
  },
  {
    "id": "lead-20",
    "company": "NovaCore Financial",
    "contactName": "Warren Sterling",
    "contactEmail": "w.sterling@novacore.ch",
    "contactPhone": "+1 (555) 341-9923",
    "contactRole": "VP of Capital Markets",
    "industry": "Financial Services",
    "source": "Website",
    "stage": "Negotiation",
    "dealSize": "$135,000 ARR",
    "aiScore": 89,
    "previousScore": 80,
    "scoreChange": 9,
    "conversionProbability": "High",
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 2,
    "recommendedAction": "Deliver customized SLA schedule",
    "actionReason": "Legal redlines requested 99.99% uptime guarantee",
    "actionCompleted": false,
    "lastActivity": "Redline review returned",
    "lastActivityDate": "Today, 10:00 AM",
    "nextAction": "Send updated enterprise SLA addendum with 99.99% commitment",
    "scoreBreakdown": {
      "explanation": "High probability of closing before quarter end. Only SLA fine-tuning remains.",
      "positiveSignals": [
        {
          "signal": "Commercial pricing locked",
          "points": 18
        },
        {
          "signal": "Legal counsel engaged in active closing",
          "points": 14
        }
      ],
      "negativeSignals": []
    },
    "notes": [
      {
        "id": "n-15",
        "leadId": "lead-20",
        "author": "Sarah Chen",
        "date": "Today, 10:30 AM",
        "content": "Warren is ready to approve as soon as our DevOps team confirms the 4-minute disaster recovery RTO.",
        "aiSignals": [
          "High Contract Value",
          "Technical SLA Critical"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-24",
        "leadId": "lead-20",
        "leadCompany": "NovaCore Financial",
        "type": "email",
        "title": "SLA inquiries received",
        "description": "Swiss legal counsel requested clarification on EU cloud regions.",
        "timestamp": "Today, 10:00 AM",
        "salesRep": "Sarah Chen",
        "impactScore": 12
      }
    ],
    "estimatedAnnualValue": "$135,000 ARR",
    "conversionPercentage": 84,
    "stagnationStatus": "normal",
    "companySize": "100-250 employees",
    "location": "Toronto, ON",
    "leadOwner": "Marcus Vance",
    "createdDate": "Sep 6, 2026",
    "previousInteractions": "Inbound contact form inquiry from enterprise pricing page"
  },
  {
    "id": "lead-21",
    "company": "Astra Logic AI",
    "contactName": "Siddharth Rao",
    "contactEmail": "siddharth@astralogic.ai",
    "contactPhone": "+1 (555) 490-3321",
    "contactRole": "Chief Product Officer",
    "industry": "Enterprise Software",
    "source": "Website",
    "stage": "Proposal",
    "dealSize": "$82,000 ARR",
    "aiScore": 85,
    "previousScore": 74,
    "scoreChange": 11,
    "conversionProbability": "High",
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 2,
    "recommendedAction": "Follow up on proposal feedback",
    "actionReason": "Proposal reviewed for 28 minutes by 3 team members",
    "actionCompleted": false,
    "lastActivity": "Proposal viewer analytics: 3 active viewers",
    "lastActivityDate": "Today, 11:45 AM",
    "nextAction": "Reach out to Siddharth to schedule proposal Q&A session",
    "scoreBreakdown": {
      "explanation": "High engagement telemetry on interactive proposal document.",
      "positiveSignals": [
        {
          "signal": "Multiple concurrent viewers on proposal",
          "points": 16
        },
        {
          "signal": "Detailed pricing tier exploration",
          "points": 12
        }
      ],
      "negativeSignals": []
    },
    "notes": [],
    "activities": [
      {
        "id": "act-25",
        "leadId": "lead-21",
        "leadCompany": "Astra Logic AI",
        "type": "proposal",
        "title": "Proposal viewed concurrently",
        "description": "Siddharth Rao and 2 colleagues spent 28 minutes in the proposal.",
        "timestamp": "Today, 11:45 AM",
        "salesRep": "System",
        "impactScore": 16
      }
    ],
    "estimatedAnnualValue": "$82,000 ARR",
    "conversionPercentage": 80,
    "stagnationStatus": "normal",
    "companySize": "5,000+ enterprise",
    "location": "San Francisco, CA",
    "leadOwner": "Alex Rivera",
    "createdDate": "Sep 5, 2026",
    "previousInteractions": "Referred by enterprise customer CTO; 3 prior email touchpoints"
  },
  {
    "id": "lead-22",
    "company": "IronClad Storage Systems",
    "contactName": "Kurt Jansen",
    "contactEmail": "kjansen@ironcladstorage.com",
    "contactPhone": "+1 (555) 812-7091",
    "contactRole": "Head of Global Facilities",
    "industry": "Manufacturing & Logistics",
    "source": "Event",
    "stage": "Contacted",
    "dealSize": "$44,000 ARR",
    "aiScore": 59,
    "previousScore": 59,
    "scoreChange": 0,
    "conversionProbability": "Nurture",
    "priority": "warm",
    "engagementLevel": "Low",
    "stageAgeDays": 6,
    "recommendedAction": "Schedule follow-up call",
    "actionReason": "Exchanged business cards at SupplyChain Expo",
    "actionCompleted": false,
    "lastActivity": "Initial outreach email sent",
    "lastActivityDate": "4 days ago",
    "nextAction": "Call Kurt directly to qualify storage expansion project",
    "scoreBreakdown": {
      "explanation": "Solid fit for enterprise warehousing, awaiting response to initial outreach.",
      "positiveSignals": [
        {
          "signal": "Facility count > 20 locations",
          "points": 10
        }
      ],
      "negativeSignals": [
        {
          "signal": "Slow response to email outreach",
          "points": -4
        }
      ]
    },
    "notes": [],
    "activities": [],
    "estimatedAnnualValue": "$44,000 ARR",
    "conversionPercentage": 57,
    "stagnationStatus": "normal",
    "companySize": "50-100 employees",
    "location": "New York, NY",
    "leadOwner": "Alex Rivera",
    "createdDate": "Sep 4, 2026",
    "previousInteractions": "Met at SaaStr Annual 2026; requested API benchmark documentation"
  },
  {
    "id": "lead-won-1",
    "company": "Nexus Health Analytics",
    "contactName": "Dr. Gregory House",
    "contactEmail": "ghouse@nexushealth.org",
    "contactPhone": "+1 (555) 432-8765",
    "contactRole": "Chief Information Officer",
    "industry": "Healthcare Technology",
    "source": "Referral",
    "stage": "Won",
    "dealSize": "$120,000 ARR",
    "estimatedAnnualValue": "$120,000 ARR",
    "aiScore": 98,
    "previousScore": 92,
    "scoreChange": 6,
    "conversionProbability": "Won",
    "conversionPercentage": 100,
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 1,
    "stagnationStatus": "normal",
    "companySize": "1,000-5,000 employees",
    "location": "Boston, MA",
    "leadOwner": "Alex Rivera",
    "createdDate": "Aug 28, 2026",
    "previousInteractions": "Closed enterprise contract after 35-day sales cycle and HIPAA audit.",
    "recommendedAction": "Account Handover to Customer Success",
    "actionReason": "Contract executed and first annual payment processed.",
    "actionCompleted": true,
    "lastActivity": "MSA & Order Form signed via DocuSign",
    "lastActivityDate": "Yesterday, 5:00 PM",
    "nextAction": "Introduce Senior Implementation Manager",
    "scoreBreakdown": {
      "explanation": "Deal finalized successfully with full multi-year commitment.",
      "positiveSignals": [
        {
          "signal": "MSA executed by procurement",
          "points": 30
        },
        {
          "signal": "Security & HIPAA compliance verified",
          "points": 20
        }
      ],
      "negativeSignals": []
    },
    "notes": [
      {
        "id": "n-won-1",
        "leadId": "lead-won-1",
        "author": "Alex Rivera",
        "date": "Yesterday at 5:15 PM",
        "content": "Signed 2-year enterprise agreement. Customer success kickoff scheduled for next Tuesday.",
        "aiSignals": [
          "Deal Won",
          "Customer Success Transition"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-won-1",
        "leadId": "lead-won-1",
        "leadCompany": "Nexus Health Analytics",
        "type": "stage_change",
        "title": "Deal Won: $120,000 ARR Closed",
        "description": "Contract counter-signed and invoice issued.",
        "timestamp": "Yesterday, 5:00 PM",
        "salesRep": "Alex Rivera",
        "impactScore": 30,
        "stage": "Won"
      }
    ]
  },
  {
    "id": "lead-won-2",
    "company": "Summit Logistics Group",
    "contactName": "Rachel Vance",
    "contactEmail": "rvance@summitlogistics.com",
    "contactPhone": "+1 (555) 765-4321",
    "contactRole": "VP of Transportation Tech",
    "industry": "Logistics & Supply Chain",
    "source": "Website",
    "stage": "Won",
    "dealSize": "$95,000 ARR",
    "estimatedAnnualValue": "$95,000 ARR",
    "aiScore": 96,
    "previousScore": 88,
    "scoreChange": 8,
    "conversionProbability": "Won",
    "conversionPercentage": 100,
    "priority": "hot",
    "engagementLevel": "High",
    "stageAgeDays": 4,
    "stagnationStatus": "normal",
    "companySize": "2,500-10,000 employees",
    "location": "Chicago, IL",
    "leadOwner": "Elena Rostova",
    "createdDate": "Sep 02, 2026",
    "previousInteractions": "Full fleet rollout across 12 distribution centers.",
    "recommendedAction": "Schedule 30-Day Check-in",
    "actionReason": "Onboarding completed ahead of schedule.",
    "actionCompleted": true,
    "lastActivity": "Initial API sync active",
    "lastActivityDate": "2 days ago",
    "nextAction": "Send executive gift kit and thank you note",
    "scoreBreakdown": {
      "explanation": "Customer onboarded smoothly with positive pilot validation.",
      "positiveSignals": [
        {
          "signal": "Annual contract closed",
          "points": 25
        },
        {
          "signal": "Immediate API activation",
          "points": 15
        }
      ],
      "negativeSignals": []
    },
    "notes": [],
    "activities": []
  },
  {
    "id": "lead-lost-1",
    "company": "OmniRetail Global",
    "contactName": "Brian Miller",
    "contactEmail": "bmiller@omniretail.com",
    "contactPhone": "+1 (555) 341-9988",
    "contactRole": "Director of Omnichannel",
    "industry": "Retail & E-commerce",
    "source": "Advertisement",
    "stage": "Lost",
    "dealSize": "$65,000 ARR",
    "estimatedAnnualValue": "$65,000 ARR",
    "aiScore": 28,
    "previousScore": 42,
    "scoreChange": -14,
    "conversionProbability": "Lost",
    "conversionPercentage": 0,
    "priority": "cold",
    "engagementLevel": "Low",
    "stageAgeDays": 8,
    "stagnationStatus": "normal",
    "companySize": "5,000+ enterprise",
    "location": "Dallas, TX",
    "leadOwner": "Sarah Chen",
    "createdDate": "Aug 15, 2026",
    "previousInteractions": "Customer chose internal ERP extension due to budget freezes.",
    "recommendedAction": "Archived: Nurture campaign in 6 months",
    "actionReason": "Budget freeze until Q2 2027 confirmed by finance.",
    "actionCompleted": true,
    "lastActivity": "Closed as Lost - Budget Freeze",
    "lastActivityDate": "Sep 18, 2026",
    "nextAction": "Add to quarterly re-engagement workflow",
    "scoreBreakdown": {
      "explanation": "Opportunity lost due to internal IT re-organization and corporate budget freeze.",
      "positiveSignals": [],
      "negativeSignals": [
        {
          "signal": "Budget frozen across IT operations",
          "points": -20
        },
        {
          "signal": "Decision postponed by 9 months",
          "points": -15
        }
      ]
    },
    "notes": [
      {
        "id": "n-lost-1",
        "leadId": "lead-lost-1",
        "author": "Sarah Chen",
        "date": "Sep 18, 2026",
        "content": "Brian informed us their board froze all software procurement until FY27. Revisit in April.",
        "aiSignals": [
          "Budget Freeze",
          "Closed Lost"
        ]
      }
    ],
    "activities": [
      {
        "id": "act-lost-1",
        "leadId": "lead-lost-1",
        "leadCompany": "OmniRetail Global",
        "type": "stage_change",
        "title": "Deal Closed Lost",
        "description": "Reason: Budget Freeze across retail division.",
        "timestamp": "Sep 18, 2026",
        "salesRep": "Sarah Chen",
        "impactScore": -14,
        "stage": "Lost"
      }
    ]
  },
  {
    "id": "lead-lost-2",
    "company": "Vanguard Media Systems",
    "contactName": "Chloe Bennett",
    "contactEmail": "cbennett@vanguardmedia.com",
    "contactPhone": "+1 (555) 902-3344",
    "contactRole": "Head of Content Operations",
    "industry": "Media & Publishing",
    "source": "LinkedIn",
    "stage": "Lost",
    "dealSize": "$42,000 ARR",
    "estimatedAnnualValue": "$42,000 ARR",
    "aiScore": 22,
    "previousScore": 35,
    "scoreChange": -13,
    "conversionProbability": "Lost",
    "conversionPercentage": 0,
    "priority": "cold",
    "engagementLevel": "Low",
    "stageAgeDays": 12,
    "stagnationStatus": "normal",
    "companySize": "100-250 employees",
    "location": "Los Angeles, CA",
    "leadOwner": "Marcus Vance",
    "createdDate": "Sep 01, 2026",
    "previousInteractions": "Selected in-house solution built on open-source tools.",
    "recommendedAction": "Archived: Lost to internal build",
    "actionReason": "Engineering department decided to maintain legacy Python script.",
    "actionCompleted": true,
    "lastActivity": "Disqualification notice received",
    "lastActivityDate": "Sep 20, 2026",
    "nextAction": "Archive lead record in LeadIQ",
    "scoreBreakdown": {
      "explanation": "Prospect chose to build in-house internal tool.",
      "positiveSignals": [],
      "negativeSignals": [
        {
          "signal": "Chose internal build alternative",
          "points": -18
        }
      ]
    },
    "notes": [],
    "activities": []
  }
];
