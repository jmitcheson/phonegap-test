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
        console.log("Requesting product data.", data);
        
		$().server(data, function(data){
			if(validate(data)) {
				var a = shopping.queryProducts(data.query);
				return a.items;
			} else {
				return [{}];
			}
			function validate(data) {
				return (data && data.query && data.query != '' && data.query.length<20);
			}
    	}).complete(function(result) {
            console.log("Product data received.", result);
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