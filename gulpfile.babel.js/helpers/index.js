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
