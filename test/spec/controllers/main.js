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
    bm.createNote({text: 'hej'});
    expect(bm.getNotes().length).toBe(1);
    expect(bm.getNotes()[0].text).toBe('hej');
  });

  it('note id meets some critera of a RFC 4122 guid', function() {
    bm.createNote({text: 'hej'});
    var id = bm.getNotes()[0].id;
    var idParts = id.split('-');
    expect(idParts.length).toBe(5);
    expect(idParts.map(function(part) {return part.length})).toEqual([8, 4, 4, 4, 12]);
    expect(idParts[2][0]).toBe('4');
    expect(idParts[3][0]).toMatch(/[89ab]/);
  });

  it('create three notes, find the second one', function() {
    var n1 = bm.createNote({text: 'hej'});
    var n2 = bm.createNote({text: 'du'});
    var n3 = bm.createNote({text: 'glade'});
    expect(bm.findNote(n2).id).toBe(n2);
  });

  it('create and place three notes, find the second one', function() {
    var n1 = bm.createNote({text: 'hej'}); bm.placeNote(n1, 10, 10);
    var n2 = bm.createNote({text: 'du'}); bm.placeNote(n2, 10, 20);
    var n3 = bm.createNote({text: 'glade'}); bm.placeNote(n3, 10, 30);
    var bn = bm.findBoardNote(n2);
    expect(bn.note.id).toEqual(n2);
    expect(bn.x).toEqual(10);
    expect(bn.y).toEqual(20);
  });

  it('create two notes, delete the first and the second one should remain', function() {
    var n1 = bm.createNote({text: 'hej'});
    var n2 = bm.createNote({text: 'du'});
    bm.deleteNote(n1);
    expect(bm.getNotes().length).toBe(1);
    expect(bm.getNotes()[0].text).toBe('du');
  });

  it('placed note should not be in getNotes(), but in getBoardNotes()', function() {
    var n1 = bm.createNote({text: 'hej'});
    bm.placeNote(n1, 10, 20);
    var bn = bm.getBoardNotes()[0];
    expect(bm.getNotes().length).toBe(0);
    expect(bm.getBoardNotes().length).toBe(1);
    expect(bm.getBoardNotes()[0]).toEqual(bn);
  });

  it('placed and unplaced note should be back in getNotes()', function() {
    var n1 = bm.createNote({text: 'hej'});
    bm.placeNote(n1, 10, 20);
    bm.unplaceNote(n1);
    expect(bm.getNotes().length).toBe(1);
    expect(bm.getBoardNotes().length).toBe(0);
  });

});

describe('test RemoteEnabler', function() {
  var service, serviceToSpyOn, txr;

  beforeEach(function() {

    serviceToSpyOn = {
      createNote: function(text) {return 'qwe'}
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
    var result = service.createNote({text: 'hej'});
    expect(serviceToSpyOn.createNote).toHaveBeenCalledWith({text: 'hej'});
    expect(txr.send).toHaveBeenCalledWith('createNote', [{text: 'hej'}], 'qwe');
  });

  it('trx should be able to call service', function() {
    txr.fakeReceive('createNote', [{text: 'hej'}]);
    expect(serviceToSpyOn.createNote).toHaveBeenCalledWith({text: 'hej'});
    expect(txr.send).not.toHaveBeenCalled();
  });

});