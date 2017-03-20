import _ from 'lodash';

/**
 * @param {{}} bindings
 * @param {{}} [opts]
 * @returns {{}}
 *
 * @example
 * new Vue({
 *  store,
 *  mixins: [
 *    mapStateToData({
 *      'path.to.local.data': 'path.to.needed.state'
 *    })
 *  ]
 * });
 */
export default function (bindings = {}, opts = {}) {
  return {
    data () {
      const retVal = {};

      if (!this.$store) { return retVal; }

      _.forEach(bindings, (from, to) => {

        const binding = _.get(this.$store.state, from);
        if (binding) {
          _.set(retVal, to, _.cloneDeep(binding));
        }
      });

      return retVal;
    }
  };
}