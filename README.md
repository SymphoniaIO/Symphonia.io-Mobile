# Symphonia.io-Mobile
Mobile application for [Symphonia.io](http://symphonia.io)

## Table of contents
* [Description](#description)
* [Prerequisites](#prerequisites)
* [Installation](#installation)

### Description
This application was created as a practical part of the bachelor thesis of [Maros Seleng](https://github.com/maroselo) at Faculty of Informatics, Masaryk university, Brno, Czech Republic.

The application was made using the hybrid framework (ionic), targeting Android and iOS platforms.

Original assignment can be found [here](https://diplomky.redhat.com/topic/show/348/mobile-application-for-symphoniaio).

### Prerequisites
It is **recommended** to install in this order!

* [Node.js 4](http://nodejs.org)
* cordova and ionic CLI tools
  * `npm install -g ionic cordova`
* bower package manager
  * `npm install -g bower`
* gulp
  * `npm install -g gulp`
* ios-sim (only if you are on Mac):
  * `npm install -g ios-sim`

### Installation
1. `git clone` this repository.
2. `cd` into the root folder.
3. `bower install` to install libraries (from the `/bower.json` file).
4. `ionic state restore` to install plugins and platforms (from the `/package.json` file). 
  Note that if you are not on the Mac OS, **remove** `"iOS"` from `"cordovaPlatforms"`!
5. `ionic build` which builds app for both of platforms
6. `ionic run android` || `ionic emulate android` || `ionic emulate ios`.
7. Enjoy!
