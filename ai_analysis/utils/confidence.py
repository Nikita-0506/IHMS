def normalize_confidence(raw_value):

    value = float(raw_value)

    if value < 0:
        return 0.0

    if value > 1:
        return 1.0

    return round(value, 2)
