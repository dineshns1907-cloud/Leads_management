from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.lead import Lead
from app.models.activity import Activity, ActivityType
from app.models.lead_score import LeadScore
from app.ml.scoring_interface import default_scoring_model

class ScoringService:
    @staticmethod
    def extract_behavioral_features(db: Session, lead: Lead) -> Dict[str, Any]:
        """
        Calculates dynamic behavioral metrics from actual database activities.
        Does not rely on hardcoded static values.
        """
        activities = lead.activities or []

        emails_sent = sum(1 for a in activities if a.activity_type == ActivityType.EMAIL.value)
        emails_replied = sum(1 for a in activities if a.activity_type == ActivityType.EMAIL_RESPONSE.value)
        calls_completed = sum(1 for a in activities if a.activity_type == ActivityType.CALL.value)
        meetings_completed = sum(1 for a in activities if a.activity_type == ActivityType.MEETING.value)
        demo_completed = any(a.activity_type == ActivityType.DEMO.value for a in activities)
        quotation_requested = sum(1 for a in activities if a.activity_type == ActivityType.QUOTATION.value) or len(lead.quotations)
        proposal_opened = any(a.activity_type == ActivityType.PROPOSAL.value for a in activities) or any(p.opened_at is not None for p in lead.proposals)
        pricing_page_visits = sum(1 for a in activities if a.activity_type == ActivityType.PRICING_PAGE_VISIT.value)
        website_visits = sum(1 for a in activities if a.activity_type == ActivityType.WEBSITE_VISIT.value)

        # Days calculations
        now = datetime.now(timezone.utc)
        last_act = lead.last_activity_at.replace(tzinfo=timezone.utc if lead.last_activity_at.tzinfo is None else lead.last_activity_at.tzinfo) if lead.last_activity_at else now
        days_since_last_activity = max(0, (now - last_act).days)

        return {
            "emails_sent": emails_sent,
            "emails_replied": emails_replied,
            "calls_completed": calls_completed,
            "meetings_completed": meetings_completed,
            "demo_completed": demo_completed,
            "quotation_requested": quotation_requested,
            "proposal_opened": proposal_opened,
            "pricing_page_visits": pricing_page_visits,
            "website_visits": website_visits,
            "stage": lead.stage,
            "status": lead.status,
            "days_in_current_stage": lead.days_in_current_stage,
            "total_days_in_pipeline": lead.total_days_in_pipeline,
            "days_since_last_activity": days_since_last_activity,
            "estimated_value": lead.estimated_value,
            "industry": lead.industry,
            "lead_source": lead.lead_source
        }

    @staticmethod
    def calculate_score_for_lead(db: Session, lead: Lead, persist: bool = True) -> LeadScore:
        """
        Calculates and persists the AI score for a given lead.
        """
        features = ScoringService.extract_behavioral_features(db, lead)
        prediction = default_scoring_model.predict(features)

        positive_factors = prediction.get("positive_factors", [])
        negative_factors = prediction.get("negative_factors", [])

        positive_score = sum(f["impact"] for f in positive_factors)
        negative_score = sum(abs(f["impact"]) for f in negative_factors)

        lead_score = LeadScore(
            lead_id=lead.id,
            score=prediction["score"],
            conversion_probability=prediction["conversion_probability"],
            classification=prediction["classification"],
            engagement_level=prediction["engagement_level"],
            positive_score=positive_score,
            negative_score=negative_score,
            score_factors={
                "positive_factors": positive_factors,
                "negative_factors": negative_factors
            },
            calculated_at=datetime.now(timezone.utc)
        )

        if persist:
            db.add(lead_score)
            db.commit()
            db.refresh(lead_score)

        return lead_score

    @staticmethod
    def get_latest_score(db: Session, lead_id: str) -> LeadScore:
        score = db.query(LeadScore).filter(LeadScore.lead_id == lead_id).order_by(LeadScore.calculated_at.desc()).first()
        if not score:
            lead = db.query(Lead).filter(Lead.id == lead_id).first()
            if lead:
                score = ScoringService.calculate_score_for_lead(db, lead, persist=True)
        return score

scoring_service = ScoringService()
