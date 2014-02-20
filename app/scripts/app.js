'use strict';

angular.module('patchworkApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
]).service('board', function() {
  console.log('service board');
  return {notes: [{text:'hej'}, {text:'du'}],
    boardNotes: []};
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
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
    }
    return {x:curleft, y:curtop};
  }
  $('#board').height(window.innerHeight + 'px');
  board.notes = board.notes.filter(function(item) {return item.text;});
  $scope.notes = board.notes;
  $scope.boardNotes = board.boardNotes;
  $scope.base = findPos($('#board-notes').get(0));

  $scope.editNote = function(id) {
    window.location.href = '#/edit/' + id;
  };

  $scope.createNote = function() {
    board.notes.push({text:''});
    var i = board.notes.length - 1;
    window.location.href = '#/edit/' + i;
  };
})
.controller('ViewNoteCtrl', function ($scope, $routeParams, $location, board) {
  var noteId = $routeParams.noteId;
  $scope.note = board.notes[noteId];
})
.directive('draggableFrom', function(board) {
  return {
    restrict: 'A',
    link: function(scope, elm, attr) {
      var downX, downY;
      $(elm).draggable();
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
        } else {
          // drag
          var noteIndex = attr.draggableFrom;
          var base = $('#board-notes').offset();
          var x = ev.pageX - ev.offsetX - base.left;
          var y = ev.pageY - ev.offsetY - base.top;
          var boardNote = {x: x, y: y, note:board.notes[noteIndex]};
          board.boardNotes.push(boardNote);
          board.notes.splice(noteIndex, 1);
          scope.$apply();
        }
      });
    }
  }
});