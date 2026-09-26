from __future__ import annotations

from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.modules.market_validation.leads.models import MarketLead
from app.modules.market_validation.booking_intent.models import MarketBookingIntent
from app.modules.market_validation.provider_response.models import MarketProviderResponse
from app.modules.market_validation.transactions.models import (
    MarketTransaction,
    MarketTransactionFeedback,
)
from app.modules.market_validation.conversion.models import MarketConversion


class TransactionAnalysisRepository:
    pass
