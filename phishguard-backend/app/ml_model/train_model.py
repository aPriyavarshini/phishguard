import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split

DATASET_PATH = Path(__file__).resolve().parents[3] / "phishing.csv"
MODEL_PATH = Path(__file__).resolve().parent / "model.pkl"
META_PATH = Path(__file__).resolve().parent / "model_meta.json"

TRAIN_FEATURES = [
    "LongURL",
    "SubDomains",
    "Symbol@",
    "UsingIP",
    "HTTPS",
    "PrefixSuffix-",
    "Redirecting//",
    "ShortURL",
    "AbnormalURL",
]


def evaluate(model, x_test, y_test):
    pred = model.predict(x_test)
    return {
        "accuracy": float(accuracy_score(y_test, pred)),
        "precision": float(precision_score(y_test, pred, zero_division=0)),
        "recall": float(recall_score(y_test, pred, zero_division=0)),
        "f1": float(f1_score(y_test, pred, zero_division=0)),
    }


def main():
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    df = df.fillna(0)

    missing = [c for c in TRAIN_FEATURES + ["class"] if c not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    # Normalize labels to 0 legit / 1 phishing.
    y = (df["class"].astype(int) == -1).astype(int)
    x = df[TRAIN_FEATURES].astype(float)

    x_train, x_test, y_train, y_test = train_test_split(
        x,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    models = {
        "RandomForestClassifier": RandomForestClassifier(
            n_estimators=500,
            max_depth=14,
            random_state=42,
            class_weight="balanced",
        ),
        "LogisticRegression": LogisticRegression(
            max_iter=2000,
            solver="lbfgs",
            class_weight="balanced",
        ),
    }

    try:
        from xgboost import XGBClassifier

        models["XGBoost"] = XGBClassifier(
            n_estimators=450,
            learning_rate=0.07,
            max_depth=7,
            subsample=0.9,
            colsample_bytree=0.9,
            eval_metric="logloss",
            random_state=42,
        )
    except Exception:
        pass

    best_name = ""
    best_model = None
    best_metrics = {"f1": -1.0}
    results: dict[str, dict] = {}

    for name, model in models.items():
        model.fit(x_train, y_train)
        metrics = evaluate(model, x_test, y_test)
        results[name] = metrics
        if metrics["f1"] > best_metrics["f1"]:
            best_name = name
            best_model = model
            best_metrics = metrics

    if best_model is None:
        raise RuntimeError("No model trained")

    joblib.dump(best_model, MODEL_PATH)
    META_PATH.write_text(
        json.dumps(
            {
                "model_name": best_name,
                "feature_names": TRAIN_FEATURES,
                "metrics": best_metrics,
                "all_results": results,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    print("Training complete")
    print(json.dumps({"winner": best_name, "metrics": best_metrics}, indent=2))


if __name__ == "__main__":
    main()
