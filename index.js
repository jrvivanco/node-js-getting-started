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
//id_dispositivo
//id_usuario_instagram
var usuariosInstagramURI = "registrar-usuario";
app.post('/' + usuariosInstagramURI, function(request, response) {
	var id_dispositivo 	= request.body.id_dispositivo;
	var id_usuario_instagram 	= request.body.id_usuario_instagram;
	var user_instagram = request.body.nombre_usuario_instagram;
	
	var db = firebase.database();
	var usuariosInstagram = db.ref(usuariosInstagramURI).push();
	usuariosInstagram.set({
		id_dispositivo: id_dispositivo,
		id_usuario_instagram: id_usuario_instagram,
		nombre_usuario_instagram: user_instagram
	});	

	var path = usuariosInstagram.toString(); //https://mascotita-aa119.firebaseio.com/registrar-usuario/-KJlTaOQPwP-ssImryV1
	var pathSplit = path.split(usuariosInstagramURI + "/")
	var idAutoGenerado = pathSplit[1];

	var respuesta = generarRespuestaUsuario(db, idAutoGenerado);
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(respuesta));
});

function generarRespuestaUsuario(db, idAuto) {
	var respuesta = {};
	var usuario = "";
	var ref = db.ref("registrar-usuario");
	ref.on("child_added", function(snapshot, prevChildKey) {
		usuario = snapshot.val();
		respuesta = {
			id: idAuto,
			id_dispositivo: usuario.id_dispositivo,
			id_usuario_instagram: usuario.id_usuario_instagram,
			nombre_usuario_instagram: usuario.nombre_usuario_instagram
		};
	});
	return respuesta;
}

var likesInstagramURI = "like-generado";
app.post('/' + likesInstagramURI, function(request, response) {
	var id_disp = request.body.id_dispositivo;
	var id_user = request.body.id_usuario_instagram;
	var id_foto = request.body.id_foto_instagram;	

	var db = firebase.database();
	var likesInstagram = db.ref(likesInstagramURI).push();
	likesInstagram.set({
		id_dispositivo: id_disp,
		id_usuario_instagram: id_user,
		id_foto_instagram: id_foto
	});	

	var path = likesInstagram.toString(); //https://mascotita-aa119.firebaseio.com/registrar-usuario/-KJlTaOQPwP-ssImryV1
	var pathSplit = path.split(likesInstagramURI + "/")
	var idAutoGenerado = pathSplit[1];

	var respuesta = generarRespuestaLikes(db, idAutoGenerado);
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(respuesta));
});

function generarRespuestaLikes(db, idAuto) {
	var respuesta = {};
	var usuario = "";
	var ref = db.ref("registrar-usuario");
	ref.on("child_added", function(snapshot, prevChildKey) {
		usuario = snapshot.val();
		respuesta = {
			id: idAuto,
			id_dispositivo: usuario.id_dispositivo,
			id_usuario_instagram: usuario.id_usuario_instagram,
			id_foto_instagram: usuario.id_foto_instagram
		};
	});
	return respuesta;
}

var notificaUsrURI="notifica-usuario";
app.post("/"+notificaUsrURI, function(request, response){	

	var miToken		= request.body.id_token; 
	var idUsrInst 	= request.body.id_usr_inst;
	var urlFotoUsr  = request.body.url_foto_usuario;

	var respuesta = {};
	var registro = "";
	var nombreUsuario ="";

	var db = firebase.database();
	var ref = db.ref(usuariosInstagramURI); //busco entre los usuarios registrados
	var contarEnvios=0;
        contarEnvios++;

	ref.once("value", function(snapshot){
	//ref.orderByChild("id_usuario_instagram").equalTo(idUsrInst).on("value", function(snapshot) {
		snapshot.forEach(function(childSnapshot){
	  		
	  		console.log("key: " + childSnapshot.getKey());
	  		registro=childSnapshot.val();
			
			if (registro.id_dispositivo!==miToken && registro.id_usuario_instagram==idUsrInst){
				//es el usuario de la foto y no es el dispositivo desde el que hago el lanzamiento
				//tengo que enviarle una notificación

				nombreUsuario=registro.nombre_usuario_instagram;
				
				console.log("Notificación #"+contarEnvios++);
				console.log("nombreUsuario: " + nombreUsuario);
				
				var msg="Hola "+registro.nombre_usuario_instagram+". Tienes un like en una foto tuya";
				enviarNotificacion(registro.id_dispositivo,msg, idUsrInst, nombreUsuario, urlFotoUsr);
				
				contarEnvios++;
				return true; //en cuanto encuentra uno, sale del bucle del forEach
			}
			else{
				nombreUsuario=registro.nombre_usuario_instagram;
				
				console.log("Notificación #"+contarEnvios++);
				console.log("nombreUsuario: " + nombreUsuario);
				
				var msg="Hola "+registro.nombre_usuario_instagram+". No se puede dar un like en una foto tuya";
				enviarNotificacion(registro.id_dispositivo,msg, idUsrInst, nombreUsuario, urlFotoUsr);
				
				contarEnvios++;
				return true; //en cuanto encuentra uno, sale del bucle del forEach
			}

		});
		
	}, function (errorObject) {
		  console.log("La lectura de datos falló: " + errorObject.code);
		  respuesta={
		  	id_usuario_instagram: "4393478762" //para que abra el propio timeline
		  	//,nombre_usuario_instagram: "Puppies" 
		  };
	});
	respuesta ={
					id_usuario_instagram: idUsrInst //registro.id_usuario_instagram,
					//,nombre_usuario_instagram: nombreUsuario // registro.nombre_usuario_instagram
				};
	response.setHeader("Content-Type", "application/json");
	response.send(JSON.stringify(respuesta));
})

function enviarNotificacion(tokenDestinatario, mensaje, idUsuario, nomUsuario, urlFoto) {
	var serverKey = 'AAAAIv7ojPs:APA91bFRJ3gJZmPlZJoSZOeRTSfrjfcU3Uh7YItzY6dYBPvT33W4kvT-SP3WK7sFlhD1u2u6SzrSP4YQkhKya-z10gMxVgh8MhLhNUdR6BuK7L25-LO_ql2VXrIwpMXkm5gsv8Eg5ES1';
	var fcm = new FCM(serverKey);

	var message = {
	    to: tokenDestinatario, // required
	    collapse_key: '', 
	    data: {
			idUsu: idUsuario,
	    	nomUsu: nomUsuario,
	    	urlUsu: urlFoto
		},
	    notification: {
	        title: 'Mascotita 7.0',
	        body: mensaje,
	        icon: "notificacion",
	        sound: "default",
	        color: "#00BCD4"
	    }
	};

	fcm.send(message, function(err, response){
		console.log("err: " + err);
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


