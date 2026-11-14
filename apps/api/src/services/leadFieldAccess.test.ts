import { describe, expect, it } from 'vitest';
import { redactLeadFields } from './leadFieldAccess';

describe('lead field access', () => {
  it('redacts denied standard and custom lead fields', () => {
    expect(redactLeadFields({
      firstName: 'Ada',
      email: 'ada@example.com',
      customFields: { privateNotes: 'Internal', publicTag: 'VIP' },
    }, ['email', 'privateNotes'])).toEqual({
      firstName: 'Ada',
      customFields: { publicTag: 'VIP' },
    });
  });

  it('preserves fields when no field is explicitly denied', () => {
    const lead = { firstName: 'Ada', customFields: { publicTag: 'VIP' } };
    expect(redactLeadFields(lead, [])).toEqual(lead);
  });
});
