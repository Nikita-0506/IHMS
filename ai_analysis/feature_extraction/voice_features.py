def derive_voice_features(pitch_variance, speaking_rate, energy_level):

    return {
        'pitch_variance': float(pitch_variance),
        'speaking_rate': float(speaking_rate),
        'energy_level': float(energy_level),
        'stability_index': round((float(energy_level) + float(speaking_rate)) / 2, 2),
    }
