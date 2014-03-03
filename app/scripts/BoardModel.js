/**
 * Created by dag on 2014-02-24.
 */
function BoardModel() {
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
    createNote: function(attrMap){
      var newNote = {id:guid()};
      for (key in attrMap) {
        newNote[key] = attrMap[key];
      }
      notes.push(newNote);
      return newNote.id;
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
    },
    setNoteAttr: function(id, attrMap) {
      console.log('setNoteAttr(', id, ', ', attrMap, ')');
      var note = this.findNote(id);
      if (note) {
        for (key in attrMap) {
          note[key] = attrMap[key];
        }
      }
    }
  };
  return f;
}