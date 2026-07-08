# services/usage_tracker.py
"""
Simple in-memory usage counter for gating the 'pro' tier.

NOTE: in-memory means this resets on every server restart and is NOT
shared across multiple worker processes/instances. Fine for local
testing and a single-instance server — swap for a Redis/DB-backed
counter before running multiple workers or scaling horizontally.
"""

from fastapi import HTTPException

PREMIUM_LIMIT = 3  # Allow 3 "pro" tier generations per server session

usage_counter = {"pro": 0}


def check_and_increment_pro_usage() -> dict:
    """Call this right before a 'pro' tier generation. Raises 429 if the
    session limit has already been reached; otherwise increments the count
    and returns the fresh usage stats so the caller can pass them straight
    back to the frontend alongside the generated itinerary."""
    if usage_counter["pro"] >= PREMIUM_LIMIT:
        raise HTTPException(
            status_code=429,
            detail=f"Pro tier limit reached ({PREMIUM_LIMIT} uses per session). "
                   f"Please use Standard or restart the server.",
        )
    usage_counter["pro"] += 1
    return get_pro_usage_stats()


def reset_pro_usage() -> None:
    usage_counter["pro"] = 0


def get_pro_usage_stats() -> dict:
    return {
        "premium_usage": usage_counter["pro"],
        "premium_limit": PREMIUM_LIMIT,
        "remaining": PREMIUM_LIMIT - usage_counter["pro"],
    }