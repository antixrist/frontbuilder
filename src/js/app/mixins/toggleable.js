/**
 * @param {{}} [opts]
 * @returns {{}}
 */
export function factory (opts = {
  dataProperty: 'isActive'
}) {
  const prop = opts.dataProperty;

  return {
    data () {
      return {
        [prop]: this.value
      }
    },

    props: {
      value: Boolean
    },

    watch: {
      value () {
        this[prop] = this.value;
      },

      [prop] () {
        this.$emit('input', this[prop]);
      }
    }
  };
}

export default factory();
