import _ from 'lodash';

export const errorData = {
  success: true,
  message: '',
  errors: {}
};

export default function (path = 'error', opts = {}) {
  return {
    data () {
      const retVal = {};

      _.set(retVal, path, _.cloneDeep(errorData));

      return retVal;
    },
    computed: {
      success () {
        return _.get(this, `${path}.success`, true);
      },
      failed () {
        return !this.success;
      },
      errors () {
        const errors = _.get(this, `${path}.errors`, {});

        if (!_.isPlainObject(errors)) {
          return {};
        }

        Object.keys(errors).forEach(name => {
          if (_.isArray(errors[name])) { return; }

          errors[name] = [errors[name]];
        });

        return errors;
      },
      errorMessage () {
        if (!this.failed) { return ''; }

        const message = [];
        const msg = _.get(this, `${path}.message`, '');
        const errors = _.get(this, `${path}.errors`, {});

        msg && message.push(msg);
        _.isArray(errors) && message.push(...errors);

        return message.join('<br>');
      },
      successMessage () {
        return this.failed ? '' : _.get(this, `${path}.message`, '');
      },
      hasErrors () {
        return !!Object.keys(this.errors).length;
      },
    },
    methods: {
      hasError (path) {
        return !!_.get(this.errors, path);
      },
      resetFormErrors () {
        _.set(this, path, _.cloneDeep(errorData));
      },
      setFormErrors (errors) {
        _.set(this, path, errors);
      },
    },
  };
}
