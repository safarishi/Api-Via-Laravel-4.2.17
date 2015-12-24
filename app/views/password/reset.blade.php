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
                <form action="{{URL::to('password/reset')}}" method="post" class="box-form aligned-form page-form pass-form" ms-controller="form">
                    <div class="page-form-hd">
                        <h1>重置密码</h1>
                    </div>
                    <div class="page-form-bd">
                        <p class="message">请重新设置您的密码</p>
                        <p class="message" style="color:#ae0a0a">
                            <?php echo $errors->first(); ?>
                        </p>
                        <div class="form-group">
                            <span class="icons-sprite icons-password"></span>
                            <input name="new_pwd" type="password" placeholder="设置您的新密码">
                        </div>
                        <div class="form-group">
                            <span class="icons-sprite icons-password"></span>
                            <input name="new_pwd_confirmation" type="password" placeholder="请确认您的密码">
                        </div>
                        <div class="form-group box-form-buttons">
                            <input type="hidden" name="confirmed" value="{{Input::get('confirmed')}}">
                            <button type="submit">提交</button>
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