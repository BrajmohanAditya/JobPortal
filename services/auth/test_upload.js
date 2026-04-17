import FormData from 'form-data';
import fs from 'fs';
import http from 'http';

const form = new FormData();
form.append('name', 'test');
form.append('email', 'test1@test.com');
form.append('password', 'password');
form.append('phoneNumber', '123');
form.append('role', 'jobseeker');
form.append('bio', 'test bio');
form.append('file', fs.createReadStream('./package.json'));

const request = http.request({
  method: 'post',
  host: '127.0.0.1',
  port: 5000,
  path: '/api/auth/register',
  headers: form.getHeaders()
});

form.pipe(request);

request.on('response', function(res) {
  let str = '';
  res.on('data', chunk => str += chunk);
  res.on('end', () => console.log('STATUS:', res.statusCode, 'BODY:', str));
});
