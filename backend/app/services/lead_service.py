from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc, text
from fastapi import HTTPException, status
from app.models.lead import Lead
from app.models.pipeline import PipelineStage, LeadStatus
from app.models.activity import Activity, ActivityType
from app.models.pipeline_history import PipelineHistory
from app.models.user import User
from app.schemas.lead import LeadCreate, LeadUpdate, LeadResponse, LeadDetailResponse
from app.schemas.score import ScoreBreakdown, ScoreFactor
from app.schemas.activity import ActivityResponse
from app.schemas.note import NoteResponse
from app.services.scoring_service import scoring_service
from app.services.recommendation_service import recommendation_service
from app.services.business_priority_service import calculate_business_priority, format_inr, get_business_priority_weights
from app.models.referral import Referral
from app.services.referral_service import referral_service

class LeadService:
    @staticmethod
    def _compute_stagnation(days_in_stage: int) -> str:
        if days_in_stage > 10:
            return "CRITICAL"
        elif days_in_stage >= 6:
            return "WARNING"
        return "NORMAL"

    @staticmethod
    def _build_lead_response(lead: Lead) -> LeadResponse:
        score_obj = lead.latest_score
        score_val = score_obj.score if score_obj else 50
        prob_val = score_obj.conversion_probability if score_obj else 0.50
        classification = score_obj.classification if score_obj else "WARM"
        engagement = score_obj.engagement_level if score_obj else "MEDIUM"
        days_in_stage = lead.days_in_current_stage
        stagnation = LeadService._compute_stagnation(days_in_stage)

        rec = recommendation_service.generate_recommendation_for_lead(lead, score_val, prob_val)

        # Feature 1: Revenue-Aware Business Priority Score
        bp = calculate_business_priority(
            lead=lead,
            ai_score=score_val,
            conversion_prob=prob_val,
            weights=get_business_priority_weights()
        )

        deal_val = float(lead.estimated_value or 0.0)
        referrer_company = lead.referrer.company_name if hasattr(lead, 'referrer') and lead.referrer else None

        return LeadResponse(
            id=lead.id,
            public_lead_id=lead.public_lead_id,
            company_name=lead.company_name,
            contact_name=lead.contact_name,
            contact_email=lead.contact_email,
            contact_phone=lead.contact_phone,
            industry=lead.industry,
            company_size=lead.company_size,
            location=lead.location,
            contact_role=lead.contact_role,
            lead_source=lead.lead_source,
            estimated_value=deal_val,
            expected_investment=deal_val,
            expected_investment_formatted=bp.get("expected_investment_formatted", format_inr(deal_val)),
            stage=lead.stage,
            status=lead.status,
            owner_id=lead.owner_id,
            owner_name=lead.owner.name if lead.owner else None,
            referred_by_id=lead.referred_by_id,
            referred_by_company=referrer_company,
            ai_score=score_val,
            conversion_probability=prob_val,
            classification=classification,
            engagement_level=engagement,
            days_in_current_stage=days_in_stage,
            total_days_in_pipeline=lead.total_days_in_pipeline,
            stagnation_status=stagnation,
            recommended_action=bp.get("recommended_action") or rec.get("action"),
            business_priority_score=bp["score"],
            business_priority_tier=bp["tier"],
            business_priority_factors=bp["factors"],
            last_activity_at=lead.last_activity_at,
            created_at=lead.created_at,
            updated_at=lead.updated_at
        )

    @staticmethod
    def get_leads(
        db: Session,
        search: Optional[str] = None,
        stage: Optional[str] = None,
        source: Optional[str] = None,
        industry: Optional[str] = None,
        score_min: Optional[int] = None,
        score_max: Optional[int] = None,
        classification: Optional[str] = None,
        engagement: Optional[str] = None,
        owner_id: Optional[str] = None,
        status_filter: Optional[str] = None,
        sort_by: str = "score",
        sort_order: str = "desc",
        page: int = 1,
        page_size: int = 50
    ) -> Tuple[List[LeadResponse], int]:
        query = db.query(Lead)

        if search:
            s = f"%{search.lower()}%"
            query = query.filter(
                or_(
                    Lead.company_name.ilike(s),
                    Lead.contact_name.ilike(s),
                    Lead.contact_email.ilike(s),
                    Lead.industry.ilike(s),
                    Lead.public_lead_id.ilike(s)
                )
            )

        if stage and stage.lower() != "all":
            query = query.filter(Lead.stage == stage.upper())

        if status_filter and status_filter.lower() != "all":
            query = query.filter(Lead.status == status_filter.upper())

        if source and source.lower() != "all":
            query = query.filter(Lead.lead_source.ilike(f"%{source}%"))

        if industry and industry.lower() != "all":
            query = query.filter(Lead.industry.ilike(f"%{industry}%"))

        if owner_id:
            query = query.filter(Lead.owner_id == owner_id)

        all_leads = query.all()
        responses = [LeadService._build_lead_response(lead) for lead in all_leads]

        # In-memory filtering for computed properties (score, classification, engagement)
        if score_min is not None:
            responses = [r for r in responses if r.ai_score >= score_min]
        if score_max is not None:
            responses = [r for r in responses if r.ai_score <= score_max]
        if classification and classification.lower() != "all":
            responses = [r for r in responses if r.classification.upper() == classification.upper()]
        if engagement and engagement.lower() != "all":
            responses = [r for r in responses if r.engagement_level.upper() == engagement.upper()]

        # Sorting
        reverse = (sort_order.lower() == "desc")
        if sort_by == "score":
            responses.sort(key=lambda x: x.ai_score, reverse=reverse)
        elif sort_by == "value":
            responses.sort(key=lambda x: x.estimated_value, reverse=reverse)
        elif sort_by == "days":
            responses.sort(key=lambda x: x.days_in_current_stage, reverse=reverse)
        elif sort_by == "company":
            responses.sort(key=lambda x: x.company_name.lower(), reverse=reverse)
        else:
            responses.sort(key=lambda x: x.created_at, reverse=reverse)

        total_count = len(responses)
        start = (page - 1) * page_size
        end = start + page_size
        paged_leads = responses[start:end]

        return paged_leads, total_count

    @staticmethod
    def get_lead_by_id(db: Session, lead_id: str) -> LeadDetailResponse:
        lead = db.query(Lead).filter(or_(Lead.id == lead_id, Lead.public_lead_id == lead_id)).first()
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        base_res = LeadService._build_lead_response(lead)

        # Build Score Breakdown
        score_obj = lead.latest_score or scoring_service.calculate_score_for_lead(db, lead, persist=True)
        raw_factors = score_obj.score_factors or {}
        pos = [ScoreFactor(**f) for f in raw_factors.get("positive_factors", [])]
        neg = [ScoreFactor(**f) for f in raw_factors.get("negative_factors", [])]

        score_breakdown = ScoreBreakdown(
            score=score_obj.score,
            conversion_probability=score_obj.conversion_probability,
            classification=score_obj.classification,
            engagement_level=score_obj.engagement_level,
            positive_factors=pos,
            negative_factors=neg,
            explanation=f"Algorithmic score of {score_obj.score}/100 based on {len(pos)} positive momentum factors and {len(neg)} friction risks."
        )

        # Recent activities (newest first)
        activities = [
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
            ) for a in lead.activities[:20]
        ]

        # Notes
        notes = [
            NoteResponse(
                id=n.id,
                lead_id=n.lead_id,
                user_id=n.user_id,
                author_name=n.user.name if n.user else "Sales Representative",
                content=n.content,
                ai_signals=n.ai_signals or [],
                created_at=n.created_at,
                updated_at=n.updated_at
            ) for n in lead.notes
        ]

        rec = recommendation_service.generate_recommendation_for_lead(lead, score_obj.score, score_obj.conversion_probability)

        # Pipeline history (from pipeline_history or stage change activities)
        if lead.pipeline_history:
            stage_changes = [
                {
                    "stage": h.new_stage,
                    "previous_stage": h.previous_stage,
                    "date": h.changed_at.isoformat(),
                    "changed_by": h.changed_by
                }
                for h in lead.pipeline_history
            ]
        else:
            stage_changes = [
                {
                    "stage": a.activity_metadata.get("new_stage", a.activity_metadata.get("stage", lead.stage)),
                    "date": a.activity_date.isoformat(),
                    "note": a.description
                }
                for a in lead.activities if a.activity_type == ActivityType.STAGE_CHANGE.value
            ]

        referral_info = None
        ref = db.query(Referral).filter(Referral.referred_lead_id == lead.id).first()
        if ref:
            referral_info = {
                "referral_id": ref.id,
                "source": "Referral",
                "referrer_id": ref.referrer_customer_id,
                "referrer_name": ref.referrer_customer.company_name if ref.referrer_customer else "Customer",
                "referrer_public_lead_id": ref.referrer_customer.public_lead_id if ref.referrer_customer else None,
                "referred_lead_id": lead.id,
                "referred_public_lead_id": lead.public_lead_id,
                "referral_date": ref.referral_date.strftime("%d %b %Y"),
                "status": ref.status,
                "reward_type": ref.reward_type,
                "reward_value": ref.reward_value,
                "reward_status": ref.reward_status,
                "potential_reward": f"{ref.reward_value}% Discount" if "PERCENTAGE" in ref.reward_type else f"{format_inr(ref.reward_value)} Discount"
            }

        return LeadDetailResponse(
            **base_res.model_dump(),
            score_breakdown=score_breakdown,
            recent_activities=activities,
            notes=notes,
            recommended_action_reason=rec.get("reason"),
            pipeline_history=stage_changes,
            referral_info=referral_info
        )

    @staticmethod
    def create_lead(db: Session, lead_in: LeadCreate, owner_id: Optional[str] = None) -> LeadResponse:
        now = datetime.now(timezone.utc)
        stage_val = lead_in.stage.value if hasattr(lead_in.stage, 'value') else str(lead_in.stage)
        status_val = lead_in.status.value if hasattr(lead_in.status, 'value') else str(lead_in.status)

        deal_val = float(lead_in.expected_investment if lead_in.expected_investment is not None and lead_in.expected_investment > 0 else lead_in.estimated_value)

        # Generate atomic unique public Lead ID (e.g. LEAD-000001, LEAD-000002)
        seq_res = db.execute(text("INSERT INTO lead_sequences (created_at) VALUES (NOW())"))
        seq_id = seq_res.lastrowid
        public_lead_id = f"LEAD-{seq_id:06d}"

        lead = Lead(
            public_lead_id=public_lead_id,
            company_name=lead_in.company_name,
            contact_name=lead_in.contact_name,
            contact_email=lead_in.contact_email,
            contact_phone=lead_in.contact_phone,
            industry=lead_in.industry,
            company_size=lead_in.company_size,
            location=lead_in.location,
            contact_role=lead_in.contact_role,
            lead_source=lead_in.lead_source,
            estimated_value=deal_val,
            stage=stage_val,
            status=status_val,
            owner_id=lead_in.owner_id or owner_id,
            referred_by_id=lead_in.referred_by_id,
            created_at=now,
            updated_at=now,
            last_activity_at=now,
            stage_entered_at=now
        )
        db.add(lead)
        db.commit()
        db.refresh(lead)

        # If lead has referral information, automatically record in referrals table
        if lead_in.referred_by_id or lead_in.lead_source.lower() == "referral":
            if lead_in.referred_by_id:
                try:
                    referral_service.create_referral(
                        db=db,
                        referrer_customer_id=lead_in.referred_by_id,
                        referred_lead_id=lead.id,
                        reward_type="PERCENTAGE_DISCOUNT",
                        reward_value=10.0,
                        notes=f"Referral for {lead.company_name} ({lead.public_lead_id})"
                    )
                except Exception as e:
                    pass

        # Initial creation activity associated with Lead ID
        init_act = Activity(
            lead_id=lead.id,
            user_id=owner_id,
            activity_type=ActivityType.STAGE_CHANGE.value,
            description=f"[{lead.public_lead_id}] Lead created in {lead.stage} stage via {lead.lead_source}",
            activity_date=now,
            activity_metadata={"stage": lead.stage, "score_impact": 10, "lead_public_id": lead.public_lead_id}
        )
        db.add(init_act)

        # Initial pipeline history record
        init_history = PipelineHistory(
            lead_id=lead.id,
            previous_stage=None,
            new_stage=lead.stage,
            changed_by=owner_id,
            changed_at=now
        )
        db.add(init_history)
        db.commit()

        # Compute initial score
        scoring_service.calculate_score_for_lead(db, lead, persist=True)
        db.refresh(lead)

        return LeadService._build_lead_response(lead)

    @staticmethod
    def update_lead(db: Session, lead_id: str, lead_update: LeadUpdate, current_user: Optional[User] = None) -> LeadResponse:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        update_data = lead_update.model_dump(exclude_unset=True)
        now = datetime.now(timezone.utc)

        # If stage is changed via generic update
        if "stage" in update_data and update_data["stage"] != lead.stage:
            old_stage = lead.stage
            new_stage = update_data["stage"].value if hasattr(update_data["stage"], 'value') else str(update_data["stage"])
            lead.stage = new_stage
            lead.stage_entered_at = now

            if new_stage == PipelineStage.WON.value:
                lead.status = LeadStatus.WON.value
            elif new_stage == PipelineStage.LOST.value:
                lead.status = LeadStatus.LOST.value
            else:
                lead.status = LeadStatus.ACTIVE.value

            # Record stage change activity
            act = Activity(
                lead_id=lead.id,
                user_id=current_user.id if current_user else lead.owner_id,
                activity_type=ActivityType.STAGE_CHANGE.value,
                description=f"Stage updated from {old_stage} to {new_stage}",
                activity_date=now,
                activity_metadata={"old_stage": old_stage, "new_stage": new_stage, "score_impact": 8}
            )
            db.add(act)

            # Record pipeline history
            history = PipelineHistory(
                lead_id=lead.id,
                previous_stage=old_stage,
                new_stage=new_stage,
                changed_by=current_user.id if current_user else lead.owner_id,
                changed_at=now
            )
            db.add(history)

        for field, value in update_data.items():
            if field != "stage":
                if hasattr(value, 'value'):
                    value = value.value
                setattr(lead, field, value)

        lead.updated_at = now
        db.commit()
        db.refresh(lead)

        # Recalculate score
        scoring_service.calculate_score_for_lead(db, lead, persist=True)
        return LeadService._build_lead_response(lead)

    @staticmethod
    def update_lead_stage(db: Session, lead_id: str, new_stage: str, note: Optional[str] = None, user_id: Optional[str] = None) -> LeadResponse:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

        old_stage = lead.stage
        new_stage_str = new_stage.value if hasattr(new_stage, 'value') else str(new_stage).upper()
        now = datetime.now(timezone.utc)

        lead.stage = new_stage_str
        lead.stage_entered_at = now
        lead.last_activity_at = now
        lead.updated_at = now

        if new_stage_str == PipelineStage.WON.value:
            lead.status = LeadStatus.WON.value
        elif new_stage_str == PipelineStage.LOST.value:
            lead.status = LeadStatus.LOST.value
        else:
            lead.status = LeadStatus.ACTIVE.value

        desc = f"Stage transitioned from {old_stage} to {new_stage_str}"
        if note:
            desc += f": {note}"

        act = Activity(
            lead_id=lead.id,
            user_id=user_id or lead.owner_id,
            activity_type=ActivityType.STAGE_CHANGE.value,
            description=desc,
            activity_date=now,
            activity_metadata={"old_stage": old_stage, "new_stage": new_stage_str, "score_impact": 8}
        )
        db.add(act)

        # Record pipeline history
        history = PipelineHistory(
            lead_id=lead.id,
            previous_stage=old_stage,
            new_stage=new_stage_str,
            changed_by=user_id or lead.owner_id,
            changed_at=now
        )
        db.add(history)

        db.commit()
        db.refresh(lead)

        # Recalculate score
        scoring_service.calculate_score_for_lead(db, lead, persist=True)
        db.refresh(lead)

        # Feature 2: Check and trigger referral reward when lead is marked WON
        if new_stage_str == PipelineStage.WON.value:
            try:
                referral_service.check_and_trigger_won_reward(db, lead.id)
            except Exception as e:
                pass

        return LeadService._build_lead_response(lead)

    @staticmethod
    def delete_lead(db: Session, lead_id: str) -> bool:
        lead = db.query(Lead).filter(Lead.id == lead_id).first()
        if not lead:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
        db.delete(lead)
        db.commit()
        return True

lead_service = LeadService()
