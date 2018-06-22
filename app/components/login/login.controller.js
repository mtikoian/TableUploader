(function() {
	'use strict'
	
	angular.module('app')
		.controller('LoginCtrl', LoginCtrl);
		
	function LoginCtrl($scope, $rootScope, $location, AuthSvc) {
		AuthSvc.ClearCredentials();
		var wh, ww;
		wh = $(window).height();
		ww = $(window).width();

		$scope.login = function() {
			//var x = $http.defaults.headers.common.Authorization;
		
		
			if ($scope.username.indexOf('@') > -1){
				$scope.error = 'Username can not be an email address.';
				$scope.dataLoading = false;
			
			}
			else{
				$scope.dataLoading = true;
				AuthSvc.Login($scope.username, $scope.password, function(response) {
					//if (response.success) {
					if (response) {
						AuthSvc.SetCredentials($scope.username, $scope.password);
						$location.path('/tables');
						$scope.dataLoading = false;
					} else {
						$scope.error = response.message;
						$scope.dataLoading = false;
					}
				});
			
			}
		
		};
	}
})();