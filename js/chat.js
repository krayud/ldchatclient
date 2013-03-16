$(document).ready(function(){
	LDChatConnection();
});

var LDserverAddr = "127.0.0.1",
	LDserverPort = "9999",
	LDcookieForToken = "ldprousertoken",
	LDcookieDefaultExpiresHours = 24*180, // 180 дней
	LDsock = null,
	LDuserToken = null,
	LDconnected = false;

function LDChatConnection(){
	//alert("Соединение с сервером");
	LDsock = new SockJS("http://"+LDserverAddr+":"+LDserverPort);
	
	LDsock.onopen = function () {
		//alert("Соединение установлено");
		LDconnected = true;
		LDuserToken = LDChatGet_cookie(LDcookieForToken);
		LDChatSendMessage({type: "sendUserToken", token: LDuserToken});
	};
	
	LDsock.onmessage = function(e){
		var data = JSON.parse(e.data);
		switch(data.type){
			case 'confirmUserToken':
				LDChatConfirmUserToken(data);
				break;
			case 'setNewUserToken':
				LDChatSetNewUserToken(data);
				break;
			case 'receiveHistory':
				LDChatReceiveHistory(data);
				break;
		}
	};
}
//------COOKIE--------
function LDChatGet_cookie(cookie_name){
  var results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );
 
  if ( results )
    return ( unescape ( results[2] ) );
  else
    return null;
}
function LDChatSet_cookie( name, value, expiresHours, path, domain, secure ){
  var cookie_string = name + "=" + escape ( value );
 
 if (expiresHours)
 {
  var cookie_date = new Date();
	cookie_date.setTime(cookie_date.getTime() + 1000*60*60*expiresHours);
    cookie_string += "; expires=" + cookie_date.toGMTString();	 	
 }
 
  if ( path )
        cookie_string += "; path=" + escape ( path );
 
  if ( domain )
        cookie_string += "; domain=" + escape ( domain );
  
  if ( secure )
        cookie_string += "; secure";
  
  document.cookie = cookie_string;
}
function LDChatDelete_cookie(cookie_name){
  var cookie_date = new Date();  // Текущая дата и время
  cookie_date.setTime ( cookie_date.getTime() - 1 );
  document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}
//------FUNCS------
function LDChatSendMessage(params){
	LDsock.send(JSON.stringify(params));
}
function LDChatRequestHistory(){
	LDChatSendMessage({type: "RequestHistory", token: LDuserToken});
}
//-----EVENT HANDLERS----
function LDChatConfirmUserToken(data){
	//alert("Подтверждение токена пользователя: "+data.token);
	LDChatRequestHistory();
}
function LDChatSetNewUserToken(data){
	//alert("Запись нового токена пользователя: "+data.token);
	LDChatSet_cookie(LDcookieForToken, data.token, LDcookieDefaultExpiresHours);
	LDuserToken = data.token;
	LDChatRequestHistory();
}
function LDChatReceiveHistory(data){
	alert("Обработка получения истории: "+data.history);
	//TODO: Обработка получения истории
}
