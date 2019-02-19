var socket = io();

function scrollToBottom () {
   //Selectors
   var messages=jQuery('#messages');
   var newMessage = messages.children('li:last-child')
   //Heights
   var clientHeight = messages.prop('clientHeight');
   var scrollTop = messages.prop('scrollTop');
   var scrollHeight = messages.prop('scrollHeight');
   var newMessageHeight = newMessage.innerHeight();
   var lastMessageHeight = newMessage.prev().innerHeight(); 

   if((clientHeight + scrollTop + newMessageHeight + lastMessageHeight)>= scrollHeight){
   	messages.scrollTop(scrollHeight);
   } 
};

socket.on('connect',function () {
	var params = jQuery.deparam(window.location.search);
    
    socket.emit('join',params, function (err) {
        if(err) {
        	alert(err);
            window.location.href = '/';
        } else {
            console.log('No error');  
        }
    }); 
});

socket.on('newMessage', function (data) {
     var formattedTime = moment(data.createdAt).format('h:mm a');
     var template = jQuery('#message-template').html();
     var html = Mustache.render(template,{
     	text:data.text,
     	from:data.from,
     	createdAt:formattedTime
     });
     jQuery('#messages').append(html);
	 scrollToBottom();

	// var li=jQuery('<li></li>');
	// li.text(`${data.from} ${formattedTime}: ${data.text}`);

	// jQuery('#messages').append(li);
});

socket.on('disconnect',function () {
    console.log('Disconnected from user');
});

socket.on('newLocationMessage', function(message){
	var formattedTime = moment(message.createdAt).format('h:mm a');
    var template= jQuery("#location-message-template").html();
    var html = Mustache.render(template,{
    	from:message.from,
    	url:message.url,
    	createdAt:formattedTime
    });
    jQuery("#messages").append(html);
    scrollToBottom();

	// var li = jQuery('<li></li>');
	// var a= jQuery(`<a target="_blank">My Current Location</a>`);

	// li.text(`${message.from} ${formattedTime}: `);
	// a.attr('href',message.url);
	// li.append(a);
	// jQuery('#messages').append(li);
});

jQuery('#message-form').on('submit', function (e) {
	e.preventDefault();
     
    var  messageTextbox = jQuery('[name=message]');
	socket.emit('createMessage', {
       text:messageTextbox.val()
	},function () {
       messageTextbox.val('')
	});
});

var locationButtton= jQuery('#send-location');
locationButtton.on('click',function () {
	if(!navigator.geolocation){
		return alert('Geolocation not supported by your browser');
	}

	locationButtton.attr('disabled','disabled').text('Sending Location....');

	navigator.geolocation.getCurrentPosition(function (position){
       locationButtton.removeAttr('disabled').text('Send Location');
       socket.emit('createLocationMessage',{
       	 latitude: position.coords.latitude,
       	 longitude: position.coords.longitude
       });
	},function () {
		       locationButtton.removeAttr('disabled').text('Send Location');
		alert('Unable to fetch location.')
	});
});

socket.on('updateUserList', function(users) {
	var ol=jQuery('<ol></ol>');
	users.forEach(function (user) {
		ol.append(jQuery('<li></li>').text(user));
	});
	jQuery('#users').html(ol);
});
