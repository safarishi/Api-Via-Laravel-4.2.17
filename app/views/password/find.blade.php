<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <link rel="shortcut icon" href="images/favicon.ico"/>
    <title>全心全意</title>
    <meta name="renderer" content="webkit">
    <link rel="stylesheet" href="/css/style.css">
    <script src="/bower_components/avalon/min/avalon.min.js"></script>
    <script src="/bower_components/jquery/dist/jquery.min.js"></script>
</head>
<body class="page-bg">
    <table class="page-table">
        <tr>
            <td>
                <form action="{{URL::to('password/find')}}" method="post" class="box-form aligned-form page-form pass-form" ms-controller="form">
                    <div class="page-form-hd">
                        <h1>找回密码</h1>
                    </div>
                    <div class="page-form-bd">
                        <p class="message">请填入您的注册邮箱进行密码找回</p>
                        <p class="message" style="color:#ae0a0a">
                            <?php echo $errors->first('captcha'); ?>
                            <?php echo $errors->first('email'); ?>
                        </p>
                        <div class="form-group">
                            <span class="icons-sprite icons-account"></span>
                            <input name="email" type="text" placeholder="请输入注册邮箱">
                        </div>
                        <div class="form-group">
                            <span class="icons-sprite icons-password"></span>
                            <input autocomplete="off" name="captcha" type="text" placeholder="请输入验证码">
                        </div>
                        <div class="form-group box-form-tools">
                            <div>
                                <?php echo HTML::image(Captcha::img(), '验证码', array('id'=>'captcha')); ?>
                            </div>
                            <a href="#" ms-click="changeCaptcha">看不清，换一张！</a>
                        </div>
                        <div class="form-group box-form-buttons">
                            <button type="submit">提交</button>
                            <a href="/">返回网站</a>
                        </div>
                    </div>
                </form>
            </td>
        </tr>
    </table>
    <script>
        var vm = avalon.define({
            $id: 'form',
            changeCaptcha: function() {
                $('#captcha').attr('src', '/captcha?' + $.now())
            }
        })
    </script>
</body>
</html>