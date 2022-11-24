<?php
require_once 'users/init.php';
require_once $abs_us_root.$us_url_root.'users/includes/template/prep.php';
if(isset($user) && $user->isLoggedIn()){
}
?>

<?php
if($user->isLoggedIn()){?>
	<div class="card">
	<div class="card-header">
		<i class="fa fa-fw fa-mixcloud"></i> IOT Platform
	</div>
	<div class="card-body">
		<h5 class="card-title">Device Manager</h5>
		<p class="card-text">Devices and apps</p>
		<a href="mgr/" class="btn btn-primary">Open &raquo;</a>
	</div>
	</div>
<?php }else{?>
	<div class="card">
	<div class="card-header">
		Welcome
	</div>
	<div class="card-body">
		<a href="users/login.php" class="btn btn-primary">Login &raquo;</a>
	</div>
	</div>
<?php }?>

<!-- Place any per-page javascript here -->
<?php require_once $abs_us_root . $us_url_root . 'users/includes/html_footer.php'; ?>
