var Twit = require('twit')
  , keys = {
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      access_token: process.env.ACCESS_TOKEN,
      access_token_secret: process.env.ACCESS_TOKEN_SECRET
    }
  ;

  var Twitter = new Twit(keys)
    , stream = Twitter.stream('statuses/sample', {language: "en"})
    ;

  stream.on('error', function (err) {
    console.log(err.message);
    console.log(err.stack);
  });

  stream.on('tweet', function(tweet) {
    process.send({
      type: "tweet",
      content: tweet
    });
  });

  stream.once('connected', function (res) {
    process.send('connected');
    setTimeout(function(){
      stream.stop();
    }, 1000 * 60 * 5);
  })
