angular.module('farmConnect.products', [])

.controller('ProductsCtrl', function($scope, Products) {

  $scope.items = [
    'Apples',
    'Bananas',
    'Cucumbers',
    'So many'
  ];

  $scope.search = '';

  Products.getProducts()
    .then(function(products) {
      $scope.items.push(products);
    });


  $scope.done = function(todo) {
    var indexOf = $scope.todos.indexOf(todo);
    if (indexOf !== -1) {
      $scope.todos.splice(indexOf, 1);
    }
    fx
  };

  $scope.add = function(e) {
    if (e.which && e.which === 13) {
      $scope.todos.push($scope.newTodo);
      $scope.newTodo = '';
    }
  };

  $scope.taskAdd1 = function() {
    $scope.todos.push($scope.taskInput1);
    $scope.taskInput1 = '';
  };
});
