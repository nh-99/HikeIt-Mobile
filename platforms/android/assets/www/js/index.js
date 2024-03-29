if(window.localStorage.getItem("token") == null) {
    phonon.options({
        navigator: {
            defaultPage: 'home',
            animatePages: true,
            enableBrowserBackButton: true,
            templateRootDirectory: './tpl'
        },
        i18n: null // for this example, we do not use internationalization
    });
} else {
    phonon.options({
        navigator: {
            defaultPage: 'pagetwo',
            animatePages: true,
            enableBrowserBackButton: true,
            templateRootDirectory: './tpl'
        },
        i18n: null // for this example, we do not use internationalization
    });
}

var app = phonon.navigator();

app.on({page: 'home', preventClose: false, content: null}, function(activity) {
	activity.onCreate(function() {
		if(window.localStorage.getItem("token") != null) {
			document.getElementById("index-content").innerHTML = "<p>Welcome back!</p>";
			phonon.navigator().changePage('pagetwo');
		}
	});
});

app.on({page: 'registration', preventClose: true, content: 'registration.html'});

app.on({page: 'pagetwo', preventClose: true, content: 'pagetwo.html', readyDelay: 1}, function(activity) {
    var onAction = function(evt) {
		var target = evt.target;
		search();
    };
    
    document.getElementById('searchinput').onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      search();
      return false;
    }
  }

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
	document.getElementById("main-body").innerHTML += '<button class="floating-action padded-full icon active primary-green"><a href="#!uploadimage/' + trailid + '"><i class="material-icons">image</i></a>  </button>';
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
	document.getElementById("main-body").innerHTML += '<button class="floating-action padded-full icon active primary-green"><a href="#!uploadimage/' + trailid + '"><i class="material-icons">image</i></a>  </button>';
    });
});

app.on({page: 'uploadimage', preventClose: true, content: 'upload-image.html', readyDelay: 1}, function(activity) {
    var trailidUpload = null;

    activity.onCreate(function() {
    });

    activity.onClose(function(self) {
    });
    
    activity.onHashChanged(function(trailid) {
    });
});

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

function search() {
	var name = document.getElementById("searchinput").value;
	document.getElementById("trails").innerHTML = "";
	document.getElementById("search-content").innerHTML += '<div id="trail-prog" class="circle-progress active"><div class="spinner"></div></div>';
	var req = $.ajax({
		method: 'GET',
        beforeSend: function(xhr){xhr.setRequestHeader('Authorization',"Token " + window.localStorage.getItem("token"));},
		url: 'https://hikeit.me/search/' + name + '.json',
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
            document.getElementById("trails").innerHTML = '<li class="padded-list">There was an error with your request</li>';
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


function uploadFromGallery() {

    // Retrieve image file location from specified source
    navigator.camera.getPicture(uploadPhoto,
                                function(message) { alert('get picture failed'); },
                                { quality: 50, 
                                destinationType: navigator.camera.DestinationType.FILE_URI,
                                sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY }
                                );

}

function uploadPhoto(imageURI) {
    var id = window.location.hash.split("/")[1];
    if(id == null) { id = "1" }
    var options = new FileUploadOptions();
    options.fileKey="file";
    options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1)+'.png';
    options.mimeType="image/jpeg";
    options.headers = {'Authorization',"Token " + window.localStorage.getItem("token"))};

    var ft = new FileTransfer();
    ft.upload(imageURI, encodeURI("https://hikeit.me/trail/" + id + "/upload/"), win, fail, options);
}

function win(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
}

function fail(error) {
    alert("An error has occurred: Code = " + error.code);
    console.log("upload error source " + error.source);
    console.log("upload error target " + error.target);
}
