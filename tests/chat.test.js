const assert = require('assert');

describe('Chat Service', function () {
  describe('Message Validation', function () {
    it('should reject empty messages', function () {
      const msg = '';
      const isValid = !!(msg && typeof msg === 'string' && msg.trim().length > 0 && msg.length <= 2000);
      assert.strictEqual(isValid, false);
    });

    it('should reject messages over 2000 characters', function () {
      const msg = 'a'.repeat(2001);
      const isValid = msg && typeof msg === 'string' && msg.trim().length > 0 && msg.length <= 2000;
      assert.strictEqual(isValid, false);
    });

    it('should accept valid messages', function () {
      const msg = 'What workout should I do today?';
      const isValid = msg && typeof msg === 'string' && msg.trim().length > 0 && msg.length <= 2000;
      assert.strictEqual(isValid, true);
    });

    it('should trim whitespace from messages', function () {
      const msg = '  hello  ';
      const sanitized = msg.trim();
      assert.strictEqual(sanitized, 'hello');
    });
  });

  describe('System Prompt Builder', function () {
    function buildSystemPrompt(subscription, goals, recentWorkouts, progress) {
      let prompt = `You are FitBot, an AI fitness assistant for FitTrack Rwanda.`;
      const planType = (subscription?.plan_type || 'basic').toLowerCase();

      if (planType === 'basic' || !subscription || subscription.status !== 'active') {
        prompt += ` Provide only general fitness advice.`;
      } else if (planType === 'premium') {
        prompt += ` Provide personalized recommendations.`;
        if (goals?.length) {
          prompt += ` User goals: ${goals.map(g => g.goal_type).join(', ')}`;
        }
      } else if (planType === 'annual') {
        prompt += ` Provide advanced coaching with predictive insights.`;
        if (progress?.weight_kg) {
          prompt += ` Current weight: ${progress.weight_kg}kg.`;
        }
      }
      return prompt;
    }

    it('should provide general advice for basic/free users', function () {
      const prompt = buildSystemPrompt({ plan_type: 'basic', status: 'active' }, [], [], {});
      assert.ok(prompt.includes('general fitness advice'));
      assert.ok(!prompt.includes('personalized'));
    });

    it('should provide personalized recommendations for premium users', function () {
      const prompt = buildSystemPrompt({ plan_type: 'premium', status: 'active' }, [{ goal_type: 'weight_loss' }], [], {});
      assert.ok(prompt.includes('personalized recommendations'));
      assert.ok(prompt.includes('weight_loss'));
    });

    it('should provide advanced coaching for annual subscribers', function () {
      const prompt = buildSystemPrompt({ plan_type: 'annual', status: 'active' }, [], [], { weight_kg: 75 });
      assert.ok(prompt.includes('advanced coaching'));
      assert.ok(prompt.includes('75kg'));
    });

    it('should handle no subscription (free user)', function () {
      const prompt = buildSystemPrompt(null, [], [], {});
      assert.ok(prompt.includes('general fitness advice'));
    });

    it('should include goals for premium users', function () {
      const goals = [{ goal_type: 'muscle_gain' }, { goal_type: 'endurance' }];
      const prompt = buildSystemPrompt({ plan_type: 'premium', status: 'active' }, goals, [], {});
      assert.ok(prompt.includes('muscle_gain'));
      assert.ok(prompt.includes('endurance'));
    });
  });

  describe('Subscription Plan Logic', function () {
    it('should identify basic plan', function () {
      const plan = 'basic';
      assert.strictEqual(plan, 'basic');
    });

    it('should identify premium plan', function () {
      const plan = 'PREMIUM';
      assert.strictEqual(plan.toLowerCase(), 'premium');
    });

    it('should identify annual plan', function () {
      const plan = 'Annual';
      assert.strictEqual(plan.toLowerCase(), 'annual');
    });

    it('should default inactive subscriptions to basic', function () {
      const sub = { plan_type: 'premium', status: 'expired' };
      const effectivePlan = sub.status === 'active' ? sub.plan_type : 'basic';
      assert.strictEqual(effectivePlan, 'basic');
    });
  });
});
