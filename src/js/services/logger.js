log.warn = warn;

const styles = {
  default: '',
  error: "color: #ff0000;",
  warning: "color: #5c3b00;"
};

function logWithTitle (type = 'default', title = '', ...args) {
  var style = styles[type];
  // NOTE: console.warn or console.error will print the stack trace
  // which isn't helpful here, so using console.log to escape it.
  if (console.group && console.groupEnd) {
    console.group('%c', style, title);
    console.log('%c', style, ...args);
    console.groupEnd();
  } else {
    console.log(
      "%c" + title + "\n\t%c" + newProblems.replace(/\n/g, "\n\t"),
      style + "font-weight: bold;",
      style + "font-weight: normal;"
    );
  }
}

export default function log (...args) {
}

/**
 * @param {string} message
 */
export function warn (message = '') {
  console.warn(`Warning: ${message}`);
}

