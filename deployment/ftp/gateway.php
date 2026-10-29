<?php
// Fixed-destination transport for the approved Sites multiplayer backend.
// This is not an open proxy; no destination is accepted from the visitor.
declare(strict_types=1);
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function fail_request(int $status, string $message): void {
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($method, ['GET', 'POST'], true)) {
    header('Allow: GET, POST');
    fail_request(405, 'Method not allowed.');
}
$path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
if (!preg_match('~^/arcanarchy/texas-fool-em/api/(game|talk)\.php$~D', (string)$path, $matches)) {
    fail_request(404, 'Endpoint not found.');
}
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? '';
// Validate the browser's origin before translating it for the upstream server.
if ($origin !== '' && $origin !== $scheme . '://' . $host) {
    fail_request(403, 'Invalid origin.');
}
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 65536) {
    fail_request(413, 'Request too large.');
}
if (!function_exists('curl_init')) {
    fail_request(503, 'The host must enable the PHP cURL extension.');
}
$upstream = 'https://arcanarchy-texas-fool-em.sirmycho.chatgpt.site';
$query = $_SERVER['QUERY_STRING'] ?? '';
$url = $upstream . '/api/' . $matches[1] . ($query !== '' ? '?' . $query : '');
$authorization = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
if ($authorization === '' && function_exists('getallheaders')) {
    foreach (getallheaders() as $name => $value) {
        if (strtolower($name) === 'authorization') $authorization = $value;
    }
}
$headers = ['Accept: application/json', 'Origin: ' . $upstream];
if ($authorization !== '') $headers[] = 'Authorization: ' . $authorization;
if ($method === 'POST') $headers[] = 'Content-Type: application/json';
$handle = curl_init($url);
curl_setopt_array($handle, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => $method,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT => 25,
    CURLOPT_FOLLOWLOCATION => false,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_SSL_VERIFYHOST => 2,
]);
if ($method === 'POST') {
    $body = file_get_contents('php://input', false, null, 0, 65537);
    if ($body === false || strlen($body) > 65536) fail_request(413, 'Request too large.');
    curl_setopt($handle, CURLOPT_POSTFIELDS, $body);
}
$body = curl_exec($handle);
$status = (int)curl_getinfo($handle, CURLINFO_HTTP_CODE);
unset($handle);
if ($body === false || $status < 100) fail_request(502, 'The table connection is temporarily unavailable. Please retry.');
json_decode($body);
if (json_last_error() !== JSON_ERROR_NONE) fail_request(502, 'The table service returned an unexpected response.');
http_response_code($status);
echo $body;
