var appjet = (function(){
	
	return {
		
		onLoadStart: function() {},
		onLoadEnd: function() {},
		safelyLoadStart: function() {
			try {
				onLoadStart();
			} catch (e) {
				
			}
		},
		safelyLoadEnd: function() {
			try {
				onLoadEnd();
			} catch (e) {
				
			}
		},
		init: function() {
			var appjet = this;
			if(window.console) {
				console.log("Initialising script executor");
			}
			var domain;
			var endpoint;

			resolveEndpoints();
			
			$.fn.extend({
				completeFunction: function() {},
				complete: function(completeFunction){
					this.completeFunction = completeFunction;
				},
				server:function(data, serverFunction) {
					var rhino = this;
					var theFunction;
					if(typeof arguments[0] == 'function') {
						// No data, only the callback function
						theFunction = arguments[0];
						var script = theFunction.toString();
						appjet.safelyLoadStart();
						$.post(endpoint, {script:script}, function(data){
							try {
								rhino.completeFunction(data);
							} finally {
								appjet.safelyLoadEnd();
							}
						});
					} else {
						// Both data and callback function
						var script = serverFunction.toString();
						var dataString = JSON.stringify(data);
						appjet.safelyLoadStart();
						console.log("sending query to " + endpoint);
						$.post(endpoint, {script:script, data:dataString}, function(data){
							alert('ajax call');
							try {
								rhino.completeFunction(data);
							} finally {
								appjet.safelyLoadEnd();
							}
						}).error(function(jqXHR, textStatus, errorThrown){
							window.alert('error making ajax call to backend' + textStatus + errorThrown);
						});
					}
					return this;
				}
			});
			
			function resolveDomain() {
				if(window.PhoneGap) {
					domain = "http://www.pixeljet.net/";
				} else {
					var host = window.location.hostname;
					domain = "http://" + host + "/";
				}
			}
			
			function resolveEndpoints() {
				resolveDomain();
				endpoint = domain + "script/execute";
			}
		}
	}
	
	
})();

appjet.init();


document.addEventListener("deviceready", function(){
    
     console.log("Executing document ready.");
     window.alert('ready');
     appjet.onLoadStart = function() {
    	 $("#go").button('loading');
     };
     appjet.onLoadEnd = function() {
    	 $("#go").button('reset');
     };
     
     $("#go").click(function(){
         window.alert('go');
    	// If deploying this for real, you will want some better input validation! This only checks string length
        var query = $("#query").val();
        if(query.length<1) {
            return;
        }
        
        var data = { query : query };
        console.log("Requesting product data");
        
		$().server(data, function(data){
			if(validate(data)) {
				return shopping.queryProducts(data.query).items;
			} else {
				return [{}];
			}
			function validate(data) {
				return (data && data.query && data.query != '' && data.query.length<20);
			}
    	}).complete(function(result) {
    		window.alert("Inserting " + result.length + " products");
            $(".products").empty();
            $(result).each(function(index, product){
                insert(product);
            });
    		
    	});
		
	});
	function insert(data) {
        console.log("Inserting product data.");
		/**
		 * Many people would use a templating system here, but the HTML is very simple so
		 * I decided to just go 'commando' with dom methods. I'm
		 * not suggesting that people build complex UI elements this way!
		 */
	    var title = document.createElement('h2');
	    var link = document.createElement('a');
	    link.href = data.product.link;
	    link.innerText = data.product.title;
	    title.appendChild(link);
		var image = document.createElement('img');
		var container = document.createElement('section')
		container.className = "product";
		image.alt = "product image";
		image.src = data.product.images[0].link;
		container.appendChild(title);
		container.appendChild(image);
		$(".products").append(container);

	}
}, false);