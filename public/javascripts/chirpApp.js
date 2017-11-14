//chirpApp.js

// angular.module - register chirpApp as an angular module
// ngRoute & ngResource loaded as dependencies to chirpApp

// ngRoute - module provides routing and deeplinking services and directives
// ngResource - module provides interaction support with RESTful services via the $resource service

// .run() - function run at initialization - in this case initialize authentication state

// $rootScope - this is the top level scope, scopes provide separation between the model and the view, 
// via a mechanism for watching the model for changes

// $http - core AngularJS service that facilitates communication with the remote HTTP

var app = angular.module('chirpApp', ['ngRoute', 'ngResource']).run(function($rootScope, $http) {
  $rootScope.authenticated = false;
	$rootScope.current_user = '';
	
	$rootScope.signout = function(){
    $http.get('/auth/signout');
    $rootScope.authenticated = false;
    $rootScope.current_user = '';
  };
});

// .config() - function run during the provider registrations and configuration phase
// in this case setting mapping url to view and controller

// ngRoute - $routeProvider.when()

app.config(function($routeProvider){
	$routeProvider
	  //the timeline display
	  .when('/', {
		templateUrl: 'main.html',
		controller: 'mainController'
	  })
	  //the login display
	  .when('/login', {
		templateUrl: 'login.html',
		controller: 'authController'
	  })
	  //the signup display
	  .when('/register', {
		templateUrl: 'register.html',
		controller: 'authController'
	  });
});

// .factory() - creates a service that can be invoked,  
// in this case a REST call to the back-end api to interact with the database
// see - routes/api.js

app.factory('postService', function($http, $resource){
  return $resource('/api/posts/:id');
});

// .controller() - mainController pointed to by the $routeProvider - "/"
// note - $scope points to the view elements on the current page

app.controller('mainController', function($rootScope, $scope, postService) {
  
  // this is the "constructor" of the controller
	// postService.query() invokes the "GET" method in api.js and returns an array of chirps
  $scope.posts = postService.query();
	$scope.newPost = {created_by: '', text: '', created_at: ''};
	
  // this is the myPost "method" of the mainController that is called by ng-submit="myPost()" in main.html
  // postService.save($scope.newPost, ... invokes the "POST" method in api.js returns updated chirp list
  // and initializes for new chirp
  $scope.myPost = function() {
	  $scope.newPost.created_by = $rootScope.current_user;
	  $scope.newPost.created_at = Date.now();
	  postService.save($scope.newPost, function(){
	    $scope.posts = postService.query();
	    $scope.newPost = {created_by: '', text: '', created_at: ''};
	  });
	};
});

// .controller() - authController pointed to by the $routeProvider - "/login" and "/register"
// note - $scope points to the view elements on the current page
app.controller('authController', function($scope, $rootScope, $http, $location) {
  $scope.user = {username: '', password: ''};
  $scope.error_message = '';

  // this is the login "method" of the authController that is called by ng-submit="login()" in login.html
  // the method invokes the "POST" method in authenticate.js via passport
  // on success the user is rerouted to home page
  $scope.login = function(){
    $http.post('/auth/login', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };

  // this is the register "method" of the authController that is called by ng-submit="register()" in register.html
  // the method invokes the "POST" method in authenticate.js via passport
  // on success the user is rerouted to home page
  $scope.register = function(){
    $http.post('/auth/signup', $scope.user).success(function(data){
      if(data.state == 'success'){
        $rootScope.authenticated = true;
        $rootScope.current_user = data.user.username;
        $location.path('/');
      }
      else{
        $scope.error_message = data.message;
      }
    });
  };
});