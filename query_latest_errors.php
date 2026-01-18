<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

$errors = DB::table('error_reports')
    ->orderBy('created_at', 'desc')
    ->limit(5)
    ->get();

echo json_encode($errors, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
