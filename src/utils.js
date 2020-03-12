// like we talked about in oh yesterday this doesn't actually do what you want i think
export function groupBy(data, key_field) {
  var output = getCounts(data, key_field);
  var output_array = [];
  for (let [key, value] of Object.entries(output)) {
    output_array.push({ [key_field]: key, value: value });
  }
  // there was typo in console.log(output_array)
  return output_array;
}

export function getCounts(data, key_field) {
  var output = {};
  for (let i = 0; i < data.length; i++) {
    if (data[i][key_field] in output) {
      output[data[i][key_field]]++;
    } else {
      output[data[i][key_field]] = 1;
    }
  }
  return output;
}
