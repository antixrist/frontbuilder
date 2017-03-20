/**
 * Inspired by @skyrpex/props-to-local
 *
 * @example
 *
 * <template>
 *  <input type="checkbox" v-model="local.value" @change="$emit('input', $event.target.checked)">
 * </template>
 *
 * <script>
 *  // In this example, a 'value' prop is given to mapProps.
 *  export default {
 *    mixins: [
 *      mapProps({
 *        // Normal props here
 *        value: {
 *          type: Boolean,
 *          default: false,
 *        },
 *      }),
 *    ],
 *  };
 * </script>
 */

/**
 * @param {{}} props
 * @param {{}} [options={}]
 */
export default (
  props = {},
  options = {
    localName: 'local',
  }
) => ({
  props,
  data () {
    return {
      [options.localName]: (() => {
        const data = {};

        Object.keys(props).forEach(propName => data[propName] = props[propName]);

        return data;
      })(),
    };
  },
  created () {
    Object.keys(props).forEach(propName => {
      this.$watch(propName, (propName => value => this[options.localName][propName] = value)(propName), { immediate: true });
    });
  },
});
