(function () {
  var response = http.post(REQUEST_URL, {
    headers: { 'Content-Type': 'application/json' },
    body: REQUEST_JSON,
  });
  if (!response.ok) throw new Error('Native fixture action failed: ' + response.status + ' ' + response.body);
})();
