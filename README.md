Twitter Challenge
==================
This is a (naive) way to do some NLP on tweets in Node.js.

The module (as a whole) collects five minutes worth of tweets from the statuses/sample endpoint, filters out deletes and parses the text of status, then counts the occurances of each term. Depending on the network connection and the like, you can expect a few thousand tweets when collecting.

## Installation

First, make sure you have Node.js. If not, ```brew install node```  or download the executable for Windows, etc from the [website](https://nodejs.org).

Once you have node installed, you should also have NPM (you can check with ```npm --version```. Assuming you have git installed, you can clone this repository to your favorite directory for doing so and when it's done just type: ```npm install```.

Now you have all of the library dependencies installed in a local ```node_modules``` folder.

## Usage

Assuming you've installed the module and it's dependencies, you can simply:

```sh
node index.js COMMAND

  collect  -- Get some data from Twitter
  process  -- Get a term count with the top 10 terms
```

If you don't have a file called ```out.json``` you can copy the sample data with ```cp out.json.example``` or, if you want to take a quick break, collect some data with your Twitter API credentials. The `process` script assumes you have environment variables that hold your Twitter API credentials, you can ```cp env.sh.template env.sh``` and enter your API keys/tokens/secrets there. All you'll need to do is ```source env.sh``` and you're good to go.

If you do have a file of tweet data, then it will just run the processing script against it and you'll be looking at a shiny table of results in no time at all.

## Details

The module uses the [Twit](https://www.npmjs.com/package/twit) library to connect to the Streaming API and adds a query parameter for getting tweets that are in "English." When collection is complete, the [process](lib/process.js) script creates a read stream of the data which has the form:

```
{keys: tweetStuff}
{keys: tweetStuff}
{keys: tweetStuff}
```

Reading the file all at once would probably make it more difficult (plus could require adding more memory to the Node.js process) but treating the data as newline delimited JSON allows for using the [split](https://www.npmjs.com/package/split) library to emit each tweet.

Each tweet is lightly sanitized and normalized to lower case using a transform stream via [through](https://www.npmjs.com/package/through), then sent through another transform stream that removes English Stop Words collected [here](http://www.ranks.nl/stopwords). It should be noted that at this point, there should be some stemming but implementing stemming via some NLP library or a roll-your-own stemmer felt beyond the scope of the problem.

Once those transformations are finished, the data is broken up by whitespace and further sanitized for empty strings or blocks of numbers (which could have significance depening on the context) then put into a map-like object so terms can be counted as they are read from the previous stream. That object is then put through one last function when the stream is complete that coerces it into an array whose elements are objects of the form:

```js
{term: 'word', value: n}
```

Such that `n` is some positive integer.

This object is then sorted by the value property and sliced to return the 10 most used terms.