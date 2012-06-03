<?php

$path = "/Users/tsnoad/Sites/backgrounder/";

file_put_contents($path."log", "doop: ".print_r($_POST, 1)."\n", FILE_APPEND);

$filepath = $path."files/";
$file_id = md5(time().rand(0, 999));

$patternsize = $_POST['patternsize'];
$patternpixels = $_POST['pattern'];

$hue = $_POST['hue'] / 360 * 100;
$saturation = 100 - $_POST['saturation'];
$lightness = $_POST['lightness'];

$highlight = $lightness + $_POST['highlight'];
$noise = $_POST['noise'];

if (!preg_match("/^[3-7]$/", $patternsize)) {
	die();
}
if (count($patternpixels) !== 49) {
	die();
}
/*
if (!preg_match("/^[0-360]$/", $hue)) {
	die();
}
*/

$patternrows = array_chunk($patternpixels, 7);

$patternrows = array_slice($patternrows, 0, $patternsize);
$patternrows = array_map(create_function('$a', 'return array_slice($a, 0, '.$patternsize.');'), $patternrows);

foreach ($patternrows as $y => $patternrow) {
	foreach ($patternrow as $x => $pixel) {
		if ($pixel != "true") continue;

/* 		file_put_contents($path."log", "point {$x},{$y}\n", FILE_APPEND); */
		$drawpattern[] = "point {$x},{$y}";
	}
}

$createpattern = "convert -size {$patternsize}x{$patternsize} xc:'hsl({$hue}, {$saturation}%, {$lightness}%)' -fill 'hsl({$hue}, {$saturation}%, {$highlight}%)' -draw '".implode(" ", $drawpattern)."' {$filepath}/{$file_id}_pattern.png";

shell_exec($createpattern);
file_put_contents($path."log", $createpattern."\n", FILE_APPEND);

$size = $patternsize * 40;

$repeatpattern = "convert -size {$size}x{$size} xc:none -tile {$filepath}/{$file_id}_pattern.png -draw 'rectangle 0,0 {$size},{$size}' {$filepath}/{$file_id}_repeated.png";

shell_exec($repeatpattern);
file_put_contents($path."log", $repeatpattern."\n", FILE_APPEND);

$createnoise = "convert -size {$size}x{$size} xc: +noise Random -modulate 100,0 -brightness-contrast 0x25 {$filepath}/{$file_id}_noise.png";

shell_exec($createnoise);
file_put_contents($path."log", $createnoise."\n", FILE_APPEND);

$addnoise = "composite {$filepath}/{$file_id}_noise.png {$filepath}/{$file_id}_repeated.png -compose linear-burn -dissolve {$noise} {$filepath}/{$file_id}_final.png";

shell_exec($addnoise);
file_put_contents($path."log", $addnoise."\n", FILE_APPEND);

echo json_encode(array("hash" => $file_id, "file" => "{$file_id}_final.png"));

?>