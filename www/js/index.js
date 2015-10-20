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
app.on({page: 'home', preventClose: false, content: null});

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
    };

    activity.onCreate(function() {
        var req = phonon.ajax({
            method: 'GET',
            url: 'https://hikeit.me/search/location/Camden.json',
            crossDomain: true,
            dataType: 'json',
            success: function(res) {
                res.forEach(function(obj) { document.getElementById("trails").innerHTML += '<li class="padded-list">' + obj.name + '</li>'; });
            }
        });
    });

    activity.onClose(function(self) {
    });
});

// Let's go!
app.start();

function login() {
    // Get data ex: var value = window.localStorage.getItem("key");
    window.localStorage.setItem("token", document.getElementById("token").value);
    location.href = "#!pagetwo"
}
