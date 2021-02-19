export const encodeBody = (body) => {
  let formBody = [];
  for (let property in body) {
    let encodedKey = encodeURIComponent(property);
    let encodedValue = encodeURIComponent(body[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  formBody = formBody.join('&');
  return formBody;
};

export const truncateString = (string, maxLength = 18) => {
  if (!string) return null;
  if (string.length <= maxLength) return string;
  return `${string.substring(0, maxLength)}...`;
};