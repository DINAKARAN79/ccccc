export function redactLeadFields(data: object, deniedFields: readonly string[]): Record<string, unknown> {
  const result: Record<string, unknown> = { ...data };
  for (const fieldName of deniedFields) {
    delete result[fieldName];
  }

  const customFields = result.customFields;
  if (customFields && typeof customFields === 'object' && !Array.isArray(customFields)) {
    const visibleCustomFields: Record<string, unknown> = { ...customFields };
    for (const fieldName of deniedFields) {
      delete visibleCustomFields[fieldName];
    }
    result.customFields = visibleCustomFields;
  }

  return result;
}
