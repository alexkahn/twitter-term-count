var fs = require('fs')
  , split = require('split')
  , through = require('through')
  , stopWords = require('../stopWords.json')
  , dataFile = fs.createReadStream('./out.json')
  , terms = Object.create(null) // hackish way to create a map like object
  , getText = through(parseTweet, end)
  , filterStops = through(filterStops, end)
  ;

dataFile
  .pipe(split())
  .pipe(getText)
  .pipe(filterStops)
  .on('data', makeTermCount)
  .on('end', function() {
    var topTen = getTopTen(terms);
    console.log(topTen);
  });

function end() {
  this.queue(null);
}

function filterStops (text) {
  var filtered = text.split(' ').filter(function(word) {
    // only add a word if it isn't in the array of stop words
    return stopWords.indexOf(word) < 0;
  }).join(' ');
  this.queue(filtered);
}

function getTopTen(obj) {
  var arr = [];
  for (var term in obj) {
    var o = {};
    o.term = term;
    o.value = obj[term];
    arr.push(o);
  }
  return arr.sort(function(a,b) {
    return a.value < b.value ? 1 : -1;
  }).slice(0,10);
}

function makeTermCount(text) {
  text.split(' ').map(function(word) {
    if (word === '' || Number(word)) {
      return;
    }
    if (!terms[word]) {
      terms[word] = 1;
    } else {
      terms[word] += 1;
    }
  });
}

function parseTweet (obj) {
  var URLs = /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/g
    , HTMLChars = /&[A-Za-z]+;/g
    , punctuation = /[\.,-\/!$%\^&\*;:{}=\-_`~()\[\]\"\n\{\}…]/g
    , mentions = /@[\w]+/g
    , retweets = /RT/g
    ;
  try {
    obj = JSON.parse(obj);
  } catch (e) {
    if (e.message !== 'Unexpected end of input') {
      console.log("\nError: %s", e.message);
    }
  }
  // deletes don't have a text property
  if (obj.text) {
    this.queue(obj.text.replace(URLs, "").replace(HTMLChars, " ")
               .replace(punctuation," ").replace(mentions, "")
               .replace(retweets, "").trim().toLowerCase());
  }
}
