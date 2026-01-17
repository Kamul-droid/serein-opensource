import { applyDomainPolicy, selectModel } from '../../src/services/ai.service';
import { ChatMessage } from '../../src/types';

describe('AI Service - policy and model selection', () => {
  it('blocks medical questions', () => {
    const messages: ChatMessage[] = [{ role: 'user', content: 'Can you diagnose my symptoms?' }];
    const result = applyDomainPolicy(messages);
    expect(result.blocked).toBe(true);
    expect(result.reason).toBe('medical');
  });

  it('blocks out-of-domain requests when strict', () => {
    const messages: ChatMessage[] = [{ role: 'user', content: 'What is the capital of France?' }];
    const result = applyDomainPolicy(messages);
    expect(result.blocked).toBe(true);
    expect(result.reason).toBe('out-of-domain');
  });

  it('selects lightweight model for short prompts', () => {
    const messages: ChatMessage[] = [{ role: 'user', content: 'Help me relax.' }];
    const model = selectModel(messages);
    expect(model).toBe('phi');
  });
});
