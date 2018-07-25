export const converToHumanReadableFormat = time => {
  let seconds = parseInt(time % 60);
  let minutes = parseInt((time / 60) % 60);
  let hours = parseInt((time / (60 * 60)) % 24);

  hours = hours < 10 ? hours : hours;
  minutes = minutes < 10 ? minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  return hours + "h " + minutes + "m " + seconds + "s";
};

export const converToHumanReadableFormatWithoutSeconds = time => {
  let minutes = parseInt((time / 60) % 60);
  let hours = parseInt((time / (60 * 60)) % 24);

  hours = hours < 10 ? hours : hours;
  minutes = minutes < 10 ? minutes : minutes;

  return hours + "h " + minutes + "m ";
};

export const getTasksSummary = tasks => {
  let stringsArray = tasks.map(
    item =>
      `${item.task_url
        .split("/")
        .pop()} - ${converToHumanReadableFormatWithoutSeconds(
        item.timeElapsed
      )} - ${item.description}`
  );
  return stringsArray.join("\n");
};

export const calcMinToSec = min => {
  return min * 60;
};
