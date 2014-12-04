// app.js

var IngGap = angular.module('IngGap', ['ngRoute', 'ngCookies', "ngTouch", "mobile-angular-ui"]).run(function($rootScope, $cookieStore) {

	$rootScope.serverURL = serverURL;

	if ($cookieStore.get('userID')) {
		$rootScope.userLogged = true;
		$rootScope.userId = $cookieStore.get('userID');
		$rootScope.userName = $cookieStore.get('userName');
	} else {
		$rootScope.userLogged = false;
		$rootScope.userId = false;
		$rootScope.userName = false;
	}
	$rootScope.logout = function() {
		$cookieStore.remove('userID');
		$rootScope.userLogged = false;
		$rootScope.userId = false;
		$rootScope.userName = false;
	};
	$rootScope.websqlreset = function() {
		alert('Helyi adatbázis resetelés');		
		dao.dropTable(function() {
			dao.createTable();
			dao.createTableForSaveIng();
		});
	};

});
// ROUTING ===============================================
// set our routing for this application
// each route will pull in a different controller
IngGap.config(function($routeProvider) {

	$routeProvider

	// home page
	.when('/', {
		templateUrl : 'pages/home.html',
		controller : 'mainController'
	}).when('/myads', {
		templateUrl : 'pages/myads.html',
		controller : 'myadsController'
	}).when('/newAd', {
		templateUrl : 'pages/newAd.html',
		controller : 'newAdController'
	}).when('/signup', {
		templateUrl : 'pages/signup.html',
		controller : 'signupController'
	}).when('/login', {
		templateUrl : 'pages/login.html',
		controller : 'loginController'
	}).when('/filter', {
		templateUrl : 'pages/filter.html',
		controller : 'filterController'
	}).when('/ingatlan/:ingatlanID', {
		templateUrl : 'pages/ingatlan.html',
		controller : 'ingatlanController'
	});

});

// CONTROLLERS ============================================
// home page controller
IngGap.controller('mainController', function($scope, $http, $rootScope) {

	$scope.ingatlanok = [];
	renderList();
	$scope.mettol = 0;

	$scope.moreIngatlan = function() {
		$http.post(serverURL + 'onlab1server/moreIngatlan.php?mettol=' + $scope.mettol).success(function(data) {
			console.log(data);

			console.log($scope.mettol);
			var items = data;

			log('Ajaxszal letöltöttünk + ' + items.length + ' új ingatlant	');

			for ( i = 0; i < items.length; i++) {
				var ing = items[i];
				$scope.ingatlanok.push(items[i]);
				$scope.mettol++;
				$scope.$apply();
				$("#kep" + ing.id).one("load", function() {
					myScroll.refresh();
				}).attr("src", serverURL + 'onlab1server/kepfeltoltes.php?image=' + ing.kep);
			}

		});

	};

	function renderList(ingatlanok) {

		dao.findAll(function(ingatlanok) {
			$scope.mettol = 0;
			var l = ingatlanok.length;
			for (var i = 0; i < l; i++) {
				var ingatlan = ingatlanok[i];
				$scope.ingatlanok[i] = ingatlan;
				$scope.mettol++;
				$scope.$apply();

				$("#kep" + ingatlan.id).one("load", function() {

					myScroll.refresh();
				}).attr("src", 'cdvfile://localhost/persistent/IngGap/' + ingatlan.kep);

			}

		});

	}

	function szinkronlistazas(ingatlanok) {

		dao.findAll(function(ingatlanok) {

			var l = ingatlanok.length;
			for (var i = 0; i < l; i++) {
				var ingatlan = ingatlanok[i];
				$scope.ingatlanok[i] = ingatlan;

				$scope.$apply();

				$("#kep" + ingatlan.id).one("load", function() {

					myScroll.refresh();
				}).attr("src", serverURL + 'onlab1server/kepfeltoltes.php?image=' + ingatlan.kep);
			}

		});

	}


	$scope.intToType = function(id) {
		if (id == 1) {
			return 'Családiház';
		} else if (id == 2) {
			return 'Garázs';
		} else if (id == 3) {
			return 'Ikerház';
		} else if (id == 4) {
			return 'Ipari ingatlan';
		} else if (id == 5) {
			return 'Iroda';
		} else if (id == 6) {
			return 'Lakás';
		} else if (id == 7) {
			return 'Sorház';
		} else if (id == 8) {
			return 'Telek';
		} else if (id == 9) {
			return 'Üdülő';
		} else if (id == 10) {
			return 'Üzlethelység';
		}
	};

	$scope.szinkronizal = function() {
		dao.sync(szinkronlistazas);

	};

});

// signup page controller
IngGap.controller('signupController', function($scope, $http) {
	$scope.pageClass = 'page-signup';
	$scope.formData = {};
	$scope.regAjax = function() {
		$http.post(serverURL + 'onlab1server/signup.php?' + jQuery("#form-signup").serialize()).success(function(data) {
			console.log(data);

			if (!data.success) {
				// if not successful, bind errors to error variables
				$scope.errorFirstname = data.errors.firstname;
				$scope.errorLastname = data.errors.lastname;
				$scope.errorEmail = data.errors.email;
				$scope.errorPhone = data.errors.phone;
				$scope.errorPassword = data.errors.password;

			} else {
				// if successful, bind success message to message
				$scope.message = data.message;
			}
		});

	};
});

IngGap.controller('ingatlanController', function($scope, $http, $routeParams) {

	var id = $routeParams.ingatlanID;
	$scope.ingatlanID = $routeParams.ingatlanID;
	$scope.ingatlan
	ingatlanLekeres();

	function ingatlanLekeres(ingatlan) {
		$http.post(serverURL + 'onlab1server/ingatlanById.php?id=' + $scope.ingatlanID).success(function(data) {
			console.log(data);

			$scope.ingatlan = data[0];
		});
	}


	$scope.intToType = function(id) {
		if (id == 1) {
			return 'Családiház';
		} else if (id == 2) {
			return 'Garázs';
		} else if (id == 3) {
			return 'Ikerház';
		} else if (id == 4) {
			return 'Ipari ingatlan';
		} else if (id == 5) {
			return 'Iroda';
		} else if (id == 6) {
			return 'Lakás';
		} else if (id == 7) {
			return 'Sorház';
		} else if (id == 8) {
			return 'Telek';
		} else if (id == 9) {
			return 'Üdülő';
		} else if (id == 10) {
			return 'Üzlethelység';
		}
	};
	$scope.intToKomfort = function(id) {
		if (id == 1) {
			return 'Összkomfortos';
		} else if (id == 2) {
			return 'Komfortos';
		} else if (id == 3) {
			return 'Félkomfortos';
		} else if (id == 4) {
			return 'Komfort nélküli';
		} else if (id == 5) {
			return 'Szükséglakás';
		} else if (id == 6) {
			return 'Közművesített';
		} else if (id == 7) {
			return 'Közművek nélküli';
		}
	};

	$scope.vane = function(x) {
		if (x == 1)
			return 'Van';
		else
			return 'Nincs';
	};

});

// signup page controller
IngGap.controller('signupController', function($scope, $http) {
	$scope.pageClass = 'page-signup';
	$scope.formData = {};
	$scope.regAjax = function() {
		$http.post(serverURL + 'onlab1server/signup.php?' + jQuery("#form-signup").serialize()).success(function(data) {
			console.log(data);

			if (!data.success) {
				// if not successful, bind errors to error variables
				$scope.errorFirstname = data.errors.firstname;
				$scope.errorLastname = data.errors.lastname;
				$scope.errorEmail = data.errors.email;
				$scope.errorPhone = data.errors.phone;
				$scope.errorPassword = data.errors.password;

			} else {
				// if successful, bind success message to message
				$scope.message = data.message;
			}
		});

	};
});

IngGap.controller('loginController', function($scope, $http, $rootScope, $cookieStore, $routeParams, $location) {
	$scope.pageClass = 'page-login';

	$scope.formData = {};
	$scope.logAjax = function() {
		$http.post(serverURL + 'onlab1server/login.php?' + jQuery("#form-login").serialize()).success(function(data) {
			console.log(data);

			if (!data.success) {
				// if not successful, bind errors to error variables
				$scope.errorLogin = data.errors.login;

			} else {
				// if successful, bind success message to message

				$cookieStore.put('userID', data.id);
				$cookieStore.put('userName', data.firstname + ' ' + data.lastname);
				$rootScope.userLogged = true;
				$rootScope.userId = $cookieStore.get('userID');
				$rootScope.userName = $cookieStore.get('userName');
				$location.path('/');

			}
		});

	};
});

IngGap.controller('myadsController', function($scope, $http, $rootScope, $cookieStore, $routeParams, $location) {

	$scope.ingatlanok = [];
	renderList();

	function feloltesCB(ingatlan) {
		var str = "";
		var random = Math.floor(Math.random() * 1000);

		ingatlan[0].telepules = ingatlan[0].fekves;

		var imgpath = ingatlan[0].kep;

		ingatlan[0].kep1 = random + 1 + '' + ingatlan[0].alapterulet + '' + ingatlan[0].telekterulet + '' + ingatlan[0].ar + '.jpg';
		imgneve = ingatlan[0].kep1;

		var obj = ingatlan[0];
		for (var key in obj) {
			if (str != "") {
				str += "&";
			}
			str += key + "=" + obj[key];
		}

		$http({
			method : "post",
			url : serverURL + 'onlab1server/newad.php?' + str + '&userid=' + $cookieStore.get('userID'),
		}).success(function(data) {
			console.log(data);

			if (!data.success) {
				// if not successful, bind errors to error variables
				alert('Valami adat hiányzik');

			} else {
				// if successful, bind success message to message

				if (uploadPicture2(random, imgpath, imgneve) == 'ok') {
					dao.updateMyIng(ingatlan[0].id);
					$location.path('/myads');
				}

			};

		});

	}


	$scope.feltolt = function(id) {
		dao.getMyIngById(id, feloltesCB);
	};

	function renderList(ingatlanok) {

		dao.hirdeteseim(function(ingatlanok) {

			var l = ingatlanok.length;
			for (var i = 0; i < l; i++) {
				var ingatlan = ingatlanok[i];
				$scope.ingatlanok[i] = ingatlan;
				$scope.$apply();

				$("#kep" + ingatlan.id).one("load", function() {
					myScroll.refresh();
				}).attr("src", 'cdvfile://localhost/persistent/IngGap/' + ingatlan.kep);

			}

		});
	}


	$scope.intToType = function(id) {
		if (id == 1) {
			return 'Családiház';
		} else if (id == 2) {
			return 'Garázs';
		} else if (id == 3) {
			return 'Ikerház';
		} else if (id == 4) {
			return 'Ipari ingatlan';
		} else if (id == 5) {
			return 'Iroda';
		} else if (id == 6) {
			return 'Lakás';
		} else if (id == 7) {
			return 'Sorház';
		} else if (id == 8) {
			return 'Telek';
		} else if (id == 9) {
			return 'Üdülő';
		} else if (id == 10) {
			return 'Üzlethelység';
		}
	};
});
IngGap.controller('filterController', function($scope, $http, $rootScope, $cookieStore, $routeParams, $location) {

	$scope.ingatlanok = [];
	$scope.formData = {};

	$scope.szures = function() {
		$scope.ingatlanok = [];
		$http.post(serverURL + 'onlab1server/filter.php?' + jQuery("#form-filter").serialize()).success(function(data) {
			var items = data;
			for ( i = 0; i < items.length; i++) {
				var ing = items[i];
				$scope.ingatlanok.push(items[i]);
				$scope.mettol++;
				$scope.$apply();
				$("#kep" + ing.id).one("load", function() {
					myScroll.refresh();
				}).attr("src", serverURL + 'onlab1server/kepfeltoltes.php?image=' + ing.kep);
			};

		});
	};

	$scope.intToType = function(id) {
		if (id == 1) {
			return 'Családiház';
		} else if (id == 2) {
			return 'Garázs';
		} else if (id == 3) {
			return 'Ikerház';
		} else if (id == 4) {
			return 'Ipari ingatlan';
		} else if (id == 5) {
			return 'Iroda';
		} else if (id == 6) {
			return 'Lakás';
		} else if (id == 7) {
			return 'Sorház';
		} else if (id == 8) {
			return 'Telek';
		} else if (id == 9) {
			return 'Üdülő';
		} else if (id == 10) {
			return 'Üzlethelység';
		}
	};
});

IngGap.controller('newAdController', function($scope, $http, $routeParams, $location, $cookieStore) {
	$scope.pageClass = 'page-newAd';
	$scope.formData = {};

	// A button will call this function
	//
	$scope.capturePhoto = function() {

		// Take picture using device camera and retrieve image as base64-encoded string
		navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
			quality : 40,
			destinationType : Camera.DestinationType.FILE_URI,
			sourceType : Camera.PictureSourceType.CAMERA
		});
	};

	// A button will call this function
	$scope.getPhoto = function() {

		source = pictureSource.SAVEDPHOTOALBUM;
		// Retrieve image file location from specified source
		navigator.camera.getPicture(onPhotoURISuccess, onFail, {
			quality : 50,
			destinationType : destinationType.FILE_URI,
			sourceType : source
		});
	};

	$scope.ingSave = function() {
		hiba = false;
		var imgNeve = '';
		var random = Math.floor(Math.random() * 1000);
		var img = document.getElementById('ingatlanKep');
		if (img.style.display == 'block') {
			imgNeve = 'myIng' + random + '.jpg';
			saveImg('myIng' + random + '.jpg');
		} else {
			$scope.errorkep = 'A kép megadása kötelező';
			//hiba = true;
		};

		var ingatlan = {
			idTulaj : 0,
			kep : imgNeve,
			viz : 0,
			gaz : 0,
			villany : 0,
			kozpontifutes : 0,
			pince : 0,
			csatorna : 0,
			garazs : 0,
			kabeltv : 0,
			cim : 0,
			ar : 0,
			aktiv : 0

		};

		$.each($('#form-newad').serializeArray(), function(_, kv) {
			ingatlan[kv.name] = kv.value;
		});

		//select integers only
		var intRegex = /[0-9 -()+]+$/;

		if (ingatlan['megnevezes'] == '') {
			$scope.errormegnevezes = 'Megnevezés megadása kötelező.';
			hiba = true;
		} else {
			$scope.errormegnevezes = '';
		}

		if (ingatlan['cim'] == '') {
			$scope.errorcim = 'Cím megadása kötelező.';
			hiba = true;
		} else {
			$scope.errorcim = '';

		}

		if (ingatlan['telepules'] == '') {
			$scope.errortelepules = 'Település megadása kötelező.';
			hiba = true;
		} else {
			$scope.errortelepules = '';

		}

		if (ingatlan['megnevezes'] == '') {
			$scope.errormegnevezes = 'Megnevezés megadása kötelező.';
			hiba = true;
		} else {
			$scope.errormegnevezes = '';
		}
		if (ingatlan['alapterulet'] == '') {
			$scope.erroralapterulet = 'Alapterület megadása kötelező.';
			hiba = true;
		} else {
			if (ingatlan['alapterulet'].match(intRegex)) {
				$scope.erroralapterulet = '';
			} else {
				$scope.erroralapterulet = 'Az alapterület legyen szám';
				hiba = true;
			}

		}

		if (ingatlan['telekterulet'] == '') {
			$scope.errortelekterulet = 'Telekterület megadása kötelező.';
			hiba = true;
		} else {
			if (ingatlan['telekterulet'].match(intRegex)) {
				$scope.errortelekterulet = '';

			} else {
				$scope.errortelekterulet = 'A telekterület legyen szám';
				hiba = true;
			}

		}
		if (ingatlan['komfortfok'] == '') {
			$scope.errorkomfortfok = 'Komfortfok megadása kötelező.';
			hiba = true;
		} else {
			$scope.errorkomfortfok = '';

		}
		if (ingatlan['tipus'] == '') {
			$scope.errortipus = 'Típus megadása kötelező.';
			hiba = true;
		} else {
			$scope.errortipus = '';

		}
		if (ingatlan['ar'] == '') {
			$scope.errorar = 'Az ár megadása kötelező.';
			hiba = true;
		} else {
			if (ingatlan['ar'].match(intRegex)) {
				$scope.errorar = '';
			} else {
				$scope.errorar = 'Az ár legyen szám';
			}

		}

		if (!hiba) {

			dao.insertIntoMyIngs(ingatlan, function() {
				$location.path('/myads');
			});
		}
	};

	$scope.newadAjax = function() {
		var img = document.getElementById('ingatlanKep');
		var imgNeve = '';
		var random = Math.floor(Math.random() * 1000);

		if (img.style.display == 'block') {
			var imgNeve = random + 1 + $('#alapterulet').val() + $('#telekterulet').val() + $('#ar').val() + '.jpg';
		};

		$http({
			method : "post",
			url : serverURL + 'onlab1server/newad.php?' + jQuery("#form-newad").serialize() + '&userid=' + $cookieStore.get('userID') + '&kep1=' + imgNeve,
		}).success(function(data) {
			console.log(data);

			if (!data.success) {
				// if not successful, bind errors to error variables
				$scope.message = data.message;
				$scope.errormegnevezes = data.errors.megnevezes;
				$scope.errortelepules = data.errors.telepules;
				$scope.errortipus = data.errors.tipus;
				$scope.errorkomfortfok = data.errors.komfortfok;
				$scope.erroralapterulet = data.errors.alapterulet;
				$scope.errortelekterulet = data.errors.telekterulet;
				$scope.errorar = data.errors.ar;
				$scope.errorcim = data.errors.cim;
				$scope.errorkep = data.errors.kep;

			} else {
				// if successful, bind success message to message
				$scope.message = data.message;
				if (uploadPicture(random) == 'ok') {
					alert('A hirdetés sikeresen feltöltve');
				}

			};

		});

	};
});

