"""
ML Scoring Interface Abstraction for LeadIQ.
Provides a unified prediction protocol so the initial heuristic/behavioral scoring
can be seamlessly replaced by a trained ML model (e.g. XGBoost, LightGBM, CatBoost)
without altering service or API layers.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseScoringModel(ABC):
    @abstractmethod
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Takes behavioral and firmographic feature dictionary and returns:
        - score: int (0 to 100)
        - conversion_probability: float (0.0 to 1.0)
        - classification: str ('HOT', 'WARM', 'NURTURE', 'COLD')
        - engagement_level: str ('HIGH', 'MEDIUM', 'LOW')
        - positive_factors: list of dicts [{"factor": str, "impact": int}]
        - negative_factors: list of dicts [{"factor": str, "impact": int}]
        - model_version: str
        """
        pass

class RuleBasedDemoScoringModel(BaseScoringModel):
    """
    Initial transparent heuristic and behavioral rule engine.
    Calculates weights for quotations, demos, emails, proposals, and inactivity.
    """
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        base_score = 50
        positive_factors = []
        negative_factors = []

        # Feature extraction
        quotations_requested = features.get("quotation_requested", 0)
        demo_completed = features.get("demo_completed", False)
        emails_replied = features.get("emails_replied", 0)
        proposal_opened = features.get("proposal_opened", False)
        pricing_page_visits = features.get("pricing_page_visits", 0)
        stage = features.get("stage", "NEW").upper()
        days_in_stage = features.get("days_in_current_stage", 0)
        days_since_last_activity = features.get("days_since_last_activity", 0)
        status = features.get("status", "ACTIVE").upper()

        if status == "WON":
            return {
                "score": 100,
                "conversion_probability": 1.0,
                "classification": "HOT",
                "engagement_level": "HIGH",
                "positive_factors": [{"factor": "Deal successfully closed won", "impact": 50}],
                "negative_factors": [],
                "model_version": "heuristic_v2_won"
            }

        if status == "LOST":
            return {
                "score": 0,
                "conversion_probability": 0.0,
                "classification": "COLD",
                "engagement_level": "LOW",
                "positive_factors": [],
                "negative_factors": [{"factor": "Deal closed as lost opportunity", "impact": -50}],
                "model_version": "heuristic_v2_lost"
            }

        # Calibrated baseline for active in-flight leads
        score = 35
        positive_factors = []
        negative_factors = []

        # Positive behavioral contributors
        if quotations_requested > 0:
            impact = 9 * min(quotations_requested, 2)
            score += impact
            positive_factors.append({"factor": f"Formal pricing quotation requested ({quotations_requested}x)", "impact": impact})

        if demo_completed:
            score += 12
            positive_factors.append({"factor": "Executive product demo completed", "impact": 12})

        if emails_replied > 0:
            impact = 6 * min(emails_replied, 3)
            score += impact
            positive_factors.append({"factor": f"Direct inbound email replies ({emails_replied})", "impact": impact})

        if proposal_opened:
            score += 8
            positive_factors.append({"factor": "Commercial proposal reviewed in portal", "impact": 8})

        if pricing_page_visits > 0:
            impact = 4 * min(pricing_page_visits, 2)
            score += impact
            positive_factors.append({"factor": f"Commercial pricing page engagements ({pricing_page_visits}x)", "impact": impact})

        # Pipeline progression boost
        stage_weights = {
            "NEW": 0,
            "CONTACTED": 5,
            "QUALIFIED": 10,
            "DEMO": 16,
            "PROPOSAL": 22,
            "NEGOTIATION": 28
        }
        stage_boost = stage_weights.get(stage, 0)
        if stage_boost > 0:
            score += stage_boost
            positive_factors.append({"factor": f"Pipeline advanced to {stage.title()}", "impact": stage_boost})

        # Negative penalty factors (decay & stagnation)
        if days_since_last_activity > 7:
            penalty = -10
            score += penalty
            negative_factors.append({"factor": f"No touchpoint activity for {days_since_last_activity} days", "impact": penalty})
        elif days_since_last_activity >= 3:
            penalty = -4
            score += penalty
            negative_factors.append({"factor": f"No activity for {days_since_last_activity} days", "impact": penalty})

        if days_in_stage > 10:
            penalty = -8
            score += penalty
            negative_factors.append({"factor": f"Stage stagnation ({days_in_stage} days in {stage.title()})", "impact": penalty})
        elif days_in_stage > 5:
            penalty = -4
            score += penalty
            negative_factors.append({"factor": f"Stage slowing ({days_in_stage} days in current stage)", "impact": penalty})

        # Active leads bound between 15 and 94 (only won deals reach 100)
        final_score = max(15, min(94, score))

        # Realistic B2B conversion probability mapped by pipeline stage and behavioral score
        stage_base_prob = {
            "NEW": 0.15,
            "CONTACTED": 0.28,
            "QUALIFIED": 0.44,
            "DEMO": 0.58,
            "PROPOSAL": 0.72,
            "NEGOTIATION": 0.84
        }
        base_prob = stage_base_prob.get(stage, 0.30)
        prob_adjustment = (final_score - 60) * 0.003
        conversion_prob = round(max(0.08, min(0.88, base_prob + prob_adjustment)), 2)

        # Classification
        if final_score >= 80:
            classification = "HOT"
            engagement = "HIGH"
        elif final_score >= 60:
            classification = "WARM"
            engagement = "HIGH" if emails_replied > 1 or demo_completed else "MEDIUM"
        elif final_score >= 40:
            classification = "NURTURE"
            engagement = "MEDIUM"
        else:
            classification = "COLD"
            engagement = "LOW"

        return {
            "score": final_score,
            "conversion_probability": conversion_prob,
            "classification": classification,
            "engagement_level": engagement,
            "positive_factors": positive_factors,
            "negative_factors": negative_factors,
            "model_version": "heuristic_calibrated_v2"
        }

class FutureMLScoringModel(BaseScoringModel):
    """
    Placeholder for future trained Machine Learning model (XGBoost/LightGBM).
    When model weights/artefacts are trained on historical WON/LOST outcomes,
    instantiate and load this model here.
    """
    def __init__(self, model_artifact_path: str = ""):
        self.model_artifact_path = model_artifact_path
        self.is_loaded = False

    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        # Fallback to rule engine until trained weights are loaded
        fallback = RuleBasedDemoScoringModel()
        result = fallback.predict(features)
        result["model_version"] = "ml_fallback_v1"
        return result

# Global scoring model instance
default_scoring_model = RuleBasedDemoScoringModel()
