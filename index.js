var pty = require('pty.js')
  , keypress = require('keypress')
  , net = require('net');

if (process.argv[2]) {
  var options = { host: process.argv[2], port: 9000 };
  var client = net.createConnection(options);
  client.on('data', function(data) {
    process.stdout.write(data); 
  });
  client.on('end', function() {
    process.stdout.write('disconnected!');
  });
} else {
  keypress(process.stdin);
  var term = pty('/bin/zsh', [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: process.cwd() 
  });
  var listeners = [];

  net.createServer(function(c) {
    var i = listeners.push(c);
    console.log('new connection\n');
    c.on('end', function() {
      listeners.splice(i-1, 1) });
  }).listen(9000);

  term.on('data', function(data) {
    listeners.forEach(function(l) { l.write(data); });
    process.stdout.write(data);
  });

  process.stdin.on('data', function(data) {
    if ( data === '\u0003' ) {
      process.stdout.write('exiting');
      process.exit();
    }
    term.write(data);
  });

  process.stdin.on('keypress', function(ch, key) {
    if (key && key.ctrl && key.name == 'd') { process.exit(); }
  });
  process.stdin.setRawMode(true);
  process.stdin.resume();
}
