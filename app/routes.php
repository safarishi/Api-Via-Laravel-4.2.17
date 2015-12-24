<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

Route::get('/', function()
{
    exit('backend');
    // return View::make('hello');
});

Route::patterns([
    'id'         => '[1-9][0-9]*',
    'comment_id' => '[1-9][0-9]*',
    'type'       => 'weibo|qq|weixin',
]);

Route::group(array('prefix' => 'v1'), function()
{
    // 推荐或栏目下的文章列表
    Route::get('articles', 'ArticleController@index');
    // 栏目列表
    Route::get('columns', 'ArticleController@column');
    // 用户添加栏目
    Route::put('user/columns', 'UserController@addColumn');
    // 文章详情
    Route::get('articles/{id}', 'ArticleController@show');
    // 文章收藏
    Route::put('articles/{id}/stars', 'ArticleController@star');
    // 注册用户
    Route::post('users', 'UserController@store');
    // 用户登录
    Route::post('oauth/access-token', 'OAuthController@postAccessToken');
    // 用户退出登录
    Route::delete('oauth/invalidate-token', 'UserController@logout');
    // 文章取消收藏
    Route::delete('articles/{id}/stars', 'ArticleController@unstar');
    // 文章评论（包含匿名用户评论）
    Route::post('articles/{id}/comments', 'ArticleController@comment');
    // 文章评论列表
    Route::get('articles/{id}/comments', 'ArticleController@commentList');
    // 文章评论点赞
    Route::put('articles/{id}/comments/{comment_id}/favours', 'CommentController@favour');
    // 文章评论取消点赞
    Route::delete('articles/{id}/comments/{comment_id}/favours', 'CommentController@unfavour');
    // 文章评论回复
    Route::post('articles/{id}/comments/{comment_id}/replies', 'CommentController@reply');
    // 匿名用户回复文章评论
    Route::post('articles/{id}/comments/{comment_id}/anonymous_replies', 'CommentController@anonymousReply');
    // 标签列表
    Route::get('tags', 'CommunityController@index');
    // 社区评论
    Route::get('article_comments/{tags}', 'CommunityController@getArticleCommentsByTags')
        ->where('tags', '([1-9][0-9]*,)+');
    // 获取当前用户的信息
    Route::get('user', 'UserController@show');
    // 修改用户个人信息
    Route::post('user', 'UserController@modify');
    // 我的评论
    Route::get('user/comments', 'UserController@myComment');
    // 我的收藏
    Route::get('user/stars', 'UserController@myStar');
    // 我的消息
    Route::get('user/informations', 'UserController@myInformation');
    // 搜索文章
    Route::get('search/articles', 'ArticleController@search');
    // third party login callback
    Route::get('callbacks/{type}', 'ThirdPartyLoginController@callback');
});

// token + captcha
Route::get('generate_token', 'MultiplexController@generateToken');
Route::get('generate_captcha', 'MultiplexController@generateCaptcha');

// generate weibo url
Route::get('generate_url', 'ThirdPartyLoginController@generateWeiboUrl');
Route::get('qq_login', 'ThirdPartyLoginController@generateQqUrl');
Route::get('weixin_login', 'ThirdPartyLoginController@generateWeixinUrl');
// 获取用户登录口令
Route::get('entry', 'ThirdPartyLoginController@entry');
