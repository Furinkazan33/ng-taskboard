Socket.io is used so that everything done on a navigator is sync on other navigators.
Feel free to ask for help : furinkazanspirit@free.fr

Installation
--------------

    npm install ng-taskboard

Dependencies :
--------------

    my-mongo

How-to use :
--------------

Server side :

    var express = require('express')
      , http = require('http');
    var path = require('path');
    var app = express();
    var server = http.createServer(app); server.listen(8080);
    var io = require('socket.io').listen(server);

    app.use('/taskboard',  express.static(__dirname + '/node_modules/ng-taskboard/dist'));
    var taskBoard = require ('ng-taskboard')(optional_config_file);
    //see node_modules/taskboard/config.json

    app.get('/', function (req, res) {
      taskBoard.getTasks(function (g_context, cols, tasks) {
        res.render('index', { "data": { "title": "TaskBoard",
                                        "g_context": g_context,
                                        "cols": cols,
                                        "tasks": tasks } });
      });
    });
    io.sockets.on('connection', function (socket) {
      socket.on('socket_nav', function (tab) {
        socket.broadcast.emit('socket_nav', tab);
      });
      socket.on('socket_update', function (json) {
        taskBoard.updateCols(json.tasks, function() {});

        taskBoard.updateTask(json.task, function() {
          socket.broadcast.emit('socket_update', json.task);
        });
      });
      socket.on('socket_delete', function (id) {
        taskBoard.deleteTask(id, function() {
          socket.emit('socket_delete', id);
          socket.broadcast.emit('socket_delete', id);
        });

      });
      socket.on('socket_new', function (json) {
        taskBoard.newTask(json, function(task) {
          socket.emit('socket_new', task);
          socket.broadcast.emit('socket_new', task);
        })
      });
      socket.on('socket_toggle', function (id) {
        taskBoard.toggleTask(id, function(json) {
          socket.emit( 'socket_toggle', json );
          socket.broadcast.emit( 'socket_toggle', json );
        });
      });
    })



Client side (don't forget to add ng-app="taskboard" to your html tag) :

    link(rel='stylesheet', href='https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.5/css/materialize.min.css')
    link(rel='stylesheet', href='http://fonts.googleapis.com/icon?family=Material+Icons')
    link(rel='stylesheet', href='/taskboard/css/taskboard.css')

    script(src='https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular.min.js')
    script(type="text/javascript") var data = !{JSON.stringify(data)};

    script(src='https://ajax.googleapis.com/ajax/libs/jquery/1.12.0/jquery.min.js')
    script(src='https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.5/js/materialize.min.js')
    script(src='https://code.jquery.com/ui/1.12.0-beta.1/jquery-ui.min.js')
    script(src='https://cdn.socket.io/socket.io-1.4.5.js')
    script(src='/taskboard/js/taskboard-client.js')

    body(ng-controller="TaskController")
      h1= title

      ngnavtpl

      ngbarutilstpl

      ngcoltpl


Notice :
--------------
Templates are specified in /dist/js/taskboard-client.js but you can use the /dist/js/*.html.tpl files instead with templateUrl.


Todo :
--------------

- Client-side options
- Add server-side customizable behaviors
