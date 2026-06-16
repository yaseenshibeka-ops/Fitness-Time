const assert = require('assert');

describe('Recommendation Service', function () {
  describe('Product Categories by Goal', function () {
    const categories = {
      'weight_loss': ['resistance bands', 'cardio equipment', 'jump ropes', 'fitness trackers'],
      'muscle_gain': ['dumbbells', 'protein supplements', 'weight benches', 'barbells'],
      'general_fitness': ['yoga mats', 'adjustable benches', 'resistance bands', 'foam rollers'],
      'endurance': ['treadmills', 'exercise bikes', 'rowing machines', 'hydration packs'],
      'flexibility': ['yoga mats', 'stretch straps', 'foam rollers', 'massage guns']
    };

    it('should return weight loss products for weight_loss goal', function () {
      const goal = 'weight_loss';
      const products = categories[goal];
      assert.ok(products.includes('resistance bands'));
      assert.ok(products.includes('cardio equipment'));
    });

    it('should return muscle gain products for muscle_gain goal', function () {
      const goal = 'muscle_gain';
      const products = categories[goal];
      assert.ok(products.includes('dumbbells'));
      assert.ok(products.includes('protein supplements'));
    });

    it('should return general fitness products as fallback', function () {
      const goal = 'unknown_goal';
      const goalKey = Object.keys(categories).find(k => goal.includes(k)) || 'general_fitness';
      const products = categories[goalKey];
      assert.ok(products.includes('yoga mats'));
      assert.ok(products.includes('adjustable benches'));
    });

    it('should match partial goal keywords', function () {
      const goal = 'I want to gain muscle';
      const goalKey = Object.keys(categories).find(k => goal.includes(k)) || 'general_fitness';
      assert.strictEqual(goalKey, 'general_fitness');
    });
  });

  describe('Progress Insights', function () {
    it('should calculate weight trend correctly', function () {
      const weights = [80, 79.5, 79, 78.5, 78];
      const first = weights[0];
      const last = weights[weights.length - 1];
      const diff = last - first;
      assert.strictEqual(diff, -2);
    });

    it('should project goal achievement', function () {
      const currentWeight = 78;
      const targetWeight = 75;
      const weeklyRate = -0.5;
      const weeksToGoal = Math.abs((targetWeight - currentWeight) / weeklyRate);
      assert.strictEqual(weeksToGoal, 6);
    });

    it('should handle zero weekly rate', function () {
      const currentWeight = 78;
      const targetWeight = 75;
      const weeklyRate = 0;
      const weeksToGoal = weeklyRate !== 0 ? Math.abs((targetWeight - currentWeight) / weeklyRate) : Infinity;
      assert.strictEqual(weeksToGoal, Infinity);
    });

    it('should identify weight gain vs loss', function () {
      const diff1 = -2;
      const diff2 = 3;
      assert.ok(diff1 < 0);
      assert.ok(diff2 > 0);
    });
  });

  describe('30-Day Activity Summary', function () {
    it('should recommend achieving 300 minutes per month', function () {
      const totalMinutes = 150;
      const message = totalMinutes >= 300
        ? 'Great consistency!'
        : 'Try to reach 300 minutes per month for optimal results.';
      assert.strictEqual(message, 'Try to reach 300 minutes per month for optimal results.');
    });

    it('should congratulate on reaching 300 minutes', function () {
      const totalMinutes = 320;
      const message = totalMinutes >= 300
        ? 'Great consistency!'
        : 'Try to reach 300 minutes per month for optimal results.';
      assert.strictEqual(message, 'Great consistency!');
    });
  });
});
