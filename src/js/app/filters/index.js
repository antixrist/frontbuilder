/**
 * @param {String} content
 * @return {String}
 */
export function nl2br (content) {
  return content ? content.split('\n').map(row => row.trim()).join('<br>') : '';
}
