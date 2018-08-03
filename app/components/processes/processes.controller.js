(function() {
	'use strict'
	
	angular.module('app')
		.controller('ProcessesCtrl', ProcessesCtrl);
		
	function ProcessesCtrl($scope, $http, $location, $window, SharedSvc, AppSvc, $rootScope) {

	    $("#runProcessBtn").kendoButton();
	    $("#refreshBtn").kendoButton();
	    var processButton = $("#runProcessBtn").data("kendoButton");
	    processButton.enable(false);
	    var refreshButton = $("#refreshBtn").data("kendoButton");
	    refreshButton.enable(false);

	    
	    
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

	    function buildToolbar() {
	        $("#upToolbar").kendoToolBar({
	            resizable: false,
	            items: [
                    {
                        type: "buttonGroup",
                        buttons: [
                            {
                                icon: "excel", text: "Tables", id: "uploadBtn", click: function (e) {
                                    window.location.href = AppSvc.urlPath + "tables";
                                }
                            },
                            {
                                icon: "gears", text: "Processes", id: "processesBtn", click: function (e) {
                                    window.location.href = AppSvc.urlPath + "processes";
                                }
                            },

                        ]
                    }
	            ]
	        });
	    };

	    $(document).ready(function () {
	        buildToolbar();

	    });

	    

	    $scope.username = $rootScope.globals.currentUser.username;

	        $scope.processData = new kendo.data.DataSource({
	            transport: {
	                read: {
	                    url: "services/UPLOADERAPI/api/upload/GetProcessesByUser?username=" + $scope.username,
	                    beforeSend: function (request) {
	                        request.setRequestHeader('Authorization', $http.defaults.headers.common.Authorization);
	                    }
	                }
	            },
	        });

	        var windowHeight = $window.innerHeight;

	        var gridHeight = (windowHeight * .70);
	        $("#processGrid").kendoGrid({
	            dataSource: $scope.processData,
	            // pageSize: 100,
	            databound: $("#processGrid").show(),
	            columns: [
                  { field: "id", title: "Parent ID", editable: false, hidden: true },
                  { field: "jobName", title: "Name", editable: false },
                  { field: "description", title: "Description", editable: false },
                  { field: "isRunning", title: "Status", editable: false},
                  { field: "tableName", title: "Type", editable: false, hidden: true }

	            ],
	            filterable: false,
	            /*scrollable: {
	                virtual: true
	            },*/
	            height: gridHeight,
	            resizable: true,
	            selectable: true,
                change: onChange,
	            sortable: true
	        }).data("kendoGrid");

	        function onChange(e) {
	            var processButton = $("#runProcessBtn").data("kendoButton");
	            processButton.enable(false);
	            var rows = e.sender.select();
	            rows.each(function (e) {
	                var grid = $("#processGrid").data("kendoGrid");
	                var dataItem = grid.dataItem(this);
	                $scope.selectedProcess = dataItem.id;
	                var refreshButton = $("#refreshBtn").data("kendoButton");
	                refreshButton.enable(true);
	                $scope.GetProcess();

	            })
	        };

	        $scope.GetProcess = function () {

	            var processButton = $("#runProcessBtn").data("kendoButton");
	            processButton.enable(true);
	            //check to make sure job isRunning status is 2 before enabling
	            $http.get('services/UPLOADERAPI/api/upload/GetProcessById?username=' + $rootScope.globals.currentUser.username + '&id=' + $scope.selectedProcess)
                    .success(function (d) {
                        if (d.isRunning == "2" || d.isRunning == "" || d.isRunning == null) {
                            var processButton = $("#runProcessBtn").data("kendoButton");
                            processButton.enable(true);
                        }
                        if (d.isRunning == "0" || d.isRunning == "1") {
                            var processButton = $("#runProcessBtn").data("kendoButton");
                            processButton.enable(false);
                        }
                    });

	        };
	        $scope.refresh = function () {

	            //get the status
	            $http.get('services/UPLOADERAPI/api/upload/GetProcessById?username=' + $rootScope.globals.currentUser.username + '&id=' + $scope.selectedProcess)
                    .success(function (d) {
                        if (d.isRunning == "2" || d.isRunning == "" || d.isRunning == null) {
                            clearInterval(timerID);
                            var processButton = $("#runProcessBtn").data("kendoButton");
                            processButton.enable(true);
                            $('#processGrid').data('kendoGrid').dataSource.read();
                            $('#processGrid').data('kendoGrid').refresh();
                            
                        }
                    });

	        };

	        $scope.runProcess = function () {
	            
	            var processButton = $("#runProcessBtn").data("kendoButton");
	            processButton.enable(true);
	            $http.post('services/UPLOADERAPI/api/upload/RunProcess?username=' + $rootScope.globals.currentUser.username + '&id=' + $scope.selectedProcess)
                    .success(function (d) {

                            var processButton = $("#runProcessBtn").data("kendoButton");
                            processButton.enable(false);
                            $('#processGrid').data('kendoGrid').dataSource.read();
                            $('#processGrid').data('kendoGrid').refresh();
                        //wait for process to run and then enable button and update grid to reflect changes
                            var timerID = setInterval(function () {
                                $scope.refresh();
                            }, 120 * 1000);

                            
                    });

	        };


        }

})();