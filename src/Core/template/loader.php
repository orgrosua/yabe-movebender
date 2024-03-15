<?php

// require the original file
$file_path = \Breakdance\ActionsFilters\getAdminTemplate();

ob_start();

if ($file_path) {
    require_once $file_path;
}

// get the output
$output = ob_get_clean();

// split the output into head and body, so we can inject the:
// - after <head>
// - before </head>
// - after <body>
// - before </body>
// parts

$head_start = strpos($output, '<head>');
$head_end = strpos($output, '</head>');
$body_start = strpos($output, '<body>');
$body_end = strpos($output, '</body>');

// print the head start
echo substr($output, 0, $head_start + 6);

do_action('a!yabe/movebender/core/template/loader:head.start');

// print the head content
echo substr($output, $head_start + 6, $head_end - $head_start - 6);

do_action('a!yabe/movebender/core/template/loader:head.end');

// print the body start
echo substr($output, $head_end, $body_start + 6);

do_action('a!yabe/movebender/core/template/loader:body.start');

// print the body content
echo substr($output, $body_start + 6, $body_end - $body_start - 6);

do_action('a!yabe/movebender/core/template/loader:body.end');

// print the body end
echo substr($output, $body_end);
