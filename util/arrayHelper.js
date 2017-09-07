module.exports.removeWhitespaceElements = function (arr) {
    for(let i = 0; i < arr.length; i++) {
        if(arr[i] === '') {
            arr.splice(i, 1);
            i--;
        }
    }
    return arr;
};

// intended for intersections only
// this function turns '77' into '77th', '3' into '3rd', etc
module.exports.addOrdinality = function (arr) {
    arr.forEach( function (elmnt, index) {
        // is it only numbers
        let isNum = /^\d+$/.test(elmnt);
        if(isNum) {
            switch(elmnt[elmnt.length-1]){
                case '1':
                    elmnt += 'st';
                    arr[index] = elmnt;
                    break;
                case '2':
                    elmnt += 'nd';
                    arr[index] = elmnt;
                    break;
                case '3':
                    elmnt += 'rd';
                    arr[index] = elmnt;
                    break;
                default :
                    elmnt += 'th';
                    arr[index] = elmnt;
            }
        }
    });
    return arr;
};

// intended to do the conversions like:
// 'w28' -> 'West 28'
// 'e17' -> 'East 17'
module.exports.EWStreetsSanitizer = function(arr){
  const mapping = {
      e : 'East',
      w : 'West'
  };

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].length > 1) {
      if((arr[i][0].toLowerCase() === 'e' || arr[i][0].toLowerCase() === 'w') && /^\d$/.test(arr[i][1])) {
         let streetNum = arr[i].substring(1);
         arr[i] = mapping[arr[i][0]];
         if(i+1 === arr.length) {
           arr.push(streetNum);
         } else {
           arr.splice(i+1,0,streetNum);
         }
      }
    }
  }

  return arr;
};

module.exports.wordsToSentence = function (arr, start, end) {
  var sentence = '';
  for (let i = start; i < end; i++) {
      sentence += arr[i];
      if (i < (end - 1)) {
          sentence += ' ';
      }
  }
  return sentence;
};
