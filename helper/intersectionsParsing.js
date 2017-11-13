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
        var words = _.words(text.toLowerCase(), /[^ ]+/g);
        // changes 'e15' to 'East 15', etc.
        words = words.map(directionalSanitizer)
                     .reduce(function(a, b) { return a.concat(b); }, []);
        // changes '6' to '6th', etc
        words = words.map(addOrdinality);
        // only treat input as intersection if contains '&' or 'and'
        const delimiter = _.includes(text, '&') ? '&' : 'and';
        const delimiterIndex = words.indexOf(delimiter);

        str1 = words.slice(0,delimiterIndex).join(' ');
        str2 = words.slice(delimiterIndex+1, words.length).join(' ');
    }

    return { street1: str1, street2: str2 };
};

// intended for intersections only
// this function turns '77' into '77th', '3' into '3rd', etc
function addOrdinality(elmnt) {
    let isNum = /^\d+$/.test(elmnt);
    if (isNum) {
        var cent = elmnt % 100;
        if (cent >= 10 && cent <= 20) { return `${elmnt}th`; }
        var dec = elmnt % 10;
        if (dec === 1) { return `${elmnt}st`; }
        if (dec === 2) { return `${elmnt}nd`; }
        if (dec === 3) { return `${elmnt}rd`; }
        return `${elmnt}th`;
    }
    return elmnt;
}

// intended to do the conversions like:
// 'w28' -> 'West 28'
// 'e17' -> 'East 17'

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

function directionalSanitizer(word){
    let streetNum;
    switch (stringStartsWithDirAcronym(word)) {
        case 1:
            streetNum = word.substring(1);
            word = mapping[word[0]];
            return [word, streetNum];
        case 2:
            streetNum = word.substring(2);
            word = mapping[word.substring(0,2)];
            return [word, streetNum];
    }
    return word;
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
    } else if (text.length > 1) {
        if ((text[0].toLowerCase() === 'e' || text[0].toLowerCase() === 'w' ||
                text[0].toLowerCase() === 'n' || text[0].toLowerCase() === 's') && /^\d$/.test(text[1])) {
            return 1;
        }
    }
    return 0;
}
