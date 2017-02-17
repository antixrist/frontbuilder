import NProgress from 'nprogress';

NProgress.configure({
  speed: 500,
  easing: 'ease-out'
});

NProgress.factory = function factory (opts = {}) {
  return NProgress.configure(opts);
};

export default NProgress;
