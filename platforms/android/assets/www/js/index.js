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
		if(window.localStorage.getItem("token") != null) {
			document.getElementById("index-content").innerHTML = "<p>Welcome back!</p>";
			phonon.navigator().changePage('pagetwo');
		}
	});
});

app.on({page: 'registration', preventClose: true, content: 'registration.html'});

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
		search(document.getElementById("searchinput").value);
    };

    activity.onCreate(function() {
		document.querySelector('#search').on('tap', onAction);
		var lat = 0;
		var lon = 0;
		var onSuccess = function(position) {
			lat = position.coords.latitude;
			lon = position.coords.longitude;
			
			var req = $.ajax({
				method: 'GET',
				beforeSend: function(xhr){xhr.setRequestHeader('Authorization',"Token " + window.localStorage.getItem("token"));},
				url: 'https://hikeit.me/search/latlon/' + lat + '/' + lon + '.json',
				crossDomain: true,
				dataType: 'json',
				success: function(res) {
					if(res.length == 0) {
						document.getElementById("trail-prog").remove();
						document.getElementById("trails").innerHTML += '<li><p class="padded-list">No trails found in your area. Try searching at the top.</p></li>';
					} else {
						document.getElementById("trail-prog").remove();
						res.forEach(function(obj) { document.getElementById("trails").innerHTML += '<li class="padded-list"><a class="padded-list" href="#!trailpage/' + obj.pk + '">' + obj.name + '<a></li>'; });
					}
				},
				error: function(err) {
					console.log(err);
				}
			});
		};

		// onError Callback receives a PositionError object
		//
		function onError(error) {
			console.log(error.message);
		}

		navigator.geolocation.getCurrentPosition(onSuccess, onError);
    });

    activity.onClose(function(self) {
    });
});

app.on({page: 'trailpage', preventClose: true, content: 'trailpage.html', readyDelay: 1}, function(activity) {

    var onAction = function(evt) {
    };

    activity.onCreate(function() {
		trailid = window.location.hash.split("/")[1];
		if(trailid == null) { trailid = "1" }
		var req = $.ajax({
            method: 'GET',
            beforeSend: function(xhr){xhr.setRequestHeader('Authorization',"Token " + window.localStorage.getItem("token"));},
            url: 'https://hikeit.me/trail/' + trailid + '.json',
            crossDomain: true,
            dataType: 'json',
            success: function(res) {
                document.getElementById("trailinfo").innerHTML = '<li class="padded-list"><b>Name: </b>' + res.name + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Difficulty: </b>' + res.difficulty + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Distance: </b>' + res.distance + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Location: </b>' + res.location + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Description: </b>' + res.description + '</li>';
                document.getElementById("trailinfo").innerHTML += '<li class="padded-list"><b>Likes: </b>' + res.likes + '</li>';
            }
        });
    });

    activity.onClose(function(self) {
		location.href = "#!pagetwo";
    });
    
    activity.onHashChanged(function(trailid) {
		if(trailid == null) { trailid = "1" }
		var req = $.ajax({
            method: 'GET',
            beforeSend: function(xhr){xhr.setRequestHeader('Authorization',"Token " + window.localStorage.getItem("token"));},
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
    var user = document.getElementById("username").value;
    var pass = document.getElementById("password").value;
    
    var req = $.ajax({
		method: 'POST',
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization',"Basic " + window.btoa(user + ":" + pass));},
        data: {"username": user, "password": pass},
		url: 'https://hikeit.me/user/token/',
		crossDomain: true,
		dataType: 'json',
		success: function(res) {
			window.localStorage.setItem("token", res.token);
		}
	});
    location.href = "#!pagetwo"
}

function register() {
    // Get data ex: var value = window.localStorage.getItem("key");
    var user = document.getElementById("username-reg").value;
    var email = document.getElementById("email-reg").value;
    var pass = document.getElementById("password-reg").value;
    
    var req = $.ajax({
		method: 'POST',
        data: {"username": user, "email": email, "password": pass},
		url: 'https://hikeit.me/user/register.json',
		crossDomain: true,
		dataType: 'json',
		success: function(res) {
			phonon.notif('Please check your email for a confirmation link', 3000, false);
			location.href = "#!home";
		},
	});
}

function search(name) {
	document.getElementById("trails").innerHTML = "";
	document.getElementById("search-content").innerHTML += '<div id="trail-prog" class="circle-progress active"><div class="spinner"></div></div>';
	var req = $.ajax({
		method: 'GET',
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization',"Token " + window.localStorage.getItem("token"));},
		url: 'https://hikeit.me/search/name/' + name + '.json',
		crossDomain: true,
		dataType: 'json',
		success: function(res) {
			if(res.length == 0) {
				document.getElementById("trail-prog").remove();
				document.getElementById("trails").innerHTML = '<li class="padded-list">No trails found for ' + name + '. Try searching at the top.</li>';
			} else {
				document.getElementById("trail-prog").remove();
				res.forEach(function(obj) { document.getElementById("trails").innerHTML += '<li><a class="padded-list" href="#!trailpage/' + obj.pk + '">' + obj.name + '</a></li>'; });
			}
		},
		error: function(err) {
            document.getElementById("trail-prog").remove();
			console.log(err);
		}
	});
}

function likeTrail() {
	trailid = window.location.hash.split("/")[1];
	var req = $.ajax({
		method: 'GET',
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization',"Token " + window.localStorage.getItem("token"));},
		url: 'https://hikeit.me/trail/' + trailid + '/like.json',
		crossDomain: true,
		success: function(res) {
			if(res.text == "already liked" || res.text == "auth invalid") {
				phonon.notif('You cannot like this trail', 3000, false);
			} else {
				var req = $.ajax({
					method: 'GET',
					beforeSend: function(xhr){xhr.setRequestHeader('Authorization',"Token " + window.localStorage.getItem("token"));},
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
				phonon.notif('Trail liked successfully', 3000, false);
			}
		},
		error: function(err) {
			console.log(err);
		}
	});
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

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = this.length - 1; i >= 0; i--) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}
