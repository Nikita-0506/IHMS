from django.test import SimpleTestCase

from ai_analysis.inference.risk_score_engine import calculate_health_risk_score


class RiskScoreEngineTestCase(SimpleTestCase):

    def test_high_risk_output(self):

        result = calculate_health_risk_score(65, 31, 155, 190, 82)

        self.assertEqual(result['risk_level'], 'high')
        self.assertGreaterEqual(result['risk_score'], 70)

    def test_low_risk_output(self):

        result = calculate_health_risk_score(24, 21, 112, 90, 20)

        self.assertEqual(result['risk_level'], 'low')
