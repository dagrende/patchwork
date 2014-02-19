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
  $('#board').height(window.innerHeight + 'px');
  board.notes = board.notes.filter(function(item, i) {return item.text;});
      $scope.notes = board.notes;
      $scope.boardNotes = board.boardNotes;

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
          console.log(ev);
          console.log($('#board-notes').offset());
          var noteIndex = attr.draggableFrom;
          var x = ev.pageX - ev.offsetX;
          var y = ev.pageY - ev.offsetY;
          console.log('x',x,'y',y);
          board.boardNotes.push({x: x, y: y, note:board.notes[noteIndex]});
          board.notes.splice(noteIndex, 1);
          scope.$apply();
        }
      });
    }
  }
});