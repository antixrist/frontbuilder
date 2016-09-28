import * as _ from 'lodash';
import config from '../../config';
import chalk from 'chalk';
import {getTimeFormatted} from './';

import notify from 'gulp-notify';
const notifyConfig = {
  "useNotify":        true,
  "title":            "Front builder",
  "sounds":           {},
  "taskFinishedText": "Таск завершился в "
};

function cutUselessLog (error) {
  return error.message.replace(/(at\sParser\.pp\.raise[\s\S]*)/, '');
}

/**
 * On error notifier
 * @param  {String} message Error message
 * @param  {Error} error Error object
 * @return {Pipe}
 */
export function error (message, error) {
  message = message || 'Что-то поломалось.';
  error   = error || new Error();
  
  const resultMessage = '\n' + message + '\nЗа деталями - го в консоль.\n';
  
  if (!(error instanceof (Error))) {
    error = new Error(error);
  }
  
  if (config.useNotifierInDevMode && !config.isProduction) {
    notify.onError({
      sound:   !!notifyConfig.sounds.onError,
      title:   notifyConfig.title,
      message: resultMessage,
      onLast:  true
    })(error);
  } else {
    console.error(chalk.red(message + '\n'));
  }
  
  if (error.message) {
    console.log(chalk.underline.red('Ошибки:\n'));
    console.error(cutUselessLog(error));
    console.log(chalk.red('_______________\n'));
  }
  
  return _.noop();
}

/**
 * On success notifier
 * @param  {String} message Success message
 * @param  {{onLast: Boolean, notStream: Boolean}} params Use notify only on last changed file
 * @return {Pipe}
 */
export function success (message, params) {
  if (config.useNotifierInDevMode && !config.isProduction) {
    params = params || {};
    
    let resultMessage = message + '\n' || 'Таск завершён\n';
    resultMessage += notifyConfig.taskFinishedText + '<%= options.date %>';
    
    const defaultConfig = {
      sound:           !!notifyConfig.sounds.onSuccess,
      title:           notifyConfig.title,
      templateOptions: {
        date: getTimeFormatted()
      }
    };
    
    if (!!params.notStream) {
      return notify(defaultConfig).write(resultMessage);
    }
    
    return notify(
      Object.assign(defaultConfig, {
        onLast:  params.onLast || true,
        message: resultMessage
      })
    );
  }
  
  return _.noop();
}
