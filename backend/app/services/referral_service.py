from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.lead import Lead
from app.models.referral import Referral, ReferralStatus, RewardType, RewardStatus
from app.models.activity import Activity, ActivityType
from app.services.business_priority_service import format_inr
from app.schemas.referral import ReferralResponse, ReferralSummaryResponse, CustomerOption

class ReferralService:
    @staticmethod
    def _build_referral_response(ref: Referral) -> ReferralResponse:
        referrer_name = ref.referrer_customer.company_name if ref.referrer_customer else "Unknown Customer"
        referred_name = ref.referred_lead.company_name if ref.referred_lead else "Unknown Lead"
        referred_contact = ref.referred_lead.contact_name if ref.referred_lead else None
        deal_val = ref.deal_value if ref.deal_value > 0 else (ref.referred_lead.estimated_value if ref.referred_lead else 0.0)

        return ReferralResponse(
            id=ref.id,
            referrer_customer_id=ref.referrer_customer_id,
            referrer_company_name=referrer_name,
            referrer_public_lead_id=ref.referrer_customer.public_lead_id if ref.referrer_customer else None,
            referred_lead_id=ref.referred_lead_id,
            referred_company_name=referred_name,
            referred_public_lead_id=ref.referred_lead.public_lead_id if ref.referred_lead else None,
            referred_contact_name=referred_contact,
            referral_date=ref.referral_date,
            status=ref.status,
            reward_type=ref.reward_type,
            reward_value=ref.reward_value,
            reward_status=ref.reward_status,
            deal_value=deal_val,
            deal_value_formatted=format_inr(deal_val),
            notes=ref.notes,
            created_at=ref.created_at,
            updated_at=ref.updated_at
        )

    @staticmethod
    def get_customer_options(db: Session) -> List[CustomerOption]:
        """Returns existing accounts/leads that can act as referrers."""
        # Prioritize Won accounts, then active accounts
        leads = db.query(Lead).order_by(Lead.stage == "WON", Lead.company_name.asc()).all()
        return [
            CustomerOption(
                id=l.id,
                public_lead_id=l.public_lead_id,
                company_name=l.company_name,
                contact_name=l.contact_name,
                stage=l.stage
            )
            for l in leads
        ]

    @staticmethod
    def create_referral(
        db: Session,
        referrer_customer_id: str,
        referred_lead_id: str,
        reward_type: str = "PERCENTAGE_DISCOUNT",
        reward_value: float = 10.0,
        notes: Optional[str] = None
    ) -> Referral:
        referrer = db.query(Lead).filter(Lead.id == referrer_customer_id).first()
        referred = db.query(Lead).filter(Lead.id == referred_lead_id).first()

        if not referrer:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referrer customer not found")
        if not referred:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referred lead not found")

        # Set referred_by_id on lead
        referred.referred_by_id = referrer_customer_id
        referred.lead_source = "Referral"

        now = datetime.now(timezone.utc)
        deal_val = float(referred.estimated_value or 0.0)

        referral = Referral(
            referrer_customer_id=referrer_customer_id,
            referred_lead_id=referred_lead_id,
            referral_date=now,
            status=ReferralStatus.PENDING.value,
            reward_type=reward_type,
            reward_value=reward_value,
            reward_status=RewardStatus.PENDING.value,
            deal_value=deal_val,
            notes=notes,
            created_at=now,
            updated_at=now
        )
        db.add(referral)

        # Log referral creation activity on both leads
        ref_act = Activity(
            lead_id=referred_lead_id,
            user_id=referred.owner_id,
            activity_type=ActivityType.STAGE_CHANGE.value,
            description=f"Referred by existing customer {referrer.company_name} ({reward_value}% reward on conversion)",
            activity_date=now,
            activity_metadata={"referrer_id": referrer.id, "referrer_name": referrer.company_name}
        )
        db.add(ref_act)

        db.commit()
        db.refresh(referral)
        return referral

    @staticmethod
    def get_all_referrals(db: Session) -> List[ReferralResponse]:
        refs = db.query(Referral).order_by(Referral.created_at.desc()).all()
        return [ReferralService._build_referral_response(r) for r in refs]

    @staticmethod
    def get_referral_by_id(db: Session, referral_id: str) -> ReferralResponse:
        ref = db.query(Referral).filter(Referral.id == referral_id).first()
        if not ref:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referral record not found")
        return ReferralService._build_referral_response(ref)

    @staticmethod
    def get_referral_summary(db: Session) -> ReferralSummaryResponse:
        all_refs = db.query(Referral).all()
        total = len(all_refs)
        pending = sum(1 for r in all_refs if r.status == ReferralStatus.PENDING.value)
        eligible = sum(1 for r in all_refs if r.status in [ReferralStatus.REWARD_ELIGIBLE.value, ReferralStatus.CONVERTED.value])
        granted = [r for r in all_refs if r.status == ReferralStatus.REWARD_GRANTED.value]
        
        # Calculate approximate rewards granted value
        granted_sum = 0.0
        for r in granted:
            val = r.deal_value or (r.referred_lead.estimated_value if r.referred_lead else 0.0)
            if "PERCENTAGE" in r.reward_type:
                granted_sum += (val * (r.reward_value / 100.0))
            else:
                granted_sum += r.reward_value

        recent = [ReferralService._build_referral_response(r) for r in sorted(all_refs, key=lambda x: x.created_at, reverse=True)[:5]]

        return ReferralSummaryResponse(
            total_referrals=total,
            pending_referrals=pending,
            reward_eligible_referrals=eligible,
            rewards_granted_count=len(granted),
            rewards_granted_amount_formatted=format_inr(granted_sum),
            recent_referrals=recent
        )

    @staticmethod
    def check_and_trigger_won_reward(db: Session, lead_id: str) -> Optional[Referral]:
        """
        Called when a lead transitions to WON stage.
        If lead has a PENDING referral, sets status to REWARD_ELIGIBLE.
        """
        ref = db.query(Referral).filter(Referral.referred_lead_id == lead_id).first()
        if not ref:
            return None

        if ref.status == ReferralStatus.PENDING.value:
            now = datetime.now(timezone.utc)
            ref.status = ReferralStatus.REWARD_ELIGIBLE.value
            ref.reward_status = RewardStatus.ELIGIBLE.value
            ref.updated_at = now
            if ref.referred_lead:
                ref.deal_value = float(ref.referred_lead.estimated_value or 0.0)

            # Log activity on referrer customer
            referrer_act = Activity(
                lead_id=ref.referrer_customer_id,
                activity_type=ActivityType.STAGE_CHANGE.value,
                description=f"Referral reward unlocked: {ref.referred_lead.company_name if ref.referred_lead else 'Referred lead'} became WON customer! Reward: {ref.reward_value}% {ref.reward_type}",
                activity_date=now,
                activity_metadata={"referral_id": ref.id, "status": "REWARD_ELIGIBLE"}
            )
            db.add(referrer_act)
            db.commit()
            db.refresh(ref)
        return ref

    @staticmethod
    def grant_reward(db: Session, referral_id: str, note: Optional[str] = None) -> ReferralResponse:
        ref = db.query(Referral).filter(Referral.id == referral_id).first()
        if not ref:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Referral record not found")

        now = datetime.now(timezone.utc)
        ref.status = ReferralStatus.REWARD_GRANTED.value
        ref.reward_status = RewardStatus.GRANTED.value
        ref.updated_at = now
        if note:
            ref.notes = (ref.notes + "\n" if ref.notes else "") + f"Granted: {note}"

        # Log activity
        referrer_act = Activity(
            lead_id=ref.referrer_customer_id,
            activity_type=ActivityType.QUOTATION.value,
            description=f"Referral reward granted to {ref.referrer_customer.company_name if ref.referrer_customer else 'Customer'} for referring {ref.referred_lead.company_name if ref.referred_lead else 'Lead'}.",
            activity_date=now,
            activity_metadata={"referral_id": ref.id, "reward_status": "GRANTED"}
        )
        db.add(referrer_act)
        db.commit()
        db.refresh(ref)
        return ReferralService._build_referral_response(ref)

referral_service = ReferralService()
