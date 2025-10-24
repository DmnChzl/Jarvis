export const html = (tpl: TemplateStringsArray, ...values: any[]) => {
  return tpl.reduce((result, str, idx) => {
    const value = values[idx];

    if (Array.isArray(value)) {
      return result + str + value.join('');
    }

    return result + str + (value ?? '');
  }, '');
};

export const htmlInline = (tpl: TemplateStringsArray, ...values: any[]) => {
  return html(tpl, values).replace(/\n\s*/g, ' ').replace(/\s+/g, ' ').trim();
};
