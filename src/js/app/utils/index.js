export * as filters from './filters';
export mapProps from './map-props';

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
