def _name_hash(name):
    """Stable 0–1 float from plant name so the same plant always gets the same score."""
    h = 0
    for ch in name:
        h = (h * 31 + ord(ch)) & 0xFFFFFFFF
    return (h % 1000) / 1000.0


def _plant_score(status, support, name):
    """Return a realistic per-plant score (0–100) with name-seeded variation."""
    t = _name_hash(name)   # 0.0 – 1.0, stable per plant

    RANGES = {
        ("native",     "high"):   (85, 100),
        ("native",     "medium"): (65,  80),
        ("native",     "low"):    (45,  60),
        ("non-native", "high"):   (25,  35),
        ("non-native", "medium"): (20,  30),
        ("non-native", "low"):    (15,  25),
        ("invasive",   "high"):   ( 5,  10),
        ("invasive",   "medium"): ( 2,   8),
        ("invasive",   "low"):    ( 0,   5),
    }

    lo, hi = RANGES.get((status, support), (20, 30))
    return lo + t * (hi - lo)


def calculate_biodiversity_score(plants):
    if not plants:
        return {
            "score": 0, "projected_score": 0,
            "breakdown": {"helping": [], "hurting": []},
            "insight": "No plants scanned.", "plant_count": 0,
        }

    helping, hurting = [], []
    scores = []
    native_names = set()

    for plant in plants:
        status  = plant.get("invasive_status", "non-native").lower().strip()
        support = plant.get("wildlife_support", "low").lower().strip()
        name    = plant.get("name", plant.get("plant_name", "Unknown plant"))

        if status  not in ("native", "non-native", "invasive"): status  = "non-native"
        if support not in ("high", "medium", "low"):            support = "low"

        s = _plant_score(status, support, name)
        scores.append(s)

        if status == "native":
            native_names.add(name)
            helping.append(name)
        elif status == "invasive":
            hurting.append(name)
        elif support == "low":
            hurting.append(name)
        else:
            helping.append(name)

    n = len(plants)
    base_score = sum(scores) / n   # average per-plant score (already 0–100)

    # ── Bonuses / penalties ──────────────────────────────────────────────────
    native_ratio  = len([p for p in plants
                         if p.get("invasive_status", "").lower().strip() == "native"]) / n
    invasive_count = sum(1 for p in plants
                         if p.get("invasive_status", "").lower().strip() == "invasive")

    bonus = 0.0

    # Native-ratio bonus: >70% native → +3 to +5 pts
    if native_ratio > 0.70:
        bonus += 3 + 2 * (native_ratio - 0.70) / 0.30   # scales 3→5 as ratio goes 70%→100%

    # Diversity bonus: 5+ distinct native species → +2 to +3 pts
    if len(native_names) >= 5:
        bonus += 2 + min(1, (len(native_names) - 5) / 5)  # caps near 3

    # Invasive penalty: each invasive −2 pts
    bonus -= invasive_count * 2

    raw_score = base_score + bonus
    score = max(0, min(100, round(raw_score)))

    # ── Projected score ───────────────────────────────────────────────────────
    # Simulates: (1) invasives replaced with native medium,
    #            (2) 3 native medium plants added from recommendations
    REC_ADDITIONS = 3
    projected_scores = []

    for plant in plants:
        status  = plant.get("invasive_status", "non-native").lower().strip()
        support = plant.get("wildlife_support", "low").lower().strip()
        name    = plant.get("name", plant.get("plant_name", "Unknown plant"))
        if status not in ("native", "non-native", "invasive"): status = "non-native"
        if support not in ("high", "medium", "low"):           support = "low"

        if status == "invasive":
            projected_scores.append(_plant_score("native", "medium", name + "_proj"))
        else:
            projected_scores.append(_plant_score(status, support, name))

    # Add the 3 recommended native plantings
    for i in range(REC_ADDITIONS):
        projected_scores.append(_plant_score("native", "medium", f"recommendation_{i}"))

    proj_n      = len(projected_scores)
    proj_base   = sum(projected_scores) / proj_n
    proj_native = (sum(1 for p in plants
                       if p.get("invasive_status", "").lower().strip() == "native")
                   + invasive_count + REC_ADDITIONS)
    proj_ratio  = proj_native / proj_n

    proj_bonus = 0.0
    if proj_ratio > 0.70:
        proj_bonus += 3 + 2 * (proj_ratio - 0.70) / 0.30
    proj_native_species = len(native_names) + invasive_count + REC_ADDITIONS
    if proj_native_species >= 5:
        proj_bonus += 2

    projected_score = max(score + 5, min(100, round(proj_base + proj_bonus)))

    # ── Insight ──────────────────────────────────────────────────────────────
    has_invasive = invasive_count > 0

    if score >= 80:
        insight = "Outstanding — your schoolyard is a genuine ecosystem asset."
    elif score >= 65:
        insight = "Good biodiversity. A few targeted native plantings could make it exceptional."
    elif score >= 45:
        if has_invasive:
            insight = "Moderate biodiversity. Removing invasive species and replacing with natives would help significantly."
        else:
            insight = "Moderate biodiversity. Adding more native species would boost your score and support local wildlife."
    elif score >= 25:
        if has_invasive:
            insight = "Low biodiversity. Prioritise removing invasive plants and replanting with natives."
        else:
            insight = "Low biodiversity. Focus on adding high-impact native species to your schoolyard."
    else:
        insight = "Critical — invasive species are dominating. Targeted removal and replanting is urgent."

    return {
        "score":           score,
        "projected_score": projected_score,
        "breakdown":       {"helping": helping, "hurting": hurting},
        "insight":         insight,
        "plant_count":     n,
    }
