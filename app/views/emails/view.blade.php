亲爱的<?php echo $name; ?>：
<br />
<br />
你的密码重设要求已经得到验证。请点击以下链接输入你新的密码：
<br />
<br />
(please click on the following link to reset your password:)
<br />
<br />
{{ URL::to('password/reset') }}?confirmed={{ $confirmed }}
<br />
<br />
如果以上链接不能点击，你可以复制网址url，然后粘贴到浏览器地址栏打开。
<br />
<br />
（本链接将在6小时后失效）
<br />
（这是一封自动发送的邮件，请不要直接回复）
<br />
<br />
全心全意
<br />
<?php echo date('Y-m-d', time()); ?>