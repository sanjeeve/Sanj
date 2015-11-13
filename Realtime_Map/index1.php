<?php
$config = require_once('configs/config.php');

error_reporting(1);
ini_set('set_memory_limit',-1);
$filenameArray = [];

$readFiles      =   $_POST['files'];
$decodedFiles   =   json_decode($readFiles);
$doneFiles      =   [];

if( count($decodedFiles) > 0){
    foreach($decodedFiles as $key=>$val){
        $doneFiles[]    =   $val;
    }
}

$dir = $config['folder_path'];

if (is_dir($dir)) {
    if ($files = scandir($dir, SCANDIR_SORT_NONE)) {
        foreach($files as $file)
        {
            if($file !== '.' && $file !== '..'){
                $fileName = "/$file";
                
                if(!in_array($fileName, $doneFiles)) {
                    array_push($filenameArray, $fileName );
                } else {
                    //echo 'Found';
                }
            }
        }
        //closedir($dh);
    }
}


$arrJSON = array();
$arrJSON["files"]   =   $filenameArray;
echo json_encode($arrJSON);


?>
