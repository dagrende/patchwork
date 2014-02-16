'use strict';

angular.module('patchworkApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
]).service('board', function() {
  console.log('service board');
  return {notes: [{text:'hej'}, {text:'du'}],
    boardNotes: [{x: 100, y: 20, note: {text: 'glade'}}]};
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
});