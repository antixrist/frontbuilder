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
      failed () {
        return _.get(this, `${path}.success`, true);
      },
      errors () {
        const errors = _.get(this, `${path}.errors`, {});

        Object.keys(errors).forEach(name => {
          if (_.isArray(errors[name])) { return; }

          errors[name] = [errors[name]];
        });

        return errors;
      },
      errorMessage () {
        return this.failed ? _.get(this, `${path}.message`, '') : '';
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
