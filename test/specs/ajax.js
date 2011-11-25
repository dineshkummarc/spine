describe("Ajax", function(){
  var User;
  var jqXHR;
    
  beforeEach(function(){
    Spine.Ajax.requests = [];
    Spine.Ajax.pending  = false;
    
    User = Spine.Model.setup("User", ["first", "last"]);
    User.extend(Spine.Model.Ajax);
    Story = Spine.Model.setup("Story", ["title", "description"]);
    Story.extend(Spine.Model.Ajax);

    
    jqXHR = $.Deferred();

    $.extend(jqXHR, {
  		readyState: 0,
  		setRequestHeader: function() { return this; },
  		getAllResponseHeaders: function() {},
  		getResponseHeader: function() {},
  		overrideMimeType: function() { return this; },
  		abort: function() { return this; },
  		success: jqXHR.done,
  		error: jqXHR.fail,
  		complete: jqXHR.done
  	});
  });
  
  it("can send POST on create", function(){
    spyOn(jQuery, "ajax").andReturn(jqXHR);
    
    User.create({first: "Hans", last: "Zimmer", id: "IDD"});
    
    expect(jQuery.ajax).toHaveBeenCalledWith({
      type:         'POST', 
      headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
      contentType:  'application/json', 
      dataType:     'json', 
      data:         '{"first":"Hans","last":"Zimmer","id":"IDD"}', 
      url:          '/users', 
      processData:  false
    });
  });
  
  it("can send PUT on update", function(){
      User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
      
      spyOn(jQuery, "ajax").andReturn(jqXHR);
      
      User.first().updateAttributes({first: "John2", last: "Williams2"});
      
      expect(jQuery.ajax).toHaveBeenCalledWith({
        type:         'PUT', 
        headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
        contentType:  'application/json', 
        dataType:     'json', 
        data:         '{"first":"John2","last":"Williams2","id":"IDD"}', 
        url:          '/users/IDD', 
        processData:  false
      });
    });
    
    it("can send DELETE on destroy", function(){
      User.refresh([{first: "John", last: "Williams", id: "IDD"}]);
      
      spyOn(jQuery, "ajax").andReturn(jqXHR);
      
      User.first().destroy();
      
      expect(jQuery.ajax).toHaveBeenCalledWith({
        contentType: 'application/json', 
        headers:     { 'X-Requested-With' : 'XMLHttpRequest' },
        dataType:   'json', 
        processData: false, 
        type:        'DELETE', 
        url:         '/users/IDD' 
      })
    });
    
    it("can update record after PUT/POST", function(){
      spyOn(jQuery, "ajax").andReturn(jqXHR);
      
      User.create({first: "Hans", last: "Zimmer", id: "IDD"});
      
      var newAtts = {first: "Hans2", last: "Zimmer2", id: "IDD"};
      jqXHR.resolve(newAtts);
      
      expect(User.first().attributes()).toEqual(newAtts);
    });
    
    it("can change record ID after PUT/POST", function(){
      spyOn(jQuery, "ajax").andReturn(jqXHR);
      
      User.create({id: "IDD"});
      
      var newAtts = {id: "IDD2"};
      jqXHR.resolve(newAtts);
      
      expect(User.first().id).toEqual("IDD2");
      expect(User.records["IDD2"]).toEqual(User.first());
    });
    
    it("should send requests syncronously", function(){
      spyOn(jQuery, "ajax").andReturn(jqXHR);
      
      User.create({first: "First"});
      
      expect(jQuery.ajax).toHaveBeenCalled();
          
      jQuery.ajax.reset()
      
      User.create({first: "Second"});
    
      expect(jQuery.ajax).not.toHaveBeenCalled();
      jqXHR.resolve();
      expect(jQuery.ajax).toHaveBeenCalled();
    });
    
    it("should have success callbacks", function(){
      spyOn(jQuery, "ajax").andReturn(jqXHR);
      
      var noop = {spy: function(){}};
      spyOn(noop, "spy");
      var spy = noop.spy;
      
      User.create({first: "Second"}, {success: spy});
      jqXHR.resolve();
      expect(spy).toHaveBeenCalled();
    });
    
    it("should have error callbacks", function(){
      spyOn(jQuery, "ajax").andReturn(jqXHR);
      
      var noop = {spy: function(){}};
      spyOn(noop, "spy");
      var spy = noop.spy;
      
      User.create({first: "Second"}, {error: spy});
      jqXHR.reject();
      expect(spy).toHaveBeenCalled();
    });

    it("should expose the defaults object", function(){
      expect(Spine.Ajax.defaults).toBeDefined();
    });
    
    it("pluralizes correctly", function(){
      spyOn(jQuery, "ajax").andReturn(jqXHR);

      Story.create({title: "hello", description: "no", id: "IDD"});

      expect(jQuery.ajax).toHaveBeenCalledWith({
        type:         'POST', 
        headers:      { 'X-Requested-With' : 'XMLHttpRequest' },
        contentType:  'application/json', 
        dataType:     'json', 
        data:         '{"title":"hello","description":"no","id":"IDD"}', 
        url:          '/stories', 
        processData:  false
      });
    });
});
