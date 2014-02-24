'use strict';

angular.module('patchworkApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
]).service('board', function() {
  var notes = [];
  var boardNotes = [];
  var guid = function(){
    // http://www.broofa.com/2008/09/javascript-uuid-function/
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
      }
    );
  };
  var indexOfNote = function(id) {
    for (var i in notes) {
      if (id === notes[i].id) {
        return i;
      }
    }
    return undefined;
  };
  var indexOfBoardNote = function(id) {
    for (var i in boardNotes) {
      if (id === boardNotes[i].note.id) {
        return i;
      }
    }
    return undefined;
  };
  var f = {
    findNote: function(id) {
      var i = indexOfNote(id);
      return i && notes[i];
    },
    findBoardNote: function(id) {
      var i = indexOfBoardNote(id);
      return i && boardNotes[i];
    },
    getNotes: function(){
      return notes.filter(function(note) {return !f.findBoardNote(note.id)});
    },
	  getBoardNotes: function(){
      return boardNotes;
    },
	  createNote: function(text){
      var newNote = {id:guid(), text:text};
      notes.push(newNote);
      return newNote;
    },
	  deleteNote: function(id){
      this.unplaceNote(id);
      var i = indexOfNote(id);
      if (i) {
        notes.splice(i, 1);
      }
    },
	  placeNote: function(id, x, y) {
      boardNotes.push({x:x, y:y, note:this.findNote(id)});
    },
	  unplaceNote: function(id){
      var i = indexOfBoardNote(id);
      if (i) {
        boardNotes.splice(i, 1);
      }
    },
	  moveBoardNote: function(id, x, y) {
      var bn = this.findBoardNote(id);
      if (bn) {
        bn.x = x;
        bn.y = y;
      }
    }
  };
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
    if (obj.offsetParent) {
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
  $scope.note = board.findNote(noteId);
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