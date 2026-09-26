from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.lead import Lead
from app.models.activity import Activity, ActivityType
from app.schemas.activity import ActivityCreate, ActivityResponse
from app.services.scoring_service import scoring_service

class ActivityService:
    @staticmethod
    def create_activity(db: Session, lead_id: str, activity_in: ActivityCreate, user_id: Optional[str] = None) -> ActivityResponse:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        now = activity_in.activity_date or datetime.now(timezone.utc)
        
        # Calculate impact score based on activity type
        impact_map = {
            ActivityType.QUOTATION.value: 18,
            ActivityType.DEMO.value: 15,
            ActivityType.EMAIL_RESPONSE.value: 12,
            ActivityType.PROPOSAL.value: 10,
            ActivityType.MEETING.value: 8,
            ActivityType.PRICING_PAGE_VISIT.value: 6,
            ActivityType.WEBSITE_VISIT.value: 4,
            ActivityType.CALL.value: 5,
            ActivityType.EMAIL.value: 2,
            ActivityType.STAGE_CHANGE.value: 8,
            ActivityType.FOLLOW_UP.value: 4
        }
        type_val = activity_in.activity_type.value if hasattr(activity_in.activity_type, 'value') else str(activity_in.activity_type)
        impact = impact_map.get(type_val, 0)

        meta = activity_in.activity_metadata or {}
        meta["score_impact"] = impact

        activity = Activity(
            lead_id=lead_id,
            user_id=user_id,
            activity_type=type_val,
            description=activity_in.description,
            activity_date=now,
            activity_metadata=meta
        )
        db.add(activity)

        # Update lead last activity timestamp
        lead.last_activity_at = now
        db.commit()
        db.refresh(activity)

        # Trigger dynamic score recalculation
        scoring_service.calculate_score_for_lead(db, lead, persist=True)

        return ActivityResponse(
            id=activity.id,
            lead_id=activity.lead_id,
            lead_public_id=lead.public_lead_id,
            user_id=activity.user_id,
            sales_rep_name=lead.owner.name if lead.owner else "System Auto-detect",
            lead_company_name=lead.company_name,
            activity_type=activity.activity_type,
            description=activity.description,
            activity_date=activity.activity_date,
            activity_metadata=activity.activity_metadata,
            score_impact=impact,
            created_at=activity.created_at
        )

    @staticmethod
    def get_lead_activities(db: Session, lead_id: str, limit: int = 50) -> List[ActivityResponse]:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        activities = db.query(Activity).filter(Activity.lead_id == lead_id).order_by(Activity.activity_date.desc()).limit(limit).all()
        return [
            ActivityResponse(
                id=a.id,
                lead_id=a.lead_id,
                lead_public_id=lead.public_lead_id,
                user_id=a.user_id,
                sales_rep_name=a.user.name if a.user else (lead.owner.name if lead.owner else "Sales Representative"),
                lead_company_name=lead.company_name,
                activity_type=a.activity_type,
                description=a.description,
                activity_date=a.activity_date,
                activity_metadata=a.activity_metadata,
                score_impact=a.activity_metadata.get("score_impact") if a.activity_metadata else None,
                created_at=a.created_at
            ) for a in activities
        ]

    @staticmethod
    def get_all_activities(
        db: Session,
        activity_type: Optional[str] = None,
        lead_id: Optional[str] = None,
        user_id: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        limit: int = 100
    ) -> List[ActivityResponse]:
        query = db.query(Activity)

        if activity_type and activity_type.lower() != "all":
            query = query.filter(Activity.activity_type == activity_type.upper())
        if lead_id:
            query = query.filter(Activity.lead_id == lead_id)
        if user_id:
            query = query.filter(Activity.user_id == user_id)
        if date_from:
            query = query.filter(Activity.activity_date >= date_from)
        if date_to:
            query = query.filter(Activity.activity_date <= date_to)

        activities = query.order_by(Activity.activity_date.desc()).limit(limit).all()

        results = []
        for a in activities:
            lead = a.lead
            results.append(ActivityResponse(
                id=a.id,
                lead_id=a.lead_id,
                lead_public_id=lead.public_lead_id if lead else None,
                user_id=a.user_id,
                sales_rep_name=a.user.name if a.user else (lead.owner.name if lead and lead.owner else "Sales Representative"),
                lead_company_name=lead.company_name if lead else "Unknown",
                activity_type=a.activity_type,
                description=a.description,
                activity_date=a.activity_date,
                activity_metadata=a.activity_metadata,
                score_impact=a.activity_metadata.get("score_impact") if a.activity_metadata else None,
                created_at=a.created_at
            ))
        return results

activity_service = ActivityService()
