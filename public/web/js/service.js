'use strict';
//2015/9/25 v1.5

//获取url参数
var url = angular.module('url',['ionic']);
url.factory('urlBox',function($location){
    function GetQueryString(name)
    {
        return $location.search()[name];
    }
    return {
        getUrl :function(name){
            return GetQueryString(name);
        }
    }
});

//封装移动端弹出框
var popBox = angular.module('popBox',['ionic','jqLite','cookie','httpSever','loading','scrollResize']);
var myPopup; //弹出框对象
popBox.factory('popBox',function($ionicPopup,jQuery,promise,cookie,$http,$location,loadPop,scroll,$timeout){
    var showPopup = function($scope,scope,title,subTitle,img) {
        myPopup = $ionicPopup.show({
            template: '<div ng-controller="popImg">' +
                          '<div ng-click="changeImg()" style="margin: 0 auto;display: block;width: 115px;margin-bottom: 20px;height: 28px">' +
                              '<img ng-src = "{{imagesGet}}">' +
                          '</div>' +
                          '<input class="checkoutText" type="text">' +
                      '</div>',
            title: title,
            subTitle: subTitle,
            scope: $scope,
            buttons: [
                { text: '取消' },
                {
                    text: '<b>提交</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        var close = function(){
                            if($location.$$path == '/index/communityContent'){
                                $scope.footerShow = false;
                            }
                            $scope.footerMaskLayerShow = false;
                            $scope.footerCommentShow = false;
                            $scope.footerStyle = {
                                height: '44px'
                            };
                        };
                        var len = jQuery.$('commentText').length;
                        var content;
                        for(var i = 0;i < len;i++){
                            if(jQuery.$('commentText')[i].value){
                                content = jQuery.$('commentText')[i].value;
                                break;
                            }
                        }
                        if(cookie.getCookie('img_token') && !cookie.getCookie('access_token')){
                            //匿名回复
                            $timeout(function(){
                                if(commentIndex && commentIndex == 'commentReplies'){
                                    $http({
                                        method: 'POST',
                                        url: '/v1/articles/' + 1 + '/comments/'+ commentId +'/anonymous_replies',
                                        data: {
                                            "content": content,
                                            "captcha": jQuery.$('checkoutText')[0].value,
                                            'token': cookie.getCookie('img_token'),
                                            'flag': cookie.getCookie('flags')
                                        },
                                        headers:{
                                            'Cache-Control': 'no-cache'
                                        }
                                    }).success(function(){
                                        loadPop.spinningBubbles();
                                        if($location.$$path == '/index/viewComments' || $location.$$path == '/index/mainText'){
                                            promise.getArticlesComments(cookie.getCookie('newsId')).success(function(data){
                                                if($location.$$path == '/index/mainText'){
                                                    promise.getArticles('',cookie.getCookie('newsId')).success(function(data){
                                                        $scope.comments = data.hot_comments;
                                                    });
                                                }
                                                $scope.commentThisData = data.lists;
                                                $scope.commentOthers = data.extras;
                                                scroll.resize();
                                                var len = jQuery.$('commentText').length;
                                                for(var i = 0;i < len;i++){
                                                    if(jQuery.$('commentText')[i].value){
                                                        jQuery.$('commentText')[i].value = '';
                                                    }
                                                }
                                                close();
                                                loadPop.stopAll();
                                            }).error(function(data){
                                                loadPop.stopAll();
                                                showConfirm('警告!',data.error_description);
                                            });
                                        }
                                        else if($location.$$path == '/index/communityContent'){
                                            $scope.footerShow = false;    //是否显示页脚
                                            $scope.footerMaskLayerShow = false;
                                            if(comments.length != 0){
                                                loadPop.spinningBubbles();
                                                promise.getTypeComments(comments).success(function(data){
                                                    if(data.length != 0){
                                                        $scope.slideDownIndex = true;
                                                    }
                                                    $scope.comComments = data;
                                                    $timeout(function(){
                                                        //修复滚动条高度
                                                        $scope.heightFix = {
                                                            height: (
                                                            jQuery.$('list')[1].scrollHeight +
                                                            jQuery.$('commLineHeight')[0].children[0].scrollHeight +
                                                            jQuery.$('commLineHeight')[1].children[0].scrollHeight)  + 'px'
                                                        };
                                                        loadPop.stopAll();
                                                        scroll.resize();
                                                    });
                                                }).error(function(data){
                                                    showConfirm('警告!',data.error_description);
                                                    loadPop.stopAll();
                                                });
                                            }
                                        }
                                    }).error(function(data){
                                        showConfirm('警告!',data.error_description);
                                    });
                                }
                                //匿名评论
                                else if(commentIndex && commentIndex == 'commentThis'){
                                    loadPop.spinningBubbles();
                                    promise.postArticlesComments(cookie.getCookie('newsId'),{
                                        'content': content,
                                        'captcha': jQuery.$('checkoutText')[0].value,
                                        'token': cookie.getCookie('img_token'),
                                        'flag': cookie.getCookie('flags')
                                    }).success(function(){
                                        if($location.$$path == '/index/viewComments' || $location.$$path == '/index/mainText'){
                                            promise.getArticlesComments(cookie.getCookie('newsId')).success(function(data){
                                                if($location.$$path == '/index/mainText'){
                                                    promise.getArticles('',cookie.getCookie('newsId')).success(function(data){
                                                        $scope.comments = data.hot_comments;
                                                    });
                                                }
                                                $scope.commentThisData = data.lists;
                                                $scope.commentOthers = data.extras;
                                                scroll.resize();
                                                var len = jQuery.$('commentText').length;
                                                for(var i = 0;i < len;i++){
                                                    if(jQuery.$('commentText')[i].value){
                                                        jQuery.$('commentText')[i].value = '';
                                                    }
                                                }
                                                close();
                                                loadPop.stopAll();
                                            }).error(function(data){
                                                loadPop.stopAll();
                                                showConfirm('警告!',data.error_description);
                                            });
                                        }
                                    })
                                        .error(function(data){
                                            loadPop.stopAll();
                                            showConfirm('警告!',data.error_description);
                                        });
                                }
                            });
                        }
                    }
                }
            ]
        });
    };
    var choicePopup = function(scope,title) {
        myPopup = $ionicPopup.show({
            template: '<div ng-controller="radio">' +
                          '<ion-radio ng-model="choice" value="man" ng-change="serverSideChange(1)">男</ion-radio>' +
                          '<ion-radio ng-model="choice" value="woman" ng-change="serverSideChange(0)">女</ion-radio>' +
                      '</div>',
            title: title,
            subTitle: '',
            buttons: [
                { text: '关闭' ,type: 'button-positive'}
            ]
        });
    };
    var showConfirm = function(title,data) {
        myPopup = $ionicPopup.confirm({
            title: title,
            template: data,
            subTitle: '',
            buttons: [
                { text: '关闭' ,type: 'button-positive'}
            ]
        });
    };
    var showAlert = function() {
        myPopup = $ionicPopup.alert({
            title: 'warning',
            template: 'xxx'
        });
    };


    return{
        // 输入框
        showPopup: function(scope,title,subTitle,img){
            if(myPopup){
                myPopup.close();
            }
            showPopup(scope,title,subTitle,img);
            jQuery.$('backdrop').css({background:'black',opacity:'0.5'});
        },
        // 选择框
        choicePopup: function(scope,title){
            if(myPopup){
                myPopup.close();
            }
            choicePopup(scope,title);
            jQuery.$('backdrop').css({background:'black',opacity:'0.5'});
        },
        // 提示框
        showConfirm: function(title,data){
            if(myPopup){
                myPopup.close();
            }
            showConfirm(title,data);
            jQuery.$('backdrop').css({background:'black',opacity:'0.5'});
        },
        // 弹出框
        showAlert: function(){
            if(myPopup){
                myPopup.close();
            }
            showAlert();
            jQuery.$('backdrop').css({background:'black',opacity:'0.5'})
        }
    }
});

//封装图片Base64转换
var Base64 = angular.module('Base64',[]);
Base64.factory('Base64',function(){
    function convertImgToBase64(url, callback, outputFormat){
        var canvas = document.createElement('CANVAS'),
            ctx = canvas.getContext('2d'),
            img = new Image;
        img.crossOrigin = 'Anonymous';
        img.onload = function(){
            canvas.height = img.height;
            canvas.width = img.width;
            ctx.drawImage(img,0,0);
            var dataURL = canvas.toDataURL(outputFormat || 'image/png');
            callback.call(this, dataURL);
            canvas = null;
        };
        img.src = url;
    }
    return{
        //Base64转换
        convertImgToBase64: function(url, callback, outputFormat){
            return convertImgToBase64(url, callback, outputFormat);
        }
    }
});

//封装加载框
var loading = angular.module('loading',['ionic','jqLite']);
loading.factory('loadPop',function($ionicLoading,jQuery){
    var spinningBubbles = function(){
        $ionicLoading.show({
            template: '<img src="svg/Loading..._files/loading-spinning-bubbles.svg" width="64" height="64">'
            +'<span style="display: block;padding-left: 10px">正在加载...</span>'
        });
        jQuery.$('backdrop').css({background:'black',opacity:'0.5'});
        jQuery.$('loading').addClass('loadingAdd');
    };
    var stopAll = function(){
        jQuery.$('loading').removeClass('loadingAdd');
        $ionicLoading.hide();
    };
    return{
        //加载框
        spinningBubbles: function(){
            return spinningBubbles();
        },
        stopAll: function(){
            return stopAll();
        }
    }
});

//封装数组算法
var arrayBox = angular.module('arrayBox',[]);
arrayBox.factory('arrayBox',function(){
    function delSame(array){
        for(var i = 0; i < array.length;i++){
            for(var k = 0; k < array.length;k++){
                if(array[i] == array[k] && i!=k){
                    array.splice(k,1);
                }
            }
        }
        return array;
    }
    function sortNumber(a,b)
    {
        return a - b
    }
    function shortToBig(array){
        return array.sort(sortNumber);
    }
    return{
        //数组排除重复
        delSame: function(array){
            return delSame(array);
        },
        //数组从小到大排序
        shortToBig: function(array){
            return shortToBig(array);
        }
    }
});

//封装ajax
var httpSever = angular.module('httpSever',[]);
httpSever.factory('http',function($http){
    //序列化
    var param = function(obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;
        for(name in obj) {
            value = obj[name];
            if(value instanceof Array) {
                for(i=0; i<value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value instanceof Object) {
                for(subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }
        return query.length ? query.substr(0, query.length - 1) : query;
    };
    var backData = function(act,url,data,accessToken){
        if(accessToken){
            if(act == 'POST' || act == 'post'){
                return $http({
                    method: act,
                    url: url,
                    data: param(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization' : accessToken
                    }
                })
            }
            else if(act == 'GET' || act == 'get'){
                return $http({
                    method: act,
                    url: url,
                    params: data,
                    headers: {
                        'Authorization' : accessToken
                    }
                })
            }
            else if(act == 'PUT' || act == 'put'){
                return $http({
                    method: act,
                    url: url,
                    data: param(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization' : accessToken
                    }
                })
            }
            else if(act == 'DELETE' || act == 'delete'){
                return $http({
                    method: act,
                    url: url,
                    data: param(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization' : accessToken
                    }
                })
            }
        }
        else{
            if(act == 'POST' || act == 'post'){
                return $http({
                    method: act,
                    url: url,
                    data: param(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
            }
            else if(act == 'GET' || act == 'get'){
                return $http({
                    method: act,
                    url: url,
                    params: data
                })
            }
            else if(act == 'PUT' || act == 'put'){
                return $http({
                    method: act,
                    url: url,
                    data: param(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
            }
            else if(act == 'DELETE' || act == 'delete'){
                return $http({
                    method: act,
                    url: url,
                    data: param(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                })
            }
        }
    };
    return{
        sever: function(act,url,data,accessToken){
            return backData(act,url,data,accessToken).error(function(){
                backData(act,url,data,accessToken);
            });
        }
    }
});

//封装加载框
var LoadingApp = angular.module('LoadingApp',[]);
LoadingApp.factory('loading',function($ionicLoading){
    //开始加载
    var show = function(){
        $ionicLoading.show({
            templateUrl: '../web/module/loading.html',
            noBackdrop: false
        });
    };
    //停止加载
    var hide = function(){
        $ionicLoading.hide();
    };
    return{
        showLoading: function(){
            return show();
        },
        hideLoading: function(){
            return hide();
        }
    }
});

//封装jQuery选择器
var jqLite = angular.module('jqLite',[]);
jqLite.factory('jQuery',function(){
    return{
        $ :function(dom){
            return angular.element(document.getElementsByClassName(dom));
        }
    }
});

//封装获取浏览器数据信息
var browser = angular.module('browser',[]);
browser.factory('browser',function(){
    var clientWidth = document.body.clientWidth; //网页可见区域宽
    var clientHeight = document.body.clientHeight; //网页可见区域高
    var offsetWidth = document.body.offsetWidth; //网页可见区域宽,包括边线和滚动条的宽
    var offsetHeight = document.body.offsetHeight;//网页可见区域高,包括边线的宽
    var scrollWidth = document.body.scrollWidth;//网页正文全文宽
    var scrollHeight = document.body.scrollHeight;//网页正文全文高
    var screenH = window.screen.height;//屏幕分辨率的高
    var screenW = window.screen.width;//屏幕分辨率的宽
    var availHeight = window.screen.availHeight;//屏幕可用工作区高度
    var availWidth = window.screen.availWidth;//屏幕可用工作区宽度
    var factory = [
        clientWidth,
        clientHeight,
        offsetWidth,
        offsetHeight,
        scrollWidth,
        scrollHeight,
        screenH,
        screenW,
        availHeight,
        availWidth
    ];
    return{
        factory :function(){
            return factory;
        }
    }
});

//封装重载滚动条
var scrollResize = angular.module('scrollResize',['ionic']);
scrollResize.factory('scroll',function($timeout,$ionicScrollDelegate){
    return{
        resize :function(){
            $timeout(function(){
                $ionicScrollDelegate.$getByHandle('communityScroll').resize();
                $ionicScrollDelegate.$getByHandle('mainScroll').resize(); //重载滚动条
                $ionicScrollDelegate.$getByHandle('newsScroll').resize();  //重载滚动条
            },500);
        }
    }
});

//ajax请求
var comments;
var sever = angular.module('sever',['arrayBox','httpSever','cookie','angular-cache']);
sever.service('promise',function(http,arrayBox,cookie,CacheFactory){
    this.getColumns = function(cid){
        return http.sever('GET','/v1/columns',cid);  //栏目模块
    };
    this.getArticles = function(id,msg,access_token){
        if(access_token && id){
            return http.sever('GET','/v1/articles',id,access_token);  //文章列表
        }
        else if(typeof msg == 'undefined' || msg == ''){
            return http.sever('GET','/v1/articles',id);  //文章列表
        }
        else if(access_token && id == ''){
            if(cookie.getCookie('OperType') && cookie.getCookie('OperType') != ''){
                return http.sever('GET','/v1/articles/' + msg + '?type=' + cookie.getCookie('OperType'),{'': Math.random()},access_token);  //文章详情登录的
            }
            else{
                return http.sever('GET','/v1/articles/' + msg,{'': Math.random()},access_token);  //文章详情登录的
            }
        }
        else {
            if(cookie.getCookie('OperType') && cookie.getCookie('OperType') != ''){
                return http.sever('GET','/v1/articles/' + msg + '?type=' + cookie.getCookie('OperType'),{'': Math.random()});  //文章详情未登录的
            }
            else{
                return http.sever('GET','/v1/articles/' + msg,{'': Math.random()});  //文章详情未登录的
            }
        }
    };
    this.postUsers = function(data){
        CacheFactory.clearAll();
        data.client_id = '0IiNj6B4hJui25Ih';
        data.client_secret = 'JhhvEXQmLRcLWzYpTODYGpJ7tWhanp3b';
        return http.sever('POST','/v1/users',data);  //注册
    };
    this.thirdPostUsers = function(data,url){
        CacheFactory.clearAll();
        data.client_id = '0IiNj6B4hJui25Ih';
        data.client_secret = 'JhhvEXQmLRcLWzYpTODYGpJ7tWhanp3b';
        return http.sever('POST','/v1/users' + url,data);
    };
    this.postUserRevise = function(data,access_token){
        CacheFactory.clearAll();
        return http.sever('POST','/v1/user',data,access_token);  //修改信息
    };
    this.accessToken = function(data){
        data.client_id = '0IiNj6B4hJui25Ih';
        data.client_secret = 'JhhvEXQmLRcLWzYpTODYGpJ7tWhanp3b';
        data.grant_type = 'password';
        delete data['password_confirmation'];
        CacheFactory.clearAll();
        return http.sever('POST','/v1/oauth/access-token',data);  //登录
    };
    this.thirdAccessToken = function(data,url){
        data.client_id = '0IiNj6B4hJui25Ih';
        data.client_secret = 'JhhvEXQmLRcLWzYpTODYGpJ7tWhanp3b';
        data.grant_type = 'password';
        delete data['password_confirmation'];
        return http.sever('POST','/v1/oauth/access-token'+ url,data);  //第三方登录
    };
    this.getUsers = function(access_token){
        CacheFactory.clearAll();
        return http.sever('GET','/v1/user','',access_token);  //获取用户信息
    };
    this.getUserComments = function(access_token){
        CacheFactory.clearAll();
        return http.sever('GET','/v1/user/comments','',access_token);  //获取用户评论
    };
    this.getUserStars = function(access_token){
        CacheFactory.clearAll();
        return http.sever('GET','/v1/user/stars','',access_token);  //获取用户收藏
    };
    this.getUserInformations = function(access_token){
        CacheFactory.clearAll();
        return http.sever('GET','/v1/user/informations','',access_token);  //获取用户消息
    };
    this.invalidateToken = function(access_token){
        CacheFactory.clearAll();
        return http.sever('DELETE','/v1/oauth/invalidate-token','',access_token);  //退出登录
    };
    this.putUserColumns = function(data,access_token){
        var dataMain = '';
        var ajaxData = arrayBox.shortToBig(arrayBox.delSame(data));
        for(var i = 0;i < ajaxData.length;i++){
            dataMain = dataMain + ajaxData[i] + ',';
        }
        dataMain = {
            'ids' : dataMain
        };
        return http.sever('PUT','/v1/user/columns',dataMain,access_token);  //用户添加栏目
    };
    this.getSearch = function(q){
        return http.sever('GET','/v1/search/articles',q);  //文章搜索
    };
    this.getType = function(data){
        return http.sever('GET','/v1/tags',data,cookie.getCookie('access_token'));  //标签列表
    };
    this.getTypeComments = function(id){
        var data = '';
        var ajaxData = arrayBox.shortToBig(arrayBox.delSame(id));
        comments = ajaxData;
        for(var i = 0;i < ajaxData.length;i++){
            data = data + ajaxData[i] + ',';
        }
        return http.sever('GET','/v1/article_comments/' + data,{},cookie.getCookie('access_token'));  //标签评论信息
    };
    this.putFavours = function(act,id,comment_id,access_token,flag){
        return http.sever(act,'/v1/articles/' + id + '/comments/' + comment_id + '/favours?flag=' + cookie.getCookie('flag'),{flag: cookie.getCookie('flag')},access_token);  //文章评论点赞
    };
    this.getArticlesComments = function(id){
        return http.sever('GET','/v1/articles/' + id + '/comments?type=' + cookie.getCookie('OperType'),{},cookie.getCookie('access_token'));  //文章评论列表
    };
    this.postArticlesComments = function(id,data,access_token) {
        data.type = cookie.getCookie('OperType');
        //评论文章
        if(access_token){
            CacheFactory.clearAll();
            return http.sever('POST','/v1/articles/' + id + '/comments',data,access_token);
        }
        else{
            CacheFactory.clearAll();
            return http.sever('POST','/v1/articles/' + id + '/comments',data);
        }
    };
    this.postArticlesReplies = function(comment_id,data,access_token){
        if(access_token){
            //评论的回复，登录后的
            CacheFactory.clearAll();
            data.flag = cookie.getCookie('flags');
            return http.sever('POST','/v1/articles/' + cookie.getCookie('newsId') + '/comments/'+ comment_id +'/replies',data,access_token);
        }
        else{
            //评论的回复，匿名的
            CacheFactory.clearAll();
            data.flag = cookie.getCookie('flags');
            return http.sever('POST','/v1/articles/' + cookie.getCookie('newsId') + '/comments/'+ comment_id +'/anonymous_replies',data);
        }
    };
    this.putArticlesStars = function(id,access_token){
        if(cookie.getCookie('OperType') && cookie.getCookie('OperType') != ''){
            return http.sever('PUT','/v1/articles/' + id + '/stars?type=' + cookie.getCookie('OperType'),'',access_token);  //文章收藏
        }
        else{
            return http.sever('PUT','/v1/articles/' + id + '/stars','',access_token);  //文章收藏
        }
    };
    this.deleteArticlesStars = function(id,access_token){
        if(cookie.getCookie('OperType') && cookie.getCookie('OperType') != ''){
            return http.sever('DELETE','/v1/articles/' + id + '/stars?type=' + cookie.getCookie('OperType'),'',access_token);  //文章取消收藏
        }
        else{
            return http.sever('DELETE','/v1/articles/' + id + '/stars','',access_token);  //文章取消收藏
        }
    
    };
    this.generateToken = function(){
        CacheFactory.clearAll();
        return http.sever('GET','/generate_token');  //验证码图片
    };
    //第三方登录链接
    this.thirdPartyLogin = function(name){
        if(name == 'weiBo'){
            return http.sever('GET','/generate_url');
        }
        else if(name == 'weiXin'){
            return http.sever('GET','/weixin_login');
        }
    };
    //第三方获得token
    this.getThirdToken = function(data){
        return http.sever('GET','/entry?token=' + data);
    };
    //修改头像
    this.postImgCrop = function(data){
        return http.sever('POST','/v1/user',{'avatar_url': data},cookie.getCookie('access_token'));  //文章评论点赞
    };
});


//封装cookie
var cookie = angular.module('cookie',[]);
cookie.factory('cookie',function(){
    function getCookie(name)
    {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return null;
    }
    function delCookie(name)
    {
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval=getCookie(name);
        if(cval!=null)
            document.cookie= name + "="+cval+";expires="+exp.toGMTString();
    }
    function setCookie(name,value,time)
    {
        var strsec = getsec(time);
        var exp = new Date();
        exp.setTime(exp.getTime() + strsec*1);
        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString();
    }
    function getsec(str)
    {
        if(typeof str != 'undefined'){
            var str1=str.substring(1,str.length)*1;
            var str2=str.substring(0,1);
            if (str2=="s")
            {
                return str1*1000;
            }
            else if (str2=="h")
            {
                return str1*60*60*1000;
            }
            else if (str2=="d")
            {
                return str1*24*60*60*1000;
            }
        }
    }
    return{
        //写入cookie
        setCookie :function(name,value,time){
            setCookie(name,value,time);
        },
        //删除cookie
        delCookie: function(name){
            delCookie(name);
        },
        //读取cookie
        getCookie: function(name){
            return getCookie(name);
        }
    }
});
var sql = false;
//封装NoSQL非关系型的数据库(不兼容NoSQL将会转换为webSQL关系型数据库)
var NoSQL = angular.module('NoSQL',[]);
NoSQL.factory('NoSQL',function(){
    var indexedDB;
    //初始化定义
    if(window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB){
        sql = true;
        indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    }
    var browser={
        versions:function(){
            var u = navigator.userAgent, app = navigator.appVersion;
            return {
                mobile: !!u.match(/AppleWebKit.*Mobile.*/)||!!u.match(/AppleWebKit/), //是否为移动终端
                iPhone: u.indexOf('iPhone') > -1 || u.indexOf('Mac') > -1 //是否为iPhone或者QQHD浏览器
            };
        }()
    };
    var re = /QQ/;//匹配qq浏览器
    if(sql && browser.versions.mobile && re.test(navigator.userAgent)){
        sql = false;//qq浏览器关闭indexedDB
    }
    if(sql){
        //初始化事务
        //初始化键
        var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
        var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
        //新建/打开数据库
        //返回数据库实例
        //eg：openSQL("MyTestDatabase",'1.0')
        var openSQL = function(name,requestVersion){
            var request;
            if(requestVersion){
                request = indexedDB.open(name,requestVersion);
            }
            else{
                request = indexedDB.open(name,1);
            }
            request.onsuccess=function(e){
                return e.target.result;
            };
            request.onerror=function(e){
                sql = false;
                //alert('新建本地数据库失败!');
                console.log(e.target.errorCode);
            };
            return request;
        };
        //新建数据库存储空间
        var createObjectStore = function(dataBase,name,key,autoIncrement){
            dataBase.onupgradeneeded = function(e){
                var db = e.target.result;
                if(autoIncrement){
                    return db.createObjectStore(name,{keyPath:key, autoIncrement: autoIncrement});
                }
                else{
                    return db.createObjectStore(name,{keyPath:key});
                }
            };
        };
        //关闭数据库
        var closeBase = function(dataBase){
            dataBase.close();
        };
        //删除一个数据库
        var deleteBase = function(name){
            indexedDB.deleteDatabase(name);
        };
        //清空一个数据库
        var clearBase = function(name){
            indexedDB.clear(name);
        };
        //插入数据
        var insert = function(dataBase,data,storeName,IDBTransactionData){
            var IDB;
            if(IDBTransactionData == 0){
                IDB = 'readonly';
            }
            else if(IDBTransactionData == 1){
                IDB = 'readwrite';
            }
            else if(IDBTransactionData == 2){
                IDB = 'versionchange';
            }
            var transaction = dataBase.transaction(storeName,IDB);
            var store = transaction.objectStore(storeName);
            for(var i = 0;i < data.length;i++){
                store.add(data[i]);
            }
        };
        //更新数据库原有数据
        var newData = function(dataBase,data,storeName,IDBTransactionData){
            var IDB;
            if(IDBTransactionData == 0){
                IDB = 'readonly';
            }
            else if(IDBTransactionData == 1){
                IDB = 'readwrite';
            }
            else if(IDBTransactionData == 2){
                IDB = 'versionchange';
            }
            var transaction = dataBase.transaction(storeName,IDB);
            var store = transaction.objectStore(storeName);
            for(var i = 0;i < data.length;i++){
                store.put(data[i]);
            }
        };
        //游标查询
        var findBase = function(dataBase,searchData,name,IDBTransactionData){
            var IDB;
            if(IDBTransactionData == 0){
                IDB = 'readonly';
            }
            else if(IDBTransactionData == 1){
                IDB = 'readwrite';
            }
            else if(IDBTransactionData == 2){
                IDB = 'versionchange';
            }
            var transaction = dataBase.transaction(name,IDB);
            var store = transaction.objectStore(name);
            var keyRange = IDBKeyRange.only(searchData);
            return store.openCursor(keyRange);
        };
        //游标查询更新数据
        var findBaseUpdate = function(dataBase,searchData,name){
            var fun = function(cursor){
                cursor.value.selected = !cursor.value.selected;
                cursor.update(cursor.value);
            };
            var data = findBase(dataBase,searchData,name,1);
            data.onsuccess = function(event){
                var cursor = event.target.result;
                fun(cursor);
            }
        };
        //游标查询删除数据
        var findBaseDelete = function(dataBase,searchData,name){
            var data = findBase(dataBase,searchData,name,1);
            data.onsuccess = function(event){
                var cursor = event.target.result;
                return cursor.delete();
            }
        };
    }
    else{
        //使用例子
        //dataBase = NoSQL.openSQL(SQLName,1.0, '兼容模式', 2 * 1024);
        //NoSQL.createObjectStore(dataBase,'table','id','myDATA');
        //NoSQL.insert(dataBase,'t1',1,'ionic1');
        //NoSQL.insert(dataBase,'t1',2,'ionic1');
        //NoSQL.findBase(dataBase,'t1',function(e){
        //    console.log(e)
        //});
        //NoSQL.findBaseUpdate(dataBase,'t1',1,[234576]);
        //新建或者打开数据库
        var openSQL = function(name,edition,description,size,callback){
            return openDatabase(name, edition, description, size,callback);
        };
        //新建数据库存储空间
        var createObjectStore = function(dataBase,name,id,log){
            dataBase.transaction(function (tx) {
                var table = 'CREATE TABLE IF NOT EXISTS '+ name +' ('+ id +' unique, '+ log +')';
                var tableData = table.toString();
                tx.executeSql(tableData);
            });
        };
        //插入操作
        var insert = function(dataBase,name,id,logData){
            logData = "'" + JSON.stringify(logData) + "'";
            dataBase.transaction(function (tx) {
                var t1 = 'CREATE TABLE IF NOT EXISTS '+ name +' (id unique,log)';
                var t1Data = t1.toString();
                var t2 = 'INSERT INTO '+ name +' (id, log) VALUES ('+ id +', '+ logData +')';
                var t2Data = t2.toString();
                tx.executeSql(t1Data);
                tx.executeSql(t2Data);
            });
        };
        //编辑数据库改
        var findBaseUpdate = function(dataBase,name,cid){
            //以下代码为项目代码和框架无关
            findBase(dataBase,name,function(callBackData){
                for(var i = 0;i < callBackData[1].length;i++){
                    if(callBackData[1][i].cid == cid){
                        callBackData[1][i].selected = !callBackData[1][i].selected;
                        var data = JSON.stringify(callBackData[1][i]);
                        dataBase.transaction(function (tx) {
                            tx.executeSql("UPDATE "+ name +" SET log=? WHERE id = " + cid, [data]);
                        });
                    }
                }
            });
        };
        //读取操作
        var findBase = function(dataBase,name,callBack,$timeout){
            dataBase.transaction(function (tx) {
                tx.executeSql('SELECT * FROM '+ name, [], function(tx, results){
                    var objBox = [];
                    for(var i = 0;i < results.rows.length;i++){
                        var num = eval( "(" + results.rows.item(i).log + ")" );
                        objBox.push(num);
                    }
                    var callBackData = [results,objBox];
                    callBack(callBackData);
                },function(){
                    $timeout(function(){
                        location.reload();
                    },2000)
                });
            });
        };
    }
    return{
        openSQL : function(name,requestVersion,description,size,callback){
            if(sql){
                //兼容indexedDB参数
                //name数据库名称
                //requestVersion数据库版本
                //返回dataBase数据库对象
                return openSQL(name,requestVersion);
            }
            else{
                //不兼容indexedDB参数
                //数据库名
                // 版本号
                // 描述
                // 数据库大小
                // 创建回调
                //返回dataBase数据库对象
                return openSQL(name,requestVersion,description,size,callback);
            }
        },
        createObjectStore: function(dataBase,name,key,autoIncrement){
            if(sql){
                //兼容indexedDB参数
                //NoSQL.openSQL('myData',1)数据库实例对象，
                //数据库存储空间名称，
                //存储空间的键
                //自动增长量
                return createObjectStore(dataBase,name,key,autoIncrement);
            }
            else{
                //不兼容indexedDB参数
                //NoSQL.openSQL('myData',1)数据库实例对象，
                //数据库存储空间名称
                //存储空间里唯一的标识
                return createObjectStore(dataBase,name,key,autoIncrement);
            }
        },
        //dataBase数据库对象
        closeBase: function(dataBase){
            return closeBase(dataBase);
        },
        //删除数据库可以是某个对象
        deleteBase: function(name){
            return deleteBase(name);
        },
        //清空数据库(检测无法使用)
        clearBase: function(name){
            return clearBase(name);
        },
        insert: function(dataBase,data,storeName,IDBTransactionData){
            if(sql){
                //兼容indexedDB参数
                //数据库对象，
                //存入数据库的数据，
                //需要插入或者修改对象的名称
                //储存方式: 0,代表只读 1,代表读写 2,代表改变
                insert(dataBase,data,storeName,IDBTransactionData);
            }
            else{
                //不兼容indexedDB参数
                //数据库对象，
                //存入数据库的数据，
                //需要插入或者修改对象的名称
                //储存方式: 0,代表只读 1,代表读写 2,代表改变
                insert(dataBase,data,storeName,IDBTransactionData);
            }
        },
        newData: function(dataBase,data,storeName,IDBTransactionData){
            return newData(dataBase,data,storeName,IDBTransactionData);
        },
        findBase: function(dataBase,searchData,name,IDBTransactionData){
            if(sql){
                //查询数据库对象
                //查询数据的键值
                //查询数据库存储空间名称
                //储存方式: 0,代表只读 1,代表读写 2,代表改变
                return findBase(dataBase,searchData,name,IDBTransactionData);
            }
            else{
                //查询数据库对象
                //查询数据库存储空间名称
                //异步执行的函数函数参数为查询的结果，得到的参数为一个长度为2的数组，一个是数据库查询结果，另外一个是返回的json对象
                return findBase(dataBase,searchData,name,IDBTransactionData);
            }
        },
        findBaseUpdate: function(dataBase,searchData,name,data){
            if(sql){
                //兼容indexedDB参数
                //查询数据库对象
                //查询数据修改数据库的键值
                //查询数据库存储空间名称
                return findBaseUpdate(dataBase,searchData,name);
            }
            else{
                //不兼容indexedDB参数
                //查询的数据库对象
                //数据库表格名称
                //查询的id号
                //查询需要变更的值，这里需要一个数组
                return findBaseUpdate(dataBase,searchData,name,data);
            }
        },
        //查询数据库对象
        //查询删除数据库的键值
        //查询数据库存储空间名称
        findBaseDelete: function(dataBase,searchData,name){
            return findBaseDelete(dataBase,searchData,name);
        }
    }
});