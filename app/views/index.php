<!DOCTYPE html>
<html ng-app="indexApp" id="rootOfApp">
<head>
    <meta lang="zh-cn">
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="shortcut icon" href="/web/mycompass/images/logoIco.ico" type="image/x-icon" />
    <meta name="keywords" content="海运信息网,海运首页,海运网,海运信息,国际航运,港口发展,国内航运,航运,CSI">
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="format-detection" content="telephone=no">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0,maximum-scale=1.0,user-scalable=no" id="viewport">
    <link rel="stylesheet" type="text/css" href="/web/mycompass/stylesheets/ng-animation.css">
    <link rel="stylesheet" type="text/css" href="/web/mycompass/stylesheets/style.css">
    <link rel="stylesheet" type="text/css" href="http://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css">
    <title>{{title}}</title>
</head>

<!--主控制器-->
<body class="index-body" ng-controller="mainController">

<!--路由动画-->
<ion-nav-view name="main" animation="slide-left-right-ios7"></ion-nav-view>

<!--start script-->
<!--
    ionic v1.0.1 + ng-animate v1.4.3 + ng-messages v1.4.5 +
    angular-file-upload v1.1.11 + angular-file-upload-shim v1.1.11 +
    angular-cache v4.3.2 + lodash v3.10.1 + restangular
-->
<script src="/web/js/lib/framework.min.js"></script>
<!--end framework-->
<script src="/web/js/service.js"></script>
<script src="/web/js/mainController.js"></script>
<script src="/web/js/directive.js"></script>
<script src="/web/js/router.js"></script>
<!--end script-->
</body>
</html>