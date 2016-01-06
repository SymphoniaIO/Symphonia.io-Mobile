/*
 * Copyright 2016 Maroš Šeleng
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

angular.module('symphonia', ['ionic', 'symphonia.controllers', 'symphonia.services'])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);

      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('main', {
        cache: false,
        url: '/main',
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl'
      })
      .state('options', {
        cache: false,
        url: '/options',
        templateUrl: 'templates/options.html',
        controller: 'OptionsCtrl'
      })
      .state('about', {
        cache: false,
        url:'/about',
        templateUrl: 'templates/about.html',
        controller: 'AboutCtrl'
      })
      .state('success', {
        cache: false,
        url:'/success',
        templateUrl: 'templates/success.html',
        controller: 'SuccessCtrl'
      })
      .state('failure', {
        cache: false,
        url: '/failure',
        templateUrl: 'templates/failure.html',
        controller: 'FailureCtrl'
      })
    ;

    $urlRouterProvider.otherwise('/main');
  });
