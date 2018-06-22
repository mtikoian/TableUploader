(function() {
	'use strict'
	
	angular.module('app')
		.factory('AuthSvc', AuthSvc)
		.factory('Base64', Base64);
		
	function AuthSvc(Base64, $http, $cookieStore, $rootScope, $timeout, AppSvc, SharedSvc) {
	    var service = {};

	    toastr.options = {
	        "closeButton": true,
	        "debug": false,
	        "newestOnTop": false,
	        "progressBar": true,
	        "positionClass": "toast-top-center",
	        "preventDuplicates": true,
	        "onclick": null,
	        "showDuration": "750",
	        "hideDuration": "1000",
	        "timeOut": "3000",
	        "extendedTimeOut": "1000",
	        "showEasing": "swing",
	        "hideEasing": "linear",
	        "showMethod": "fadeIn",
	        "hideMethod": "fadeOut"
	    }

		service.Login = function(username, password, callback) {
			
			/* Dummy authentication for testing, uses $timeout to simulate api call
	             ----------------------------------------------*/
	        /*$timeout(function(){
	            var response = { success: username === 'test' && password === 'test' };
	            if(!response.success) {
	                response.message = 'Username or password is incorrect';
	            }
	            callback(response);
	        }, 1000);*/
			$http.defaults.headers.common['Authorization'] = 'Basic ' + Base64.encode(username + ':' + password);
			
			
		    $http.get(AppSvc.apiPathCube + '/api/login/IsValidUser?username=' + username)
				.success(function(response) {
					//response.success = true;
				    callback(response);

				    if (response == false) {
				        toastr.error('User does have access to this application.');
				    }
				})
				.error(function(response) {
					response.message = 'Username or password is incorrect';
			});
			
			
		};
		
		service.SetCredentials = function(username, password) {
			//var authData = Base64.encode(username + ':' + password);
			
			$rootScope.globals = {
				currentUser: {
					username: username,
					authdata: $http.defaults.headers.common.Authorization
				}
			};
			
			//$http.defaults.headers.common['Authorization'] = 'Basic ' + authData; //jshint ignore:line
			$cookieStore.put('globals', $rootScope.globals);
		};
		
		service.ClearCredentials = function() {
			$rootScope.globals = {};
			$cookieStore.remove('globals');
			$http.defaults.headers.common.Authorization = 'Basic ';
			SharedSvc.setGeog("");
		};
		
		return service;
	}
	
	function Base64() {
		/* jshint ignore:start */
		
		var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
		
		return {
			encode: function(input) {
				var output = "";
				var chr1, chr2, chr3 = "";
				var enc1, enc2, enc3, enc4 = "";
				var i = 0;
				
				do {
					chr1 = input.charCodeAt(i++);
	                chr2 = input.charCodeAt(i++);
	                chr3 = input.charCodeAt(i++);
	 
	                enc1 = chr1 >> 2;
	                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
	                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
	                enc4 = chr3 & 63;
	 
	                if (isNaN(chr2)) {
	                    enc3 = enc4 = 64;
	                } else if (isNaN(chr3)) {
	                    enc4 = 64;
	                }
	 
	                output = output +
	                    keyStr.charAt(enc1) +
	                    keyStr.charAt(enc2) +
	                    keyStr.charAt(enc3) +
	                    keyStr.charAt(enc4);
	                chr1 = chr2 = chr3 = "";
	                enc1 = enc2 = enc3 = enc4 = "";
	            } while (i < input.length);
	 
	            return output;
	        },
	        
	        decode: function(input) {
	        	var output = "";
	            var chr1, chr2, chr3 = "";
	            var enc1, enc2, enc3, enc4 = "";
	            var i = 0;
	 
	            // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
	            var base64test = /[^A-Za-z0-9\+\/\=]/g;
	            if (base64test.exec(input)) {
	                window.alert("There were invalid base64 characters in the input text.\n" +
	                    "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
	                    "Expect errors in decoding.");
	            }
	            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
	 
	            do {
	                enc1 = keyStr.indexOf(input.charAt(i++));
	                enc2 = keyStr.indexOf(input.charAt(i++));
	                enc3 = keyStr.indexOf(input.charAt(i++));
	                enc4 = keyStr.indexOf(input.charAt(i++));
	 
	                chr1 = (enc1 << 2) | (enc2 >> 4);
	                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
	                chr3 = ((enc3 & 3) << 6) | enc4;
	 
	                output = output + String.fromCharCode(chr1);
	 
	                if (enc3 != 64) {
	                    output = output + String.fromCharCode(chr2);
	                }
	                if (enc4 != 64) {
	                    output = output + String.fromCharCode(chr3);
	                }
	 
	                chr1 = chr2 = chr3 = "";
	                enc1 = enc2 = enc3 = enc4 = "";
	 
	            } while (i < input.length);
	 
	            return output;
	        }
		};
	}
})();