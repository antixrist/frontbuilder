/**
 * @param {{}} [opts]
 * @returns {{}}
 */
export function factory (opts = {
  methodName: 'hasSlot'
}) {
  return {
    methods: {
      /**
       * Method used to check if a Vue component has a slot
       *
       * @param slotName The name of the slot
       * @returns {boolean} Whether the component has a slot
       * ```
       *   <div class="panel-body" v-if="hasSlot('body')">
       *     <slot name="body"></slot>
       *   </div>
       * ```
       */
      [opts.methodName] (slotName = 'default') {
        return !!this.$slots[slotName];
      },
    },
  };
}

export default factory();
