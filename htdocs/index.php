<?php
require_once 'users/init.php';
require_once $abs_us_root.$us_url_root.'users/includes/template/prep.php';
if(isset($user) && $user->isLoggedIn()){
}
?>

<div class="jumbotron">
	<p align="center">
		<?php
		if($user->isLoggedIn()){?>
			<a class="btn btn-primary" href="mgr/" role="button">Device Manager &raquo;</a>
		<?php }else{?>
			<a class="btn btn-warning" href="users/login.php" role="button"><?=lang("SIGNIN_TEXT");?> &raquo;</a>
			<a class="btn btn-info" href="users/join.php" role="button"><?=lang("SIGNUP_TEXT");?> &raquo;</a>
		<?php }?>
	</p>
</div>

<!-- Place any per-page javascript here -->
<?php require_once $abs_us_root . $us_url_root . 'users/includes/html_footer.php'; ?>
