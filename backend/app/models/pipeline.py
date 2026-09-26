import enum

class PipelineStage(str, enum.Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    QUALIFIED = "QUALIFIED"
    DEMO = "DEMO"
    PROPOSAL = "PROPOSAL"
    NEGOTIATION = "NEGOTIATION"
    WON = "WON"
    LOST = "LOST"

class LeadStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    WON = "WON"
    LOST = "LOST"

class StagnationStatus(str, enum.Enum):
    NORMAL = "NORMAL"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"

class LeadPriority(str, enum.Enum):
    HOT = "HOT"
    WARM = "WARM"
    NURTURE = "NURTURE"
    COLD = "COLD"

class EngagementLevel(str, enum.Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
