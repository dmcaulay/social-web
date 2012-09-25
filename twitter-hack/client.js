
var Twitter = require('ntwitter');
var Stream = require('stream');
var sets = require('simplesets');

var twit = new Twitter({
  consumer_key: 'bqjpMbGVwEHAJOP2B4oCA',
  consumer_secret: 'weRhpbgTS3cn015jXGr9lToMVpyaWwLWImNpHr0KfM',
  access_token_key: '483655898-kejFlkMUhyWK8CtZjX6ngiFnxBqowbZjM6VONFP0',
  access_token_secret: 'whODySsi3jeMrn7Fn4FtY9q7cPtl2zKVCe3m630wgHg'
});

var trendStream = new Stream();
trendStream.readable = true;
twit.getTrends(function(err, results) {
  if (err) return trendStream.emit('error', err);
  results.forEach(function(result) {
    result.trends.forEach(function(trend) {
      trendStream.emit('data', trend);
    });
  });
});

var searchStream = new Stream();
searchStream.writable = true;
searchStream.readble = true;
searchStream.write = function(trend) {
  for (var page = 1; page < 6; page++) {
    twit.search(trend.name, {rpp:100, page:page}, function(err, data) {
      if (err) return searchStream.emit('error', err);
      data.results.forEach(function(result) {
        searchStream.emit('data', result);
      });
    });
  }
};

var analysisStream = new Stream();
analysisStream.writable = true;
analysisStream.words = [];
analysisStream.uniqueWords = new sets.Set();
analysisStream.tweets = 0;
analysisStream.write = function(result) {
  analysisStream.tweets++;
  var tweetWords = result.text.split(/\s+/);
  tweetWords.forEach(function(word) {
    analysisStream.words.push(word);
    analysisStream.uniqueWords.add(word);
  });
  var lexDiversity = analysisStream.uniqueWords.size() / analysisStream.words.length;
  var wordsPerTweet = analysisStream.words.length / analysisStream.tweets;
  console.log('lex:', lexDiversity, ' wpt:', wordsPerTweet, ' total:', analysisStream.tweets);
};

trendStream.pipe(searchStream).pipe(analysisStream);
