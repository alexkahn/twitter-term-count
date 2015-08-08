var fs = require('fs')
  , cp = require('child_process')
  ;

if (process.argv[2] === 'collect') {

  var child = cp.fork(__dirname + '/lib/collect.js')
    , ProgressBar = require('progress')
    , bar = new ProgressBar(':bar', { total: 300 })
    , output = fs.createWriteStream('./out.json')
    , timer
    ;

  child.on('message', function (msg) {
    if (msg === 'connected') {
      console.log("Collecting Tweets");
      timer = setInterval(function () {
        bar.tick();
        if (bar.complete) {
          console.log('\nComplete\n');
          clearInterval(timer);
        }
      }, 1000);
    }
    if (msg.type === 'tweet') {
      output.write(JSON.stringify(msg.content) + '\n');
    }
  });

  child.on('exit', function (code, signal) {
    process.exit(0);
  });

} else if (process.argv[2] === 'process') {
  var child = cp.fork(__dirname + '/lib/process.js');
  
  child.on('exit', function (code, signal) {
    process.exit(0);
  });

} else {
  console.log([
    "Usage: node index.js COMMAND\n",
    "  If you want to run the test dataset, use: mv out.json.example out.json",
    "  [none]   -- Print this page.",
    "  collect  -- Collect data from twitter if you have API credentials.",
    "  process  -- Process twitter data assuming there is a data file."
  ].join('\n'));
}