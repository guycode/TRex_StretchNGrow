var isMobile = {
Android: function() {
return navigator.userAgent.match(/Android/i);
},
BlackBerry: function() {
return navigator.userAgent.match(/BlackBerry/i);
},
iOS: function() {
return navigator.userAgent.match(/iPhone|iPad|iPod/i);
},
Opera: function() {
return navigator.userAgent.match(/Opera Mini/i);
},
Windows: function() {
return navigator.userAgent.match(/IEMobile/i);
},
any: function() {
return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
}
};
detectMobile = isMobile.any();
// function init() {
// 	window.addEventListener('scroll', function(e){
// 	var distanceY = window.pageYOffset || document.documentElement.scrollTop,
// 	shrinkOn =10000,
// 	v_scroll = document.querySelector(".top_menu");
// 	if (distanceY > shrinkOn) {
// 	classie.add(v_scroll,"smaller");
// 	} else {
// 	if (classie.has(v_scroll,"smaller")) {
// 	classie.remove(v_scroll,"smaller");
// 	}
// 	}
// 	});
// 	}
// 	window.onload = init();
if (!detectMobile) {
	
}