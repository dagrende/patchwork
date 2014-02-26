'use strict';

describe('Controller: BoardCtrl', function () {

  // load the controller's module
  beforeEach(module('patchworkApp'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    MainCtrl = $controller('BoardCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.getNotes().length).toBe(1);
  });
});

describe('test BoardModel', function() {
  var bm;

  beforeEach(function() {
    bm = BoardModel();
  });

  it('should be empty initially', function() {
    expect(bm.getNotes().length).toBe(0);
    expect(bm.getBoardNotes().length).toBe(0);
  });

  it('should contain a created note', function() {
    bm.createNote('hej');
    expect(bm.getNotes().length).toBe(1);
    expect(bm.getNotes()[0].text).toBe('hej');
  });

  it('note id meets some critera of a RFC 4122 guid', function() {
    bm.createNote('hej');
    var id = bm.getNotes()[0].id;
    var idParts = id.split('-');
    expect(idParts.length).toBe(5);
    expect(idParts.map(function(part) {return part.length})).toEqual([8, 4, 4, 4, 12]);
    expect(idParts[2][0]).toBe('4');
    expect(idParts[3][0]).toMatch(/[89ab]/);
  });

  it('create three notes, find the second one', function() {
    var n1 = bm.createNote('hej');
    var n2 = bm.createNote('du');
    var n3 = bm.createNote('glade');
    expect(bm.findNote(n2.id)).toBe(n2);
  });

  it('create and place three notes, find the second one', function() {
    var n1 = bm.createNote('hej'); bm.placeNote(n1.id, 10, 10);
    var n2 = bm.createNote('du'); bm.placeNote(n2.id, 10, 20);
    var n3 = bm.createNote('glade'); bm.placeNote(n3.id, 10, 30);
    expect(bm.findBoardNote(n2.id)).toEqual({note:n2, x:10, y:20});
  });

  it('create two notes, delete the first and the second one should remain', function() {
    var n1 = bm.createNote('hej');
    var n2 = bm.createNote('du');
    bm.deleteNote(n1.id);
    expect(bm.getNotes().length).toBe(1);
    expect(bm.getNotes()[0].text).toBe('du');
  });

  it('placed note should not be in getNotes(), but in getBoardNotes()', function() {
    var n1 = bm.createNote('hej');
    bm.placeNote(n1.id, 10, 20);
    expect(bm.getNotes().length).toBe(0);
    expect(bm.getBoardNotes().length).toBe(1);
    expect(bm.getBoardNotes()[0]).toEqual({note:n1, x:10, y:20});
  });

  it('placed and unplaced note should be back in getNotes()', function() {
    var n1 = bm.createNote('hej');
    bm.placeNote(n1.id, 10, 20);
    bm.unplaceNote(n1.id);
    expect(bm.getNotes().length).toBe(1);
    expect(bm.getBoardNotes().length).toBe(0);
  });

});

describe('test RemoteEnabler', function() {
  var service, serviceToSpyOn, txr;

  beforeEach(function() {

    serviceToSpyOn = {
      createNote: function(text) {return {id:'qwe', text:text}}
    }

    service = {
      createNote: function(text) {return serviceToSpyOn.createNote(text)}
    }

    txr = {
      send: function(methodName, args, result) {},
      onReceive: function(receiveHandler) {this.receiveHandler = receiveHandler},
      fakeReceive: function(method, args) {
        this.receiveHandler(method, args);
      }
    };

    spyOn(serviceToSpyOn, 'createNote').andCallThrough();;
    spyOn(txr, 'send');

    new RemoteEnabler(service, ['createNote'], txr)
  });

  it('service with RemoteEnabler should still work when called', function() {
    var result = service.createNote('hej');
    expect(serviceToSpyOn.createNote).toHaveBeenCalledWith('hej');
    expect(txr.send).toHaveBeenCalledWith('createNote', ['hej'], {id:'qwe', text:'hej'});
  });

  it('trx should be able to call service', function() {
    txr.fakeReceive('createNote', ['hej']);
    expect(serviceToSpyOn.createNote).toHaveBeenCalledWith('hej');
    expect(txr.send).not.toHaveBeenCalled();
  });

});