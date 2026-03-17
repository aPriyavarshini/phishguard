import json
from pathlib import Path

import joblib
import numpy as np
from fastapi import HTTPException

from app.config import settings


class MLService:
    def __init__(self) -> None:
        self.model = None
        self.feature_names: list[str] = []
        self.model_name = ""

    def load(self) -> None:
        model_path = Path(settings.model_path)
        meta_path = Path(settings.model_meta_path)
        if not model_path.exists() or not meta_path.exists():
            raise HTTPException(
                status_code=500,
                detail="Model artifacts not found. Run app/ml_model/train_model.py first.",
            )

        self.model = joblib.load(model_path)
        meta = json.loads(meta_path.read_text(encoding="utf-8"))
        self.feature_names = meta["feature_names"]
        self.model_name = meta["model_name"]

    def predict(self, features: dict[str, float]) -> tuple[int, float]:
        if self.model is None:
            self.load()

        vector = np.array([[features.get(name, 0.0) for name in self.feature_names]], dtype=float)
        pred = int(self.model.predict(vector)[0])

        if hasattr(self.model, "predict_proba"):
            proba = float(self.model.predict_proba(vector)[0][1])
        else:
            decision = float(self.model.decision_function(vector)[0])
            proba = float(1.0 / (1.0 + np.exp(-decision)))

        return pred, proba


ml_service = MLService()
