"""
Utility Functions
Helper functions used across the recommendation system.
"""

import pandas as pd
import numpy as np
import os
import json
from datetime import datetime


def ensure_dir(directory: str) -> str:
    """Ensure directory exists, create if not."""
    os.makedirs(directory, exist_ok=True)
    return directory


def save_json(data: dict, filepath: str) -> None:
    """Save dictionary to JSON file."""
    ensure_dir(os.path.dirname(filepath))
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, default=str)


def load_json(filepath: str) -> dict:
    """Load dictionary from JSON file."""
    with open(filepath, 'r') as f:
        return json.load(f)


def format_number(num: float) -> str:
    """Format large numbers with K/M suffixes."""
    if num >= 1_000_000:
        return f"{num/1_000_000:.1f}M"
    elif num >= 1_000:
        return f"{num/1_000:.1f}K"
    else:
        return str(int(num))


def calculate_percentile(value: float, series: pd.Series) -> float:
    """Calculate percentile rank of a value in a series."""
    return (series < value).sum() / len(series) * 100


def get_project_root() -> str:
    """Get the project root directory."""
    return os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def log_execution(func_name: str, message: str) -> None:
    """Simple logging function."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {func_name}: {message}")


def sample_dataframe(df: pd.DataFrame, n: int, random_state: int = 42) -> pd.DataFrame:
    """Safely sample from dataframe."""
    if len(df) <= n:
        return df.copy()
    return df.sample(n=n, random_state=random_state)


def get_top_items(series: pd.Series, n: int = 5) -> list:
    """Get top n most common items from a series."""
    return series.value_counts().head(n).index.tolist()


def normalize_column(series: pd.Series) -> pd.Series:
    """Min-max normalize a series to 0-1 range."""
    min_val = series.min()
    max_val = series.max()
    if max_val == min_val:
        return pd.Series([0.5] * len(series), index=series.index)
    return (series - min_val) / (max_val - min_val)


def split_interests(interests_str: str) -> list:
    """Split comma-separated interests into list."""
    if not interests_str or pd.isna(interests_str):
        return []
    return [i.strip() for i in interests_str.split(',') if i.strip()]


def count_common_interests(interests1: str, interests2: str) -> int:
    """Count number of common interests between two users."""
    set1 = set(split_interests(interests1))
    set2 = set(split_interests(interests2))
    return len(set1 & set2)


class MetricsTracker:
    """Track and report metrics during pipeline execution."""
    
    def __init__(self):
        self.metrics = {}
        self.start_time = datetime.now()
    
    def add(self, name: str, value: float) -> None:
        """Add a metric."""
        self.metrics[name] = value
    
    def get(self, name: str) -> float:
        """Get a metric value."""
        return self.metrics.get(name)
    
    def report(self) -> dict:
        """Generate metrics report."""
        elapsed = (datetime.now() - self.start_time).total_seconds()
        return {
            'metrics': self.metrics,
            'elapsed_seconds': elapsed,
            'timestamp': datetime.now().isoformat()
        }
    
    def save(self, filepath: str) -> None:
        """Save metrics to JSON file."""
        save_json(self.report(), filepath)
