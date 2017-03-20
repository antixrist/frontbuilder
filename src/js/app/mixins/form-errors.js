import _ from 'lodash';

const defaultData = {
  success: true,
  message: '',
  errors: {}
};

export default function (field = 'error', opts = {}) {
  return {
    data () {
      return {
        [field]: _.cloneDeep(defaultData)
      };
    },
    computed: {
      failed () {
        return _.get(this, `${field}.success`, true);
      },
      errors () {
        const errors = _.get(this, `${field}.errors`, {});

        Object.keys(errors).forEach(name => {
          if (_.isArray(errors[name])) { return; }

          errors[name] = [errors[name]];
        });

        return errors;
      },
      errorMessage () {
        return _.get(this, `${field}.message`, '');
      },
      hasErrors () {
        return !!Object.keys(this.errors).length;
      },
    },
    methods: {
      hasErrorFor (path) {
        return !!_.get(this.errors, path);
      },
      resetFormErrors () {
        this[field] = _.cloneDeep(defaultData);
      },
      setFormErrors (errors) {
        this[field] = errors;
      },
    },
  };
}