import Mustache from 'mustache';

/**
 * Render a template string with the given data.
 * @param {string} templateString - The template string to render
 * @param {object} data - The data to render the template with
 * @returns {string} Returns the rendered template string
 */
export function renderTemplateString(templateString: string, data: object): string {
  return Mustache.render(templateString, data);
}
