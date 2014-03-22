'use strict';

angular.module('patchworkApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
]).service('socket', function() {
  var socket = io.connect();
  socket.on('connect', function() {
    console.log("connect");
  });
  socket.on('disconnect', function() {
    console.log("disconnect");
  });
  return  socket;
}).service('board', function(socket, $rootScope) {
  var f = BoardModel();
  var trx = new SocketIoTranceiver(socket);
  var redrawTrigger = function() {
    $rootScope.$apply();
  }
  new RemoteEnabler(f, ['clearAll', 'createNote', 'deleteNote', 'placeNote',
    'unplaceNote', 'moveBoardNote', 'setNoteAttr'], trx, redrawTrigger);
  return f;
})
.config(function ($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/board.html',
    controller: 'BoardCtrl'
  })
  .when('/create', {
    templateUrl: 'views/view-note.html',
    controller: 'CreateNoteCtrl'
  })
  .when('/edit/:noteId', {
    templateUrl: 'views/view-note.html',
    controller: 'ViewNoteCtrl'
  })
  .otherwise({
    redirectTo: '/'
  });
})
.controller('BoardCtrl', function ($scope, board, socket) {
  function findPos(obj) {
    var curleft = 0;
    var curtop = 0;
    if (obj && obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
        obj = obj.offsetParent;
      } while (obj);
    }
    return {x:curleft, y:curtop};
  }
  $scope.getNotes = board.getNotes;
  $scope.getBoardNotes = board.getBoardNotes;
  $scope.base = findPos($('#board-notes').get(0));

  $scope.editNote = function(id) {
    window.location.href = '#edit/' + id;
  };

  $scope.createNote = function() {
    window.location.href = '#create';
  };
  function adjustScroller() {
    $('.my-notes').css('max-width', window.innerWidth - 100);
  }
  $(function() {
     adjustScroller();
  });
  window.onresize = adjustScroller;
})
.controller('CreateNoteCtrl', function ($scope, $routeParams, $location, board) {
  $scope.isCreate = true;
  $scope.text = '';
  $scope.cancel = function() {
    $location.path('#');
  }
  $scope.save = function() {
    var noteId = board.createNote({text:$scope.text})
    $location.path('#');
  }
})
.controller('ViewNoteCtrl', function ($scope, $routeParams, $location, board) {
  $scope.isCreate = false;
  var noteId = $routeParams.noteId;
  var note = board.findNote(noteId);
  $scope.text = note.text;
  $scope.cancel = function() {
    $location.path('#');
  }
  $scope.save = function() {
    board.setNoteAttr(noteId, {text: $scope.text});
    $location.path('#');
  }
  $scope.deleteNote = function () {
    board.deleteNote(noteId);
    $location.path('#');
  };
})
.directive('draggableFrom', function(board) {
  return {
    restrict: 'A',
    link: function(scope, elm, attr) {
      var noteId = attr.draggableFrom;
      var note = board.findNote(noteId);
      var base = $('#board-notes').offset();
      var downX, downY, offsetX, offsetY;
      $(elm).mousedown(function(ev) {
        downX = ev.clientX;
        downY = ev.clientY;
        var elmOffset = $(elm).offset();
        offsetX = downX - elmOffset.left;
        offsetY = downY - elmOffset.top;
      });
      $(elm).mouseup(function(ev) {
        var dx = ev.clientX - downX;
        var dy = ev.clientY - downY;
        if (dx*dx + dy*dy < 9) {
          // click
          window.location.href = '#/edit/' + attr.draggableFrom;
        }
      });
      var dragEnd = function(ev, ui) {
        // drag
        console.log('base',base,'ev',ev,'note',note,'down',downX,downY);
        var x = ev.pageX - offsetX - base.left;
        var y = ev.pageY - offsetY - base.top;
        if (y < 0) {
          ui.helper[0].style.left = 0;
          ui.helper[0].style.top = 0;
        } else {
          board.placeNote(noteId, x, y);
        }
        scope.$apply();
      };
      $(elm).draggable({
        stop: dragEnd,
        helper: 'clone'
      });
    }
  };
}).directive('draggableOnBoard', function(board) {
  return {
    restrict: 'A',
    link: function(scope, elm, attr) {
      var noteId = attr.draggableOnBoard;
      var boardNote = board.findBoardNote(noteId);
      var base = $('#board-notes').offset();
      var downX, downY, offsetX, offsetY;
      $(elm).mousedown(function(ev) {
        downX = ev.clientX;
        downY = ev.clientY;
      });
      $(elm).mouseup(function(ev) {
        var dx = ev.clientX - downX;
        var dy = ev.clientY - downY;
        if (dx*dx + dy*dy < 9) {
          // click
          window.location.href = '#/edit/' + attr.draggableOnBoard;
        }
      });
      var dragEnd = function(ev) {
        var x = ev.pageX - base.left;
        var y = ev.pageY - base.top;
        if (y < 0) {
          // drop in my notes area
          board.unplaceNote(noteId);
        } else{
          var dx = ev.clientX - downX;
          var dy = ev.clientY - downY;
          board.moveBoardNote(noteId, boardNote.x + dx, boardNote.y + dy);
        }
        scope.$apply();
      };
      $(elm).draggable({
        stop: dragEnd
      });
    }
  };
});