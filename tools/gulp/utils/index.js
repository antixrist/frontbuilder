import gutil from 'gulp-util';
import chalk from 'chalk';

import * as notifier from './notifier';

export {notifier};

/**
 * Date formatter for Gulp notify. It showes only hours, minutes and seconds
 * @param  {number} timeItem hours, minutes or seconds
 * @return {string|number} String with formatted time
 */
function formatTime (timeItem) {
  if (timeItem < 10) {
    return `0${timeItem}`;
  }
  
  return timeItem;
}

/**
 * Get time of last modify of something (css, js and etc)
 * @return {string} String with formatted time
 */
export function getTimeFormatted () {
  const currentDate = new Date();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  
  return [formatTime(hours), formatTime(minutes), formatTime(seconds)].join(':');
}


/**
 * Helper for watcher logging
 * @param  {String} event Type of event
 * @param  {String} path  Path of changed file
 */
export function watcherLog (event, path) {
  gutil.log(`${chalk.cyan.bold(event)} ${chalk.green(path)}`);
}

export function taskLoader (path) {

}
