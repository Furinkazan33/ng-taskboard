var taskboard = angular.module("taskboard", []);
var debug = true;
var log = function (data) { debug && console.log(data); }

taskboard.factory('socket', ['$rootScope', function ($rootScope) {
  var socket = io.connect('http://localhost:8080');
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        log("client:R:"+eventName); log(data);
        var args = arguments;
        $rootScope.$apply(function () { callback.apply(socket, args); });
      });
    },
    emit: function (eventName, data, callback) {
      log("client:E:"+eventName); log(data);
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () { if (callback) { callback.apply(socket, args); } });
      })
    }
  };
}]);


taskboard.controller('TaskController', function ($scope, $document, socket) {
  $scope.data = data;
  $scope.colors = $scope.data.g_context.task_palette;
  $scope.tasks = $scope.data.tasks;
  $scope.cols = $scope.data.cols;
  $scope.colSize = Math.floor(12 / data.cols.length);

  $scope.currentTab = function(col) {
    return function(task) {
      return task.g_context.active && task.g_context.col == col;
    }
  };

  $scope.newTask = function (title, text) {
    var n = $scope.tasks.length + 1;
    var json = { "title": title || "", "text": text || "", "position": n };

    socket.emit('socket_new', json);
  }

  $scope.deleteTask = function (taskId) {
    socket.emit('socket_delete', taskId);
  }

  $scope.toggleTask = function (taskId) {
    socket.emit('socket_toggle', taskId);
  }

  $scope.saveTask = function (task) {
    socket.emit('socket_update', { "task": partialTask(task, ['title', 'text']), "tasks": [] });
  }

  $scope.colorTask = function (task, colors) {
    /* Update current task */
    task.g_context.colors = colors;

    /* Send update data to server */
    socket.emit('socket_update', { "task": partialTask(task, ['colors']), "tasks": [] } );
  }

  $scope.restoreTask = function (taskId) {
    socket.emit('socket_restore', taskId);
  }

  $scope.nav = function (tab) {
    socket.emit('socket_nav', tab);
  }

  socket.on('socket_new', function(task) {
    $scope.tasks.push(task);
  });

  socket.on('socket_delete', function(taskId) {
    var tmp = [];

    angular.forEach($scope.tasks, function (task, index) {
      if(task._id != taskId) {
        tmp.push(task);
      }
      else {
        /* If active, move to trash */
        if(task.g_context.active) {
          task.g_context.active = false;
          tmp.push(task);
        }
      }
    });
    $scope.tasks = tmp;
  });

  socket.on('socket_toggle', function(json) {
    angular.forEach($scope.tasks, function (task, index) {
      if(task._id == json.id) {
        task.g_context.visible = json.visible;
        task.g_context.height = json.height;
      }
    });
  });

  socket.on('socket_update', function(newTask) {
    angular.forEach($scope.tasks, function (task, index) {
      if(task._id == newTask._id) {
        if (newTask.title != null) { task.title = newTask.title; }
        if (newTask.text != null) { task.text = newTask.text; }
        if (newTask.g_context != null) {
          if (newTask.g_context.left != null) { task.g_context.left = newTask.g_context.left; }
          if (newTask.g_context.top != null) { task.g_context.top = newTask.g_context.top; }
          if (newTask.g_context.width != null) { task.g_context.width = newTask.g_context.width; }
          if (newTask.g_context.col != null) { task.g_context.col = newTask.g_context.col; }
          if (newTask.g_context.colors != null) { task.g_context.colors = newTask.g_context.colors; }
          if (newTask.g_context.active != null) { task.g_context.active = newTask.g_context.active; }
        }
      }
    });
  });

  socket.on('socket_restore', function (taskId) {
    angular.forEach($scope.tasks, function (task, index) {
      if(task._id == taskId) {
        task.g_context.active = true;
      }
    });
  });

  socket.on('socket_nav', function (tab) {
    switch (tab) {
      case 'tasks':
        $scope.currentTab = function(col) {
          return function(task) {
            return task.g_context.active && task.g_context.col == col;
          }
        };
        break;
      case 'trash':
        $scope.currentTab = function(col) {
          return function(task) {
            return !task.g_context.active && task.g_context.col == col;
          }
        };
        break;
    }
  });

  $scope.emit = function (message, params) {
    socket.emit(message, params);
  }

  /* Returns the col identified by the center position of the task */
  $scope.getCol = function (selector) {
    var total = 0;

    for (var i = 0; i < $scope.cols.length; i++) {
      total += $('#'+$scope.cols[i]._id).width();

      if (total > $(selector).position().left + $(selector).width()/2) {
        break;
      }
    }
    if (i >= $scope.cols.length) { i-- ; }

    return i;
  }



});


/* Create a partial task sent to server for partial update */
function partialTask(task, options) {
  var tmp = { "_id": task._id };

  if (options.indexOf("title") != -1) { tmp.title = task.title; }
  if (options.indexOf("text") != -1)  { tmp.text = task.text; }
  if (options.indexOf("geometry") != -1 || options.indexOf("col") != -1 || options.indexOf("colors") != -1) {
    tmp.g_context = {};

    if (options.indexOf("geometry") != -1) {
      tmp.g_context.left = task.g_context.left;
      tmp.g_context.top = task.g_context.top;
      tmp.g_context.width = task.g_context.width;
      tmp.g_context.height = task.g_context.height;
      tmp.g_context.active = task.g_context.active;
    }
    if (options.indexOf("col") != -1) { tmp.g_context.col = task.g_context.col; }
    if (options.indexOf("colors") != -1) { tmp.g_context.colors = task.g_context.colors; }
  }
  return tmp;
}


taskboard.directive('ngnavtpl', function() {
  return {
    template:
    '<div id="navigation">' +
      '<nav>' +
        '<div class="nav-wrapper">' +
          '<a href="" class="brand-logo">{{data.title}}</a>' +
          '<ul class="right hide-on-med-and-down">' +
            '<li>' +
              '<a id="#navhome", class="navtab", ng-click="nav(\'tasks\')"><i class="material-icons">home</i></a>' +
            '</li>' +
            '<li>' +
              '<a id="#navtrash", class="navtab", ng-click="nav(\'trash\')"><i class="material-icons">delete</i></a>' +
            '</li>' +
          '</ul>' +
        '</div>' +
      '</nav>' +
    '</div>',
    replace: true,
    restrict: 'E'
  }
})

taskboard.directive('ngbarutilstpl', function() {
  return {
    template:
    '<div id="bar" class="row">'+
      '<form class="col s12">'+
        '<div class="input-field col s2">'+
          '<textarea class="materialize-textarea title" ng-model="task.title"></textarea>'+
          '<label for="title">Title</label>'+
        '</div>'+
        '<div class="input-field col s3">'+
          '<textarea class="materialize-textarea text" ng-model="task.text"></textarea>'+
          '<label for="text">Content</label>'+
        '</div>'+
        '<button id="btn" class="btn col s1" type="button" ng-click="newTask(task.title, task.text)">New</button>'+
      '</form>'+
    '</div>',
    replace: true,
    restrict: 'E'
  }
})

taskboard.directive('ngcoltpl', function() {
  return {
    template:
    '<div id="content" class="row">' +
      '<div class="col s{{colSize}} " id="{{col._id}}" ng-repeat="col in cols">' +
        '<p class="center-align">{{col.title}}</p>' +
        '<ngtasktpl ng-repeat="task in tasks | filter:currentTab(col._id)"></ngtasktpl>' +
      '</div>' +
    '</div>',
    replace: true,
    restrict: 'E'
  }
});

taskboard.directive('ngtasktpl', function() {
  return {
    template:
    '<div id="{{task._id}}" draggable class="panel panel-default card lighten-3" ng-class="{active: task.g_context.active}" style="height: {{task.g_context.visible ? task.g_context.height : data.g_context.task.hiddenHeight}}px; width: {{data.g_context.task.width}}px; position: relative; left: {{task.g_context.left}}px; top: {{task.g_context.top}}px;">' +
      '<div class="panel-heading card-action lighten-2" style="background-color: {{task.g_context.colors.color1}}; color: {{task.g_context.colors.color3}}">' +
        '<div class="panel-title" ng-model="task.title">{{task.title}}</div>' +
        '<div class="toolbar">' +
          '<i class="restore tiny material-icons" ng-click="restoreTask(task._id)" ng-hide="{{task.g_context.active}}">restore</i>' +
          '<i class="save tiny material-icons" ng-click="saveTask(task)">save</i>' +
          '<i class="toggle tiny material-icons" ng-click="toggleTask(task._id)">call_received</i>' +
          '<i class="delete tiny material-icons" ng-click="deleteTask(task._id)">delete</i>' +
        '</div>' +
      '</div>' +
      '<div class="panel-body card-content" style="background-color: {{task.g_context.colors.color2}}" ng-show="task.g_context.visible" ng-hide="!task.g_context.visible">' +
        '<textarea class="text" style="background-color: {{task.g_context.colors.color2}}; color: {{task.g_context.colors.color3}}" ng-model="task.text">{{task.text}}</textarea>' +
        '<div class="palette">' +
          '<div class="color" ng-repeat="color in colors" ng-click="colorTask(task, color)">' +
            '<div class="color1" style="background: {{color.color1}}; color: {{color.color3}}"></div>' +
            '<div class="color2" style="background: {{color.color2}}"></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>',
    replace: true,
    restrict: 'E'
  }
})


taskboard.directive('draggable', function($document) {
  return function(scope, element, attr) {
    var startX = 0, startY = 0, x = 0, y = 0;

    element.on('mousedown', function(event) {

      var classes = event.target.className;

      if( classes.indexOf("panel") != -1 || classes.indexOf("panel-heading") != -1 || classes.indexOf("panel-title") != -1 ) {
        event.preventDefault();
        startX = event.screenX - x; startY = event.screenY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      }
    });

    function mousemove(event) {
      y = event.screenY - startY; x = event.screenX - startX;
      element.css({ top: y + 'px', left:  x + 'px' });
      var task = partialTask(scope.task, ['geometry']);
      task.g_context.top = y;
      task.g_context.left = x;

      scope.$apply(function () { scope.emit('socket_update', { "task": task, "tasks": [] })} );
    }

    function mouseup() {
      $document.off('mousemove', mousemove);
      $document.off('mouseup', mouseup);

      scope.task.g_context.col = scope.getCol("#"+scope.task._id);
      element.css({ left: data.g_context.task.left+'px', top: data.g_context.task.top+'px' });

      var tasksArray = [];
      for (var i = 0; i < scope.tasks.length; i++) {
        tasksArray.push({ "id": scope.tasks[i]._id, "position": i });
      }

      scope.$apply(function () { scope.emit('socket_update', { "task": partialTask(scope.task, ['geometry', 'col']), "tasks": tasksArray }); });
    }
  };
});
