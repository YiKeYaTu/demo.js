var eventHandler = {
	addEvent:function(target,type,callback,useCapture){
		if(!target["event" + type]){
			target["event" + type] = {};
		}
		useCapture = useCapture || false;
		var fn = callback.toString().replace(/\s+/g,"");
		target["event" + type][fn] = handle;
		if(target.addEventListener){
			target.addEventListener(type,handle,useCapture);
		}else if(target.attachEvent){
			target.attachEvent("on" + type,handle);
		}else{
			target["on" + type] = handle;
		}
		function handle(event){
			var event = event || window.event,
				preventDefault,
				stopPropagation;
			event.target = event.target || event.srcElement;
			preventDefault = event.preventDefault;
			stopPropagation = event.stopPropagation;
			event.preventDefault = function(){
				if(preventDefault){
					preventDefault.call(event);
				}else{
					event.returnValue = false;
				}
			}
			event.stopPropagation = function(){
				if(stopPropagation){
					stopPropagation.call(event);
				}else{
					event.cancelBubble = true;
				}
			}
			var	returnValue = callback.call(target,event);
			if(!returnValue){
				event.preventDefault();
				event.stopPropagation();
			}
		}
	},
	removeEvent:function(target,type,callback,useCapture){
		var fn = callback.toString().replace(/\s+/g,""),
			removeFn = target["event" + type][fn],
			useCapture = useCapture || false;
		if(target.removeEventListener){
			target.removeEventListener(type,removeFn,useCapture);
		}else if(target.detachEvent){
			target.detachEvent("on" + type,removeFn);
		}else{
			target["on" + type] = null;
		}
	},
	removeAll:function(target,type,useCapture){
		var useCapture = useCapture || false,
			arr = target["event" + type];
			for(var key in arr){
				if(target.removeEventListener){
					target.removeEventListener(type,arr[key],useCapture);
				}else if(target.detachEvent){
					target.detachEvent("on" + type,arr[key]);
				}else{
					target["on" + type] = null;
				}
			}

	},
	live:function(father,child,type,callback){
		if(!is(child,Array)){
			var arr = [],
				len;
			for(var i = 0,len = child.length;i < len;i++){
				arr.push(child[i]);
			}
		}else{
			arr = child;
		}
		this.addEvent(father,type,handle);
		function handle(e){
			var target = e.target;
			if(indexOf(arr,target) != -1){
				callback.call(target,e);
			}else{
				return;
			}
		}
	}
}
function is(element,type){
	return Object.prototype.toString.call(element) == "[object " + type + "]";
}
function indexOf(arr,target){
	if(arr.indexOf){
		return arr.indexOf(target);
	}else{
		var len;
		for(var i = 0,len = arr.length;i < len;i++){
			if(arr[i] == target){
				return i;
			}
		}
		return -1;
	}
}
function forEach(arr,fn){
	if(arr.forEach){
		arr.forEach(function(item,index,array){
			fn(item,index,array);
		})
	}else{
		var len = arr.length;
		for(var i = 0;i < len;i++){
			fn(arr[i],i,arr);
		}
	}
}
var ajaxObject = {
	createXhr:function(){
		if(window.XMLHttpRequest){
			return new XMLHttpRequest();
		}else if(window.ActiveXObject){
			return new ActiveXObject(Microsoft.XMLHTTP);
		}
	},
	encode:function(json){
		var arr = [];
		for(var key in json){
			arr.push(encodeURIComponent(key) + "=" + encodeURIComponent(json[key]));
		}
		return arr.join("&");
	},
	GET:function(xhr,target,callback,string){
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4){
				if(xhr.status >= 200&&xhr.status < 300||xhr.status == 304){
					callback(xhr.responseText);
				}else{
					return;
				}
			}
		}
		if(string){
			xhr.open("GET",target + "?" + string,true);
		}else{
			xhr.open("GET",target,true);
		}
		xhr.send(null);
	},
	POST:function(xhr,string,target,callback){
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4){
				if(xhr.status >= 200&&xhr.status < 300||xhr.status == 304){
					callback(xhr.responseText);
				}else{
					return;
				}
			}
		}
		xhr.open("POST",target,true);
		xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		xhr.send(string);
	}
}
cookieObject = {
	set:function(name,value,expiress,path,domain,secure){
		var cookieText = encodeURIComponent(name) + "=" + encodeURIComponent(value);
		if(expiress instanceof Date){
			cookieText += "; expiress=" + expiress.toGMTSting();
		}
		if(path){
			cookieText += "; path=" + path;
		}
		if(domain){
			cookieText += "; domain" + domain;
		}
		if(secure){
			cookieText += "; secure";
		}
		document.cookie = cookieText;
	},
	get:function(name){
		var cookie = document.cookie,
			cookieStart = cookie.indexOf();
	},
	unset:function(){

	}
}
function nodeFor(node){
	var element,
		arr;
	element =  node.firstChild;
	arr = [];
	while(element){
		arr.push(element);
		arguments.callee.call(this,element);
		element = element.nextSibling;
	}
	return arr;
}
var animation = {
	move:function(target,json,speed,callback){//1.target目标2.json需求变化3.变化的速度4.动画完成后回调
		var timeScal = 1000/60,
			count = speed/timeScal,
			floorCount = Math.floor(count),
			counting = 0,
			timer,
			oldValue,
			distance,
			finalValue;
		if(!target.animation_final || !target.animation_old || !target.animation_distance){
			target.animation_final = {};
			target.animation_old = {};
			target.animation_distance = {};
		}
		for(var key in json){
			target.animation_final[key] = parseFloat(json[key]);
			if(key == "opacity"&&!target.addEventListener){
				target.animation_old[key] = parseFloat(target.filters.alpha.opacity);
				target.animation_distance[key] = (parseFloat(json[key])*100 - parseFloat(target.animation_old[key]))/count;
			}else{
				target.animation_old[key] = parseFloat(getStyle(target,key));
				target.animation_distance[key] = (parseFloat(json[key]) - parseFloat(target.animation_old[key]))/count;
			}		
		}
		if(!target.timer){
			target.timer = setInterval(function(){
				for(key in json){
					if(key == "opacity"){
						if(!target.addEventListener){
							oldValue = target.animation_old[key];
							distance = target.animation_distance[key];
							target.filters.alpha.opacity = (oldValue + distance);
							target.animation_old[key] = oldValue + distance;
						}else{
							oldValue = target.animation_old[key];
							distance = target.animation_distance[key];
							target.style[key] = oldValue + distance;
							target.animation_old[key] = oldValue + distance;
						}
					}else{
						oldValue = target.animation_old[key];
						distance = target.animation_distance[key];
						target.style[key] = oldValue + distance + "px";
						target.animation_old[key] = oldValue + distance;
					}
				}
				counting++;
				if(counting == floorCount){
					for(key in json){
						target.style[key] = json[key];
					}
					clearInterval(target.timer);
					target.timer = null;
					callback&&callback();
				}
			},timeScal)
		}
	},
	stop:function(target){
		clearInterval(target.timer);
		target.timer = null;
	}
	
}
function getStyle(target,style){
	if(window.getComputedStyle){
		return window.getComputedStyle(target,null)[style];
	}else{
		return target.currentStyle[style];
	}
}
function getElement (target) {
			var elementPartitioning = target.split(","),
				handle_arr = [],
				i,
				j,
				k,
				l,
				lenI,
				linJ,
				temp = [],
				tempT1 = [],
				tempT2 = [];
			for(i = 0,lenI = elementPartitioning.length;i < lenI;i++){
				handle_arr[i] = elementPartitioning[i].split(" ");
				for(j = 0,lenJ = handle_arr[i].length;j < lenJ;j++){
					if(handle_arr[i][j][0] == "."){
						if(temp.length == 0 && !j){
							temp[0] = handle_arr[i][j];
						}
							if(j == 0){
								tempT1 = getElementsByClassName(null,handle_arr[i][j].slice(1,handle_arr[i][j].length));
								temp = tempT1;
							}else{
								tempT2 = temp;
								temp = [];
								for(l = 0;l < tempT2.length;l++){
									tempT1 = getElementsByClassName(tempT2[l],handle_arr[i][j].slice(1,handle_arr[i][j].length));
									temp = temp.concat(tempT1);
								}
							}
					}else if(handle_arr[i][j][0] == "#"){
						if(j == 0){
							temp.push(document.getElementById(handle_arr[i][j].slice(1,handle_arr[i][j].length)));
						}else{
							tempT2 = temp;
							temp = [];
							for(l = 0;l < tempT2.length;l++){
								tempT1 = document.getElementById(handle_arr[i][j].slice(1,handle_arr[i][j].length));
								if(tempT1.parentNode == tempT2[l]){
									temp = temp.concat(tempT1);
								}
							}
						}
					}else{
						if(j == 0){
							temp = document.getElementsByTagName(handle_arr[i][j]);
						}else{
							tempT2 = temp;
							temp = [];
							for(l = 0;l < tempT2.length;l++){
								tempT1 = tempT2[l].getElementsByTagName(handle_arr[i][j].slice(1,handle_arr[i][j].length));
								temp = temp.concat(tempT1);
							}
						}
					}
				}
				console.log(temp);
				return temp;
			}
		}
		function getElementsByClassName (father,argument) {
			var node = father || document
				if(!node.getElementsByTagName){
					return;
				}
				var	temp = node.getElementsByTagName("*"),
					arr = [];
				forEach(temp,function (item,index,array){
					if(indexOf(item.className.split(" "),argument) >= 0){
						arr.push(item);
					}
				});
				return arr;
			}
function Carousel(width,speed,rem) {
    if (!this instanceof Carousel) {
        return new Carousel(width,speed);
    }
    this.elementArray = [];
    this.callbackElementArray = [];
    this.count = 0;
    this.width = width;
    this.speed = speed || 5000;
    this.timer = null;
    this.callbackAction = null;//哪个小点处于激活状态

}
Carousel.prototype = {
    constructor:Carousel,
    start:function() {
        this.timer = setTimeout(bind(this.left,this),this.speed);
    },
    pushElement:function(fatherNode) {
        var childNode = fatherNode.children;
        for(var i = 0;i < childNode.length;i++){
            this.elementArray.push(childNode[i]);
        }
    },
    pushcallbackElement:function(fatherNode) {
        var childNode = fatherNode.children;
        for(var i = 0;i < childNode.length;i++){
            this.callbackElementArray.push(childNode[i]);
            childNode[i].children[0].number = i;
        }
        this.callbackAction = this.callbackElementArray[0];
    },
    left:function() {
        var arr = this.elementArray;
        width = this.width;
        if(this.count == arr.length - 1){
            forEach(arr,function(item,index,array){
                animation.move(item,{"left":index*width + ""},200);
            })
            this.count = 0;
        } else {

            forEach(arr,function(item,index,array) {
                animation.move(item,{"left":parseInt(getStyle(item,"left")) - width},200);
            });
            this.count++;
        }
        !!this.callbackElementArray[0]&&this.callBack();
        this.timer = setTimeout(bind(this.left,this),this.speed);
    },
    stop:function() {
        if(this.timer) clearTimeout(this.timer);
    },
    callBack:function() {
        this.callbackAction.className = "";
        this.callbackAction = this.callbackElementArray[this.count];
        this.callbackAction.className = "action";
    },
    click:function(num) {
        this.stop();
        var count = num,
            width = this.width,
            arr = this.elementArray;
        forEach(arr,function(item,index,array) {
            animation.move(item,{"left":(index - count) * width + ""},200);
        })
        this.count = num;
        if (this.callbackElementArray.length > 1) {
            this.callBack();
        }
        this.start();
    },
    touch:function(){
    	if(!this.elementArray) return;
    	var that = this,
    		parent = that.elementArray[0].parentNode,
        	arr = that.elementArray;
        	width = that.width;
    		oldX = 0,
    		newX = 0,
    		fPostion = 0,
    		lPostion = 0,
    		temp = 0,
    		jud = false,
    		distance = 0;
    	parent.addEventListener("touchstart",function (e) {
    		that.stop();
    		fPostion = oldX = e.touches[0].pageX;
    		jud = true;
    	})
    	parent.addEventListener("touchmove",function (e) {
    		e.preventDefault();
    		if(!jud) return;
    		newX = e.touches[0].pageX;
    		distance = newX - oldX;
    		oldX = newX;
    		forEach(arr,function(item,index,array) {
    			item.style.left = parseInt(getStyle(item,"left")) + distance + "px";
            });
    	})
    	parent.addEventListener("touchend",function (e) {
    		lPostion = newX;
    		if(Math.abs(lPostion - fPostion) < width/2){
    			forEach(arr,function(item,index,array) {
    				animation.move(item,{"left":parseInt(getStyle(item,"left")) - (lPostion - fPostion) + "px"},100);
            	});
            	that.start();
    		}else{
    			if(lPostion - fPostion < 0){
    				if(that.count == that.elementArray.length - 1){
    					forEach(arr,function(item,index,array) {
		    				animation.move(item,{"left":parseInt(getStyle(item,"left")) - (lPostion - fPostion) + "px"},100);
		            	});
    					return;
    				}
    				that.click(++that.count);
    			}else{
    				if(that.count == 0){
    					forEach(arr,function(item,index,array) {
		    				animation.move(item,{"left":parseInt(getStyle(item,"left")) - (lPostion - fPostion) + "px"},100);
		            	});
    					return;
    				}
    				that.click(--that.count);
    			}
    		}
    		jud = false;
    	})
    }
}
function bind(fn,context){
	return function () {
		fn.call(context);
	}
}

