/*
 * angular-markdown-directive v0.4.0
 * (c) 2013-2014 Brian Ford http://briantford.com
 * License: MIT
 */

'use strict';

angular.module('btford.markdown', ['ngSanitize'])
	.provider('markdownConverter', function () {
		var opts = {};
		return {
			config: function (newOpts) {
				opts = newOpts;
			},
			$get: function () {
				return new showdown.Converter(opts);
			}
		};
	})
	.directive('btfMarkdown', ['$sanitize', "$compile", 'markdownConverter', function ($sanitize, $compile, markdownConverter) {
		var func = function ($scope, newVal, oldValue) {
			if (newVal === oldValue)
				return false;
			var html = "";
			if (newVal) {
				var rawHtml = markdownConverter.makeHtml(newVal);
				if ($scope.onPreSanitize)
					rawHtml = $scope.onPreSanitize()(rawHtml);
				html = $sanitize(rawHtml)
				if ($scope.onPostSanitize)
					html = $scope.onPostSanitize()(html);
			}
			$scope.processedHtml = html;
			return true;
		};

		return {
			restrict: 'AE',
			scope: {
				onPreSanitize: "&?",
				onPostSanitize: "&?",
				ngMarkdown: "=?",
				btfMarkdown: "=?"
			},
			link: function (scope, element, attrs) {
				scope.$watch("processedHtml", function (newVal, oldValue) {
					if (newVal === oldValue)
						return;
					var e = $compile(scope.processedHtml)(scope);
					element.empty();
					element.append(e);
				});

				var e = $compile(scope.processedHtml)(scope);
				element.empty();
				element.append(e);
			},
			controller: ["$scope", function ($scope) {
				if ($scope.ngMarkdown)
					func($scope, $scope.ngMarkdown);
				else if ($scope.btfMarkdown)
					func($scope, $scope.btfMarkdown);

				$scope.$watch("ngMarkdown", function (newVal, oldValue) {
					func($scope, newVal, oldValue);
				});

				$scope.$watch("btfMarkdown", function (newVal, oldValue) {
					func($scope, newVal, oldValue);
				});
			}]
		};
	}]);