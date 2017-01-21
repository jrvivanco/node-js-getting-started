var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 5000));

var bodyParser = require("body-parser");
app.use(bodyParser.json()); //soporte para codificar json
app.use(bodyParser.urlencoded({ extended: true })); //Soporte para decodificar las url

var firebase = require("firebase-admin");
firebase.initializeApp({
  serviceAccount: "Mascotita-6e7fcffdfb73.json",
  databaseURL: "https://mascotita-aa119.firebaseio.com"
});

var FCM = require('fcm-push');


app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/android', function(request, response) {
  response.render('pages/index');
});


//POST
//https://calm-headland-74792.herokuapp.com/token-device
//token
//animal
var tokenDevicesURI = "token-device";
app.post('/' + tokenDevicesURI, function(request, response) {
	var token 	= request.body.token;
	var animal 	= request.body.animal;
	var db = firebase.database();
	var tokenDevices = db.ref(tokenDevicesURI).push();
	tokenDevices.set({
		token: token,
		animal: animal
	});	

	var path = tokenDevices.toString(); //https://mascotita-aa119.firebaseio.com/token-device/-KJlTaOQPwP-ssImryV1
	var pathSplit = path.split(tokenDevicesURI + "/")
	var idAutoGenerado = pathSplit[1];

	var respuesta = generarRespuestaAToken(db, idAutoGenerado);
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(respuesta));
});

function generarRespuestaAToken(db, idAutoGenerado) {
	var respuesta = {};
	var usuario = "";
	var ref = db.ref("token-device");
	ref.on("child_added", function(snapshot, prevChildKey) {
		usuario = snapshot.val();
		respuesta = {
			id: idAutoGenerado,
			token: usuario.token,
			animal: usuario.animal
		};
	});
	return respuesta;
}

//GET
//https://calm-headland-74792.herokuapp.com/toque-animal
//id
//animal
app.get("/toque-animal/:id/:animal", function(request, response){
	var id 		= request.params.id;
	var animal 	= request.params.animal;

	var db = firebase.database();
	var ref = db.ref("token-device/" + id);
	var usuario = "";
	var respuesta = {};
	
	ref.on("value", function(snapshot) {
		console.log(snapshot.val());
		usuario = snapshot.val();
		var mensaje = animal + " te dio un toque";
		enviarNotificaion(usuario.token, mensaje);
		respuesta = {
			id: id,
			token: usuario.token,
			animal: usuario.animal
		};
		response.send(JSON.stringify(respuesta));
	}, function (errorObject) {
		console.log("The read failed: " + errorObject.code);
		respuesta = {
			id: "",
			token: "",
			animal: ""
		};
		response.send(JSON.stringify(respuesta));

	});
});

//POST
//https://calm-headland-74792.herokuapp.com/usuario_instagram
//token
//id_usuario_instagram
var usuarioDevicesURI = "usuario_instagram";
app.post('/' + usuarioDevicesURIDevicesURI, function(request, response) {
	var id_dispositivo 	= request.body.id_dispositivo;
	var id_usuario_instagram 	= request.body.id_usuario_instagram;
	var db = firebase.database();
	var usuarios = db.ref(usuarioDevicesURI).push();
	usuarios.set({
		id_dispositivo: id_dispositivo,
		id_usuario_instagram: id_usuario_instagram
	});	

	var path = usuarios.toString(); //https://mascotita-aa119.firebaseio.com/token-device/-KJlTaOQPwP-ssImryV1
	var pathSplit = path.split(usuarioDevicesURI + "/")
	var idAutoGenerado = pathSplit[1];

	var respuesta = generarRespuestaUsuario(db, idAutoGenerado);
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(respuesta));
});

function generarRespuestaUsuario(db, idAutoGenerado) {
	var respuesta = {};
	var usuario = "";
	var ref = db.ref("usuario_instagram");
	ref.on("child_added", function(snapshot, prevChildKey) {
		usuario = snapshot.val();
		respuesta = {
			id: idAutoGenerado,
			id_dispositivo: usuario.id_dispositivo,
			id_usuario_instagram: usuario.id_usuario_instagram
		};
	});
	return respuesta;
}

//GET
//https://calm-headland-74792.herokuapp.com/registrar-usuario/
//id
//id_usuario_instagram
app.get("/registrar-usuario/:id_dispositivo/:id_usuario_instagram", function(request, response){
	var id_dispositivo 		= request.params.id_dispositivo;
	var id_usuario_instagram 	= request.params.id_usuario_instagram;

	var db = firebase.database();
	var ref = db.ref("usuario_instagram/" + id);
	var usuario = "";
	var respuesta = {};
	
	ref.on("value", function(snapshot) {
		console.log(snapshot.val());
		usuario = snapshot.val();
		var mensaje = id_usuario_instagram + " te dio un toque";
		enviarNotificaion(usuario.token, mensaje);
		respuesta = {
			id: id,
			id_dispositivo: usuario.id_dispositivo,
			id_usuario_instagram: usuario.id_usuario_instagram
		};
		response.send(JSON.stringify(respuesta));
	}, function (errorObject) {
		console.log("The read failed: " + errorObject.code);
		respuesta = {
			id: "",
			id_dispositivo: "",
			id_usuario_instagram: ""
		};
		response.send(JSON.stringify(respuesta));

	});
});

function enviarNotificaion(tokenDestinatario, mensaje) {
	var serverKey = 'TU_APYKEY';
	var fcm = new FCM(serverKey);

	var message = {
	    to: tokenDestinatario, // required
	    collapse_key: '', 
	    data: {},
	    notification: {
	        title: 'Notificacion desde Servidor',
	        body: mensaje,
	        icon: "notificacion",
	        sound: "default",
	        color: "#00BCD4"
	    }
	};

	fcm.send(message, function(err, response){
	    if (err) {
	        console.log("Something has gone wrong!");
	    } else {
	        console.log("Successfully sent with response: ", response);
	    }
	});
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


