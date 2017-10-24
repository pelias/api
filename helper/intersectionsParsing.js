const _ = require('lodash');
/*
this function returns an object that denotes an intersection of form:
{
  street1: value1,
  street2: value2
}
*/
module.exports = function parseIntersections(text) {
    var str1 = '', str2 = '';
    if(text.trim().length > 1) {
        //   var words = text.toLowerCase().split(' ');
        var words = _.words(text.toLowerCase(), /[^ ]+/g);
        console.log(words);

        // changes 'e15' to 'East 15', etc.
        words = directionalSanitizer(words);
        // changes '6' to '6th', etc
        words = addOrdinality(words);
        // only treat input as intersection if contains '&' or 'and'
        const delimiter = _.includes(text, '&') ? '&' : 'and';
        const delimiterIndex = words.indexOf(delimiter);

        str1 = wordsToSentence(words, 0, delimiterIndex);
        str2 = wordsToSentence(words, delimiterIndex+1, words.length);
    } else {
        throw 'Missing streets in the intersection';
    }
    return { street1: str1, street2: str2 };
};

// intended for intersections only
// this function turns '77' into '77th', '3' into '3rd', etc
function addOrdinality(arr) {
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
}

// intended to do the conversions like:
// 'w28' -> 'West 28'
// 'e17' -> 'East 17'

function directionalSanitizer(arr){
    const mapping = {
        e : 'East',
        w : 'West',
        s : 'South',
        n : 'North',
        ne: 'Northeast',
        nw: 'Northwest',
        se: 'Southeast',
        sw: 'Southwest'
    };

    for (let i = 0; i < arr.length; i++) {
        let streetNum;
        switch (stringStartsWithDirAcronym(arr[i])) {
            case 1:
                streetNum = arr[i].substring(1);
                arr[i] = mapping[arr[i][0]];
                if (i+1 === arr.length) {
                    arr.push(streetNum);
                } else {
                    arr.splice(i+1,0,streetNum);
                }
                break;
            case 2:
                streetNum = arr[i].substring(2);
                arr[i] = mapping[arr[i].substring(0,2)];
                if(i+1 === arr.length) {
                    arr.push(streetNum);
                } else {
                    arr.splice(i+1,0,streetNum);
                }
                break;
        }
    }

    return arr;
}

/*
Checks if an acronym for any direction exists and returns the number of characters it is denoted by
 */
function stringStartsWithDirAcronym (text) {
    if (text.length > 2) {
       if ((text.substring(0,2).toLowerCase() === 'ne' || text.substring(0,2).toLowerCase() === 'nw' ||
            text.substring(0,2).toLowerCase() === 'se' || text.substring(0,2).toLowerCase() === 'sw') &&
                /^\d$/.test(text[2])) {
           return 2;
        }
    }

    if (text.length > 1) {
        if ((text[0].toLowerCase() === 'e' || text[0].toLowerCase() === 'w' ||
                text[0].toLowerCase() === 'n' || text[0].toLowerCase() === 's') && /^\d$/.test(text[1])) {
            return 1;
        }
    }

    return 0;
}

function wordsToSentence(arr, start, end) {
    var sentence = '';
    for (let i = start; i < end; i++) {
        sentence += arr[i];
        if (i < (end - 1)) {
            sentence += ' ';
        }
    }
    return sentence;
}

