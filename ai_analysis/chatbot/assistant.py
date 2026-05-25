class MedicalChatAssistant:

    INTENT_MAP = {
        'appointment': 'You can book appointments from the appointments module.',
        'billing': 'Billing support is available in the billing dashboard.',
        'report': 'You can access reports in laboratory and patient report sections.',
    }

    @classmethod
    def answer(cls, query):

        lowered_query = (query or '').lower()

        for keyword, response in cls.INTENT_MAP.items():
            if keyword in lowered_query:
                return {
                    'intent': keyword,
                    'response': response,
                    'confidence': 0.74,
                }

        return {
            'intent': 'general',
            'response': 'Please describe symptoms or required workflow for better guidance.',
            'confidence': 0.51,
        }
