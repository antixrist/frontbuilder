/**
 * @memberof Vue
 */
export function closestParentTag (tag) {
  let parent = this.$parent;

  while (parent) {
    if (!parent.$options._componentTag) {
      return null;
    }

    if (parent.$options._componentTag === tag) {
      return parent;
    }

    parent = parent.$parent;
  }

  return null;
}

/**
 * @param {String} content
 * @return {String}
 */
export function nl2br (content) {
  return content ? content.split('\n').map(row => row.trim()).join('<br>') : '';
}
