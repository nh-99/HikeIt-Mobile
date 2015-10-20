phonon.options({
    navigator: {
        defaultPage: 'home',
        animatePages: true,
        enableBrowserBackButton: true,
        templateRootDirectory: './tpl'
    },
    i18n: null // for this example, we do not use internationalization
});


var app = phonon.navigator();

/**
 * The activity scope is not mandatory.
 * For the home page, we do not need to perform actions during
 * page events such as onCreate, onReady, etc
*/
app.on({page: 'home', preventClose: false, content: null}, function(activity) {
	activity.onCreate(function() {
		console.log(window.localStorage.getItem("token"));
		if(window.localStorage.getItem("token") != null) {
			location.href = "#!pagetwo";
		}
	});
});

/**
 * However, on the second page, we want to define the activity scope.
 * [1] On the create callback, we add tap events on buttons. The OnCreate callback is called once.
 * [2] If the user does not tap on buttons, we cancel the page transition. preventClose => true
 * [3] The OnReady callback is called every time the user comes on this page,
 * here we did not implement it, but if you do, you can use readyDelay to add a small delay
 * between the OnCreate and the OnReady callbacks
*/
app.on({page: 'pagetwo', preventClose: true, content: 'pagetwo.html', readyDelay: 1}, function(activity) {
	

    var onAction = function(evt) {
		var target = evt.target;
		console.log(target);
    };

    activity.onCreate(function() {
		var lat = 0;
		var lon = 0;
		var onSuccess = function(position) {
			lat = position.coords.latitude;
			lon = position.coords.longitude;
		};

		// onError Callback receives a PositionError object
		//
		function onError(error) {
			console.log(error.message);
		}

		navigator.geolocation.getCurrentPosition(onSuccess, onError);
        var req = phonon.ajax({
            method: 'GET',
            url: 'https://hikeit.me/search/latlon/' + lat + '/' + lon + '.json',
            crossDomain: true,
            dataType: 'json',
            success: function(res) {
				console.log(res.length);
				if(res.length == 0) {
					console.log("nothing. " + 'https://hikeit.me/search/latlon/' + lat + '/' + lon + '.json');
				} else {
					res.forEach(function(obj) { document.getElementById("trails").innerHTML += '<li class="padded-list"><a href="#!trailpage/' + obj.pk + '">' + obj.name + '<a></li>'; });
				}
            },
            error: function(err) {
				console.log(err);
			}
        });
    });

    activity.onClose(function(self) {
		self.close();
    });
});

app.on({page: 'trailpage', preventClose: true, content: 'trailpage.html', readyDelay: 1}, function(activity) {

    var onAction = function(evt) {
    };

    activity.onCreate(function() {
		trailid = window.location.hash.split("/")[1];
		if(trailid == null) { trailid = "1" }
		var req = phonon.ajax({
            method: 'GET',
            headers: {'Authorization': "Token " + window.localStorage.getItem("token")},
            url: 'https://hikeit.me/trail/' + trailid + '.json',
            crossDomain: true,
            dataType: 'json',
            success: function(res) {
                document.getElementById("trailinfo").innerHTML = '<li class="padded-list"><b>Name: </b>' + res.name + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Difficulty: </b>' + res.difficulty + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Distance: </b>' + res.distance + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Location: </b>' + res.location + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Description: </b>' + res.description + '</li>';
            }
        });
    });

    activity.onClose(function(self) {
		location.href = "#!pagetwo";
    });
    
    activity.onHashChanged(function(trailid) {
		if(trailid == null) { trailid = "1" }
		var req = phonon.ajax({
            method: 'GET',
            headers: {'Authorization': "Token " + window.localStorage.getItem("token")},
            url: 'https://hikeit.me/trail/' + trailid + '.json',
            crossDomain: true,
            dataType: 'json',
            success: function(res) {
                document.getElementById("trailinfo").innerHTML = '<li class="padded-list"><b>Name: </b>' + res.name + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Difficulty: </b>' + res.difficulty + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Distance: </b>' + res.distance + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Location: </b>' + res.location + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Description: </b>' + res.description + '</li>';
            }
        });
    });
});

// Let's go!
app.start();

function login() {
    // Get data ex: var value = window.localStorage.getItem("key");
    window.localStorage.setItem("token", document.getElementById("token").value);
    location.href = "#!pagetwo"
}

function closest(elem, selector) {

   var matchesSelector = elem.matches || elem.webkitMatchesSelector || elem.mozMatchesSelector || elem.msMatchesSelector;

    while (elem) {
        if (matchesSelector.bind(elem)(selector)) {
            return elem;
        } else {
            elem = elem.parentElement;
        }
    }
    return false;
}
