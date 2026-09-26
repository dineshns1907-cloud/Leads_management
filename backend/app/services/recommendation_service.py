from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.lead import Lead
from app.models.pipeline import PipelineStage, LeadStatus
from app.models.recommendation import Recommendation
from app.models.activity import ActivityType
from app.schemas.recommendation import FocusLeadResponse

class RecommendationService:
    @staticmethod
    def generate_recommendation_for_lead(lead: Lead, score_val: int, conversion_prob: float) -> Dict[str, Any]:
        """
        Determines the optimal next sales intervention based on pipeline stage,
        engagement telemetry, time in stage, and deal momentum.
        """
        if lead.status == LeadStatus.WON.value:
            return {
                "action": "Initiate customer onboarding & CSM kickoff",
                "reason": "Deal successfully closed won; transition to customer success team",
                "urgency": "this_week",
                "category": "Contact"
            }

        if lead.status == LeadStatus.LOST.value:
            return {
                "action": "Archive deal & schedule 6-month nurture check-in",
                "reason": "Closed lost opportunity; maintain relationship for future cycles",
                "urgency": "this_week",
                "category": "Nurture"
            }

        activities = lead.activities or []
        has_demo = any(a.activity_type == ActivityType.DEMO.value for a in activities)
        has_quote = any(a.activity_type == ActivityType.QUOTATION.value for a in activities) or len(lead.quotations) > 0
        has_proposal = any(a.activity_type == ActivityType.PROPOSAL.value for a in activities) or len(lead.proposals) > 0
        days_in_stage = lead.days_in_current_stage

        stage = lead.stage.upper()

        if stage == PipelineStage.NEGOTIATION.value:
            if score_val >= 85:
                return {
                    "action": "Finalize commercial terms and routing for e-signature",
                    "reason": "High win probability ({}%); legal and procurement review complete".format(int(conversion_prob * 100)),
                    "urgency": "immediate",
                    "category": "Proposal"
                }
            return {
                "action": "Schedule executive sponsor alignment call",
                "reason": "Negotiation stage active; resolve procurement or budget blockers",
                "urgency": "today",
                "category": "Contact"
            }

        elif stage == PipelineStage.PROPOSAL.value:
            if has_quote:
                return {
                    "action": "Contact customer regarding quotation & proposal terms",
                    "reason": "Quotation requested + repeated proposal engagement telemetry",
                    "urgency": "immediate",
                    "category": "Proposal"
                }
            return {
                "action": "Follow up on proposal review with decision committee",
                "reason": "Proposal delivered; identify stakeholder questions before month-end",
                "urgency": "today",
                "category": "Follow-up"
            }

        elif stage == PipelineStage.DEMO.value:
            if has_demo:
                return {
                    "action": "Send formal enterprise quotation and ROI business case",
                    "reason": "Product demo completed with technical stakeholders; capitalize on momentum",
                    "urgency": "immediate",
                    "category": "Demo"
                }
            return {
                "action": "Conduct deep-dive product demo with key decision-makers",
                "reason": "Demo scheduled; highlight enterprise security & integration capabilities",
                "urgency": "today",
                "category": "Demo"
            }

        elif stage == PipelineStage.QUALIFIED.value:
            if days_in_stage > 7:
                return {
                    "action": "Escalate overdue opportunity & schedule live demonstration",
                    "reason": "Lead qualified but stalled in stage for {} days; risk of decay".format(days_in_stage),
                    "urgency": "immediate",
                    "category": "Demo"
                }
            return {
                "action": "Schedule discovery demo with technical architect",
                "reason": "BANT qualification confirmed; move deal forward into evaluation",
                "urgency": "today",
                "category": "Demo"
            }

        elif stage == PipelineStage.CONTACTED.value:
            return {
                "action": "Qualify decision-maker budget and project timeline",
                "reason": "Initial contact completed; confirm buying committee and timeframe",
                "urgency": "today",
                "category": "Contact"
            }

        else: # NEW
            return {
                "action": "Initiate first contact via tailored executive email",
                "reason": "Fresh inbound inquiry from {}; fast response increases win rate 3x".format(lead.lead_source),
                "urgency": "today",
                "category": "Contact"
            }

    @staticmethod
    def get_focus_leads(db: Session, limit: int = 15) -> List[FocusLeadResponse]:
        """
        Retrieves top leads requiring immediate sales focus based on:
        - score >= 80 (HOT)
        - high engagement
        - rapid score momentum
        - overdue follow-up / stagnation
        - active quotation / proposal activity
        (Excludes WON and LOST deals)
        """
        leads = db.query(Lead).filter(Lead.status == LeadStatus.ACTIVE.value).all()
        focus_items = []

        for lead in leads:
            score_obj = lead.latest_score
            score_val = score_obj.score if score_obj else 50
            prob_val = score_obj.conversion_probability if score_obj else 0.50
            classification = score_obj.classification if score_obj else "WARM"
            engagement = score_obj.engagement_level if score_obj else "MEDIUM"
            days_in_stage = lead.days_in_current_stage

            stagnation = "NORMAL"
            if days_in_stage > 10:
                stagnation = "CRITICAL"
            elif days_in_stage >= 6:
                stagnation = "WARNING"

            # Check eligibility for Focus Mode
            is_hot = score_val >= 80
            is_stagnant = stagnation in ("WARNING", "CRITICAL")
            has_urgent_stage = lead.stage in (PipelineStage.PROPOSAL.value, PipelineStage.NEGOTIATION.value)
            is_high_engagement = engagement == "HIGH"

            if is_hot or is_stagnant or has_urgent_stage or is_high_engagement:
                rec_info = RecommendationService.generate_recommendation_for_lead(lead, score_val, prob_val)
                
                # Determine focus rationale
                if is_hot and has_urgent_stage:
                    focus_reason = "High closing probability ({}%) with active proposal in pipeline".format(int(prob_val * 100))
                elif is_stagnant:
                    focus_reason = "Stage stagnation: {} days without movement in {}".format(days_in_stage, lead.stage.title())
                elif is_hot:
                    focus_reason = "Exceptional AI score ({}/100) and strong customer momentum".format(score_val)
                else:
                    focus_reason = "High buyer engagement across digital touchpoints"

                focus_items.append(FocusLeadResponse(
                    lead_id=lead.id,
                    company_name=lead.company_name,
                    contact_name=lead.contact_name,
                    contact_role=lead.contact_role,
                    industry=lead.industry,
                    estimated_value=lead.estimated_value,
                    stage=lead.stage,
                    score=score_val,
                    conversion_probability=prob_val,
                    probability=prob_val,
                    classification=classification,
                    engagement_level=engagement,
                    stagnation_status=stagnation,
                    days_in_current_stage=days_in_stage,
                    focus_reason=focus_reason,
                    reason=focus_reason,
                    recommended_action=rec_info["action"],
                    urgency=rec_info["urgency"],
                    lead={
                        "id": lead.id,
                        "company_name": lead.company_name,
                        "contact_name": lead.contact_name,
                        "stage": lead.stage,
                        "estimated_value": lead.estimated_value
                    }
                ))

        # Sort by urgency (immediate first) and score desc
        def sort_key(item: FocusLeadResponse):
            urgency_score = 3 if item.urgency == "immediate" else (2 if item.urgency == "today" else 1)
            return (urgency_score, item.score)

        focus_items.sort(key=sort_key, reverse=True)
        return focus_items[:limit]

recommendation_service = RecommendationService()
