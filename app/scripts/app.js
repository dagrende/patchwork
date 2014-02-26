'use strict';

angular.module('patchworkApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
]).service('board', function() {
  var f = BoardModel();
  var trx = {
    send: function(method, args, result) {console.log('send', method, args, result)},
    onReceive: function() {console.log('onReceive')}
  };
  new RemoteEnabler(f, ['createNote', 'placeNote', 'unplaceNote', 'moveBoardNote', 'setNoteText'], trx);
  f.createNote('hej');
  var n = f.createNote('du');
  f.placeNote(n.id, 100, 100);
  return f;
})
.config(function ($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/board.html',
    controller: 'BoardCtrl'
  })
  .when('/edit/:noteId', {
    templateUrl: 'views/view-note.html',
    controller: 'ViewNoteCtrl'
  })
  .otherwise({
    redirectTo: '/'
  });
})
.controller('BoardCtrl', function ($scope, board) {
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
  $('#board').height(window.innerHeight + 'px');
  //board.notes = board.notes.filter(function(item) {return item.text;});
  $scope.getNotes = board.getNotes;
  $scope.getBoardNotes = board.getBoardNotes;
  $scope.base = findPos($('#board-notes').get(0));

  $scope.editNote = function(id) {
    window.location.href = '#/edit/' + id;
  };

  $scope.createNote = function() {
    window.location.href = '#/edit/' + board.createNote('').id;
  };
})
.controller('ViewNoteCtrl', function ($scope, $routeParams, $location, board) {
  var noteId = $routeParams.noteId;
  var note = board.findNote(noteId);
  $scope.text = note.text;
  $scope.save = function() {
    board.setNoteText(noteId, $scope.text);
    $location.path('/');
  }
  $scope.delete = function () {
    console.log('delete');
  };
})
.directive('draggableFrom', function(board) {
  return {
    restrict: 'A',
    link: function(scope, elm, attr) {
      var downX, downY;
      $(elm).mousedown(function(ev) {
        downX = ev.clientX;
        downY = ev.clientY;
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
        var noteId = attr.draggableFrom;
        var note = board.findNote(noteId);
        var base = $('#board-notes').offset();
        var x = ev.pageX - ev.offsetX - base.left;
        var y = ev.pageY - ev.offsetY - base.top;
        if (y < 0) {
          ui.helper[0].style.left = 0;
          ui.helper[0].style.top = 0;
        } else {
          board.placeNote(noteId, x, y);
        }
        scope.$apply();
      };
      $(elm).draggable({
        stop: dragEnd
      });
    }
  };
}).directive('draggableOnBoard', function(board) {
  return {
    restrict: 'A',
    link: function(scope, elm, attr) {
      var downX, downY;
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
        var noteId = attr.draggableOnBoard;
        var boardNote = board.findBoardNote(noteId);
        var base = $('#board-notes').offset();
        var x = ev.pageX - ev.offsetX - base.left;
        var y = ev.pageY - ev.offsetY - base.top;
        if (y < 0) {
          // drop in my notes area
          board.unplaceNote(noteId);
        } else{
          board.moveBoardNote(noteId, x, y);
        }
        scope.$apply();
      };
      $(elm).draggable({
        stop: dragEnd
      });
    }
  };
});