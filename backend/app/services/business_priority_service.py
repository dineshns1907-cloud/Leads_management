from typing import Dict, Any, List, Tuple
from app.models.lead import Lead

def format_inr(val: float) -> str:
    """Formats a currency amount into standard Indian Lakhs / Crores or clean commas."""
    if not val or val <= 0:
        return "₹0"
    if val >= 10000000:
        return f"₹{val / 10000000:.1f} Cr"
    elif val >= 100000:
        lakhs = val / 100000
        return f"₹{int(lakhs)}L" if lakhs.is_integer() else f"₹{lakhs:.1f}L"
    elif val >= 1000:
        return f"₹{int(val):,}"
    return f"₹{int(val)}"

def normalize_investment(val: float) -> Tuple[float, float]:
    """
    Normalizes expected investment value to 0-100 scale.
    Returns (normalized_score, effective_inr_value).
    """
    if not val or val <= 0:
        return 0.0, 0.0

    # If in USD scale (< 200,000), convert to INR equivalent (1 USD ~ 83 INR) for uniform scoring
    effective_inr = val * 83.0 if val < 200000 else float(val)

    if effective_inr <= 500000:
        norm = max(10.0, (effective_inr / 500000.0) * 50.0)
    elif effective_inr <= 2500000:
        # Scale smoothly between 5L (50) and 25L (95)
        norm = 50.0 + ((effective_inr - 500000.0) / 2000000.0) * 45.0
    else:
        # Scale from 25L (95) to 30L+ (100)
        norm = min(100.0, 95.0 + ((effective_inr - 2500000.0) / 500000.0) * 5.0)

    return round(norm, 1), effective_inr

# In-memory settings storage
_current_scoring_settings: Dict[str, Any] = {
    "pricing_quotation_requested": 18,
    "product_demo_completed": 15,
    "email_response": 12,
    "commercial_proposal_opened": 10,
    "executive_meeting_booked": 8,
    "pricing_page_visited": 6,
    "inactivity_decay": -12,
    "followup_unopened_decay": -8,
    "interest_weight": 0.40,
    "conversion_weight": 0.30,
    "investment_weight": 0.30
}

def get_business_priority_weights() -> Dict[str, float]:
    return {
        "interest_weight": float(_current_scoring_settings.get("interest_weight", 0.40)),
        "conversion_weight": float(_current_scoring_settings.get("conversion_weight", 0.30)),
        "investment_weight": float(_current_scoring_settings.get("investment_weight", 0.30))
    }

def get_current_scoring_settings() -> Dict[str, Any]:
    return dict(_current_scoring_settings)

def set_current_scoring_settings(settings: Dict[str, Any]) -> None:
    global _current_scoring_settings
    _current_scoring_settings.update(settings)

def calculate_business_priority(
    lead: Lead,
    ai_score: int,
    conversion_prob: float,
    weights: Dict[str, float] = None
) -> Dict[str, Any]:
    """
    Revenue-Aware Business Priority Score combining:
    - 40% Interest / Engagement (from AI lead score)
    - 30% Conversion Probability
    - 30% Expected Investment Potential

    Weights are fully configurable via settings.
    """
    if weights is None:
        weights = {
            "interest_weight": 0.40,
            "conversion_weight": 0.30,
            "investment_weight": 0.30
        }

    w_interest = float(weights.get("interest_weight", 0.40))
    w_conv = float(weights.get("conversion_weight", 0.30))
    w_inv = float(weights.get("investment_weight", 0.30))

    deal_value = float(lead.estimated_value or 0.0)
    norm_inv, effective_inr = normalize_investment(deal_value)

    # Conversion score on 0-100 scale
    conv_score = float(conversion_prob) * 100.0 if conversion_prob <= 1.0 else float(conversion_prob)
    interest_score = float(ai_score)

    raw_score = (w_interest * interest_score) + (w_conv * conv_score) + (w_inv * norm_inv)
    final_score = int(round(min(100.0, max(0.0, raw_score))))

    # Priority Tier (VERY HIGH >= 85, HIGH >= 70, MEDIUM >= 45, LOW < 45)
    if final_score >= 85:
        tier = "VERY HIGH"
    elif final_score >= 70:
        tier = "HIGH"
    elif final_score >= 45:
        tier = "MEDIUM"
    else:
        tier = "LOW"

    # Algorithmic reasons explaining WHY this lead is prioritized
    factors: List[str] = []
    if interest_score >= 80:
        factors.append(f"High customer engagement (Score: {int(interest_score)}/100)")
    elif interest_score >= 60:
        factors.append("Moderate engagement momentum")
    else:
        factors.append("Early engagement phase")

    if conv_score >= 75:
        factors.append(f"Strong conversion probability ({int(conv_score)}%)")
    elif conv_score >= 50:
        factors.append(f"Moderate conversion probability ({int(conv_score)}%)")

    if effective_inr >= 2500000:
        factors.append(f"Large expected investment ({format_inr(effective_inr)})")
    elif effective_inr >= 800000:
        factors.append(f"Substantial deal size ({format_inr(effective_inr)})")
    elif effective_inr > 0:
        factors.append(f"Expected investment: {format_inr(effective_inr)}")

    stage = str(lead.stage).upper() if lead.stage else "NEW"
    activities = lead.activities or []
    has_demo = any(a.activity_type == "DEMO" for a in activities)
    has_proposal = any(a.activity_type == "PROPOSAL" for a in activities)

    if has_proposal or stage in ["PROPOSAL", "NEGOTIATION"]:
        factors.append("Recent commercial proposal review activity")
    elif has_demo or stage == "DEMO":
        factors.append("Executive product demo completed")

    if stage in ["QUALIFIED", "DEMO", "PROPOSAL", "NEGOTIATION"]:
        factors.append(f"Active pipeline progression ({stage.title()} stage)")

    action = "Focus on this lead first." if final_score >= 75 else "Nurture with targeted product insights."

    return {
        "score": final_score,
        "tier": tier,
        "factors": factors,
        "recommended_action": action,
        "expected_investment_formatted": format_inr(effective_inr),
        "investment_score": norm_inv,
        "weights_used": {
            "interest": w_interest,
            "conversion": w_conv,
            "investment": w_inv
        }
    }
