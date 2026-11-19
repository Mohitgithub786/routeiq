import logging
import sys
from typing import Optional


def setup_logger(name: str = "enterprise_mcp_router", level: Optional[str] = None) -> logging.Logger:
    """Configures and returns a structured logger with clean formatting."""
    log_level = (level or "INFO").upper()
    numeric_level = getattr(logging, log_level, logging.INFO)

    logger = logging.getLogger(name)
    logger.setLevel(numeric_level)

    # Avoid duplicate handlers if already configured
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(numeric_level)
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-7s | [%(name)s] [%(filename)s:%(lineno)d] - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


logger = setup_logger()
