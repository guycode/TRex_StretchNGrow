<?php
require_once 'phpmailer/PHPMailerAutoload.php';

$recaptchaBase = 'ReCaptcha';
require_once $recaptchaBase . '/ReCaptcha.php';
require_once $recaptchaBase . '/RequestMethod.php';
require_once $recaptchaBase . '/RequestParameters.php';
require_once $recaptchaBase . '/Response.php';
require_once $recaptchaBase . '/RequestMethod/Post.php';
require_once $recaptchaBase . '/RequestMethod/Socket.php';
require_once $recaptchaBase . '/RequestMethod/SocketPost.php';
$lang = 'en';

// Register API keys at https://www.google.com/recaptcha/admin
$siteKey = '6LdUfiATAAAAAKS3xuheaMRKBcoABnM79ETKnClw';
$secret = '6LdUfiATAAAAAMmXTigUtqahIOyw8ZhAuKAruWfN';
$to = 'sngoftherockies@gmail.com'; //sngoftherockies@gmail.com
$subject = 'New Message from Stretch N Grow Website';
$from = 'sngoftherockies@gmail.com';

session_cache_limiter('nocache');
header('Expires: ' . gmdate('r', 0));
header('Content-type: application/json');

$error = false;
$valid = false;
$result = null;

if (strlen($siteKey) > 0) // if the sitekey is populated use google captcha
{
  if (isset($_POST['g-recaptcha-response'])){

      // If file_get_contents() is locked down on your PHP installation to disallow
      // its use with URLs, then you can use the alternative request method instead.
      // This makes use of fsockopen() instead.
      $recaptcha = new \ReCaptcha\ReCaptcha($secret, new \ReCaptcha\RequestMethod\SocketPost());

      // Make the call to verify the response and also pass the user's IP address
      $resp = $recaptcha->verify($_POST['g-recaptcha-response'], $_SERVER['REMOTE_ADDR']);

      if ($resp->isSuccess()){
          // If the response is a success, that's it!
          $valid = true;
      } else {
          // If it's not successfull, then one or more error codes will be returned.
      	$result = 'reCaptcha Error';
        $error = true;
      }
  } else {
       // Add the g-recaptcha tag to the form you want to include the reCAPTCHA element
   	    $result = 'please provide reCaptcha element in form.';
  	    $error = true;
  }
}
else{
  $valid = true;
}

if ($valid)
{
  if(strlen($to) > 0) { //if the to address is populated

    $message = "";

    foreach($_POST as $key => $value)
    {
        if (!strstr($key, 'g-recaptcha-response'))
        {

                $message .= $key.": " . htmlspecialchars($value, ENT_QUOTES) . "<br>\n";
        }
    }

    $mail = new PHPMailer;
    $mail->isSMTP();                                      // Set mailer to use SMTP
    $mail->Host = 'ml01.anaxanet.com';                    // Specify main and backup SMTP servers
    $mail->SMTPAuth = false;                              // Enable SMTP authentication

    $mail->setFrom($from, 'SNG of Colorado Mailer');
    $mail->addAddress($to);

    $mail->isHTML(false);                                 // Set email format to HTML

    $mail->Subject = $subject;
    $mail->Body    = $message;
    $mail->AltBody = $message;

    if($mail->send()) {
        $result = 'success';
    } else {
        $result = 'Failed to Send Mail - Check Server Logs';
        $error = true;
    }


  } else {
    $result ='No To: address specified';
    $error = true;
  }
}

if ($error)
{
    header('HTTP/1.1 400 Bad Request');
    header('Content-Type: application/json; charset=UTF-8');

}
if ($result != null)
{

      echo json_encode($result);
}

?>