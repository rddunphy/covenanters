var firebaseConfig = {
	apiKey: "AIzaSyCI1aiMpQQaYKrzO4O6JEAYRRkbfkDXW6M",
	authDomain: "covenanters-map.firebaseapp.com",
	projectId: "covenanters-map",
	storageBucket: "covenanters-map.appspot.com",
	messagingSenderId: "105187403918",
	appId: "1:105187403918:web:4564468ce038ff072301df",
	measurementId: "G-MJ0RKJF47X"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();
var userName = "";

function signOut() {
	firebase.auth().signOut().then(() => {
		console.log("Sign-out successful.");
	}).catch((error) => {
		console.error("Error while signing out: " + error);
	});
}

function updateSigninStatus(user, signedOutMsg, signedOutRedirect) {
	let div = document.getElementById("signin-status");
	if (user) {
		userName = user.displayName;
		if (!userName) {
			userName = user.email;
		}
		div.innerHTML = "Signed in as " + userName + ". <a href=\"#\" onclick=\"signOut();\">Sign out</a>";
	} else {
		if (signedOutMsg) {
			div.innerHTML = "Signed out";
		} else {
			div.innerHTML = "";
		}
		if (signedOutRedirect) {
			window.location.href = "login.html";
		}
	}
}

function initSigninStatus(signedOutMsg, signedOutRedirect) {
	firebase.auth().onAuthStateChanged((user) => {updateSigninStatus(user, signedOutMsg, signedOutRedirect);});
}
	
function signInUI() {
	var ui = new firebaseui.auth.AuthUI(firebase.auth());
	var uiConfig = {
		callbacks: {
			signInSuccessWithAuthResult: function(authResult, redirectUrl) {
				// User successfully signed in.
				// Return type determines whether we continue the redirect automatically
				// or whether we leave that to developer to handle.
				return true;
			},
			uiShown: function() {
				// The widget is rendered.
				// Hide the loader.
				document.getElementById("loader").style.display = "none";
			}
		},
		credentialHelper: firebaseui.auth.CredentialHelper.NONE,
		// Will use popup for IDP Providers sign-in flow instead of the default, redirect.
		signInFlow: "popup",
		signInSuccessUrl: "data_overview.html",
		signInOptions: [
			firebase.auth.EmailAuthProvider.PROVIDER_ID
		],
		// Terms of service url.
		// tosUrl: "<your-tos-url>",
		// Privacy policy url.
		// privacyPolicyUrl: "<your-privacy-policy-url>"
	};
	// The start method will wait until the DOM is loaded.
	ui.start("#firebaseui-auth-container", uiConfig);
}
