/*
// [2023.03.16] поправка MIME-типа для отдаваемых файлов .js
// [2022.11.01] начал перенос всей функциональности из сервера в
// скрипты клиента, что бы сервер только обеспечивал браузеру доступ 
// к файловой системе. Это позволит одному серверу параллельно 
// обслуживать страницы разных проектов открытых одновременно
// [2022.10.11] попытка сделать один сервер для всех nodejs проектов
// для того, что бы можно было переключаться между ними обычным 
// переходом по URL'ам. Но для этого сервер должен стать простым
// получателем/отправлятелем файлов, а вся логика будет в скриптах 
// страницы.
// 
// [2022.07.29] изменен алгоритм появления идей
// вместо таймера на пошаговый
// [2022.07.19] добавлен запрос
// REMOVE_DROPPED_IDEA
// [2022.07.10] добавлены запросы
// REQUEST_DROPPED_IDEAS , REQUEST_NUMBERED_QUOTE
// [2022.07.01] добавлены запросы
// REQUEST_RANDOM_QUOTE , REQUEST_LAST_QUOTE
// [2022.06.28] добавлены обработки запросов:
// DEBUG , REQUEST_INFO , ADD_QUOTE , MOVE
// и увеличения ресурсов
// [+] Попытка создать веб-сервер 
// отдает картинки и скрипты (24.08.2020)
*/

var http = require('http');
var fs = require('fs');
// var htmlFile;
var reqFile = null ;
var fType ;
const sIndexFileName = "" + process.argv.slice(2); // './testSheme_8.2.htm' ; 
// const sIndexFileName = './testSheme_8.3.htm' ; 

var fContent ; 

var body = "" ;
var gCommand ; 
var server = http.createServer(function(req, res) 
{	
	if ( req.url == '/' ) {
		fName = sIndexFileName ; 
	} else {
		fName = '.' + req.url ; 
	}
	let sExt = fName.substr ( -3 , 3 ).toUpperCase ( ) ;
	// console.log ( sExt ) ;
	if ( sExt == ".JS" ) {
		fType = "text/javascript" ;
	} else {
		fType = 'text/html' ;
	}
	var aCommandLine = req.url.split ( '/' ) ;
	gCommand = aCommandLine [ aCommandLine.length - 1 ] ;
	// console.log ( "LAST command is:" + gCommand ) ; 
	if ( req.method == "GET" ) {
		
		var dd = fs.readFileSync ( fName );
		reqFile = dd;	  
	 	res.writeHead(200, { 'Content-Type': fType });
		// console.log ( 'send ' + fName + ' , bytes ' + reqFile.length ) ;
		// console.log (  `type ${ fType } ` ) ;
		// console.log ('--------');
		res.end(reqFile); 		
		// }
	} else if (req.method == "POST" ) {
		req.on('data', chunk => {
            body += chunk.toString();
        } );
        req.on('end', () => {
            // console.log("POST message: " + body);
            /* 
            if ( gCommand == "ADD_QUOTE" ) { // req.url ==
            	var arVal = JSON.parse ( body ) ;
            	// console.log ( "new Quote : " + arVal ) ;
	            add_new_quote ( arVal ) ;
            } else */ 
            if ( gCommand == "DEBUG" ) { 
            	var arVal = JSON.parse ( body ) ;
            	console.log ( arVal ) ; 
			} else {
	            // console.log("POST message: " + req.method );
	            fs.writeFileSync ( '.' + req.url , body ) ;
				// console.log( req.url + " file written"); 
            }
            body = "" ; 
	         res.end('ok');
        });
	} else if ( req.method == "PUT" ) {
        req.on('data', chunk => {
            body += chunk.toString();
        } );
	    req.on('end', () => {
			console.log ( `UNKNOWN PUT command: ${ gCommand }` ) ;
	            body = "" ; 
	            res.end('ok');
	        });
	}
});
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

function get_cities ( lat1 , long1 , lat2 , long2 ) {
	var xQt = xpath.select ( "//geo/structure/continent/country/city[@lat <= '" + lat1 + "' and @lat >= " + lat2 + " and @long >= " + long1 + " and @long <= " + long2 + " ]" , xmlGeo ) ;
	if ( xQt.length == 0 ) {
		console.log ( `cities into [ ${ Number( lat1 ).toFixed (3) },${ Number( long1 ).toFixed ( 3 ) } ] / [ ${ Number ( lat2 ).toFixed ( 3 ) },${ Number ( long2 ).toFixed ( 3 ) } ] not found` ) ;
		return [ ] ;
	}
	// console.log ( `REQUEST_CITIES: latMin/longMin [${ Number ( lat1 ).toFixed ( 3 ) }/${ Number ( long1 ).toFixed ( 3 ) }] \n\t\t latMax/longMax : [ ${ Number ( lat2 ).toFixed ( 3 ) }/${ long2 } ] ` ) ;
	// console.log ( `REQUEST_CITIES: found ${ xQt.length } cities ` ) ;
	var resA = [ ] ;
	for ( var curC = 0 ; curC < xQt.length ; curC++ ) {
		resA.push ( [ xQt [ curC ].getAttribute ( "name" ) , xQt [ curC ].getAttribute ( "lat" ) , xQt [ curC ].getAttribute ( "long" ) ] ) ;
		// console.log ( `${ xQt [ curC ].getAttribute ( "name" ) } lat: ${ xQt [ curC ].getAttribute ( "lat" ) } long: ${ xQt [ curC ].getAttribute ( "long" ) } ` ) ;
	}
	// console.log ( `RET : ${ resA } ` ) ;
	return resA;
}
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function get_point_id ( fP ) {
	var xQt = xpath.select ( "//geo/travel/points/p[@lat = '" + fP [ 0 ] + "' ]" , xmlGeo ) ;
	if ( xQt.length == 0 ) {
		console.log ( `get_point_id : ${ fP } not found` ) ;
		return null ;
	} else {
		return xQt [ 0 ].getAttribute ( "pid" ) ;
	}
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

server.listen(8081);
console.log ('-- [CREATED index: >' + sIndexFileName + '<] -------- ' );

// setTimeout ( ideasLoop , 60000 ) ;
// ideasLoop ( ) ;

// setTimeout ( test_timer , 2000 ) ;
// add_new_quote ( [ 0 , 0 ] ) ;
// change_resource ( 1, 1 ) ;
// console.log ( get_random_quote ( ) ) ;
// get_last_quote ( ) ;
// manageIdeas ( ) ;
// findCountry ( "Эфиопия" ) ;

// remove_idea_from_dropped_list ( 0 ) ; // init generation
