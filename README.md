# Lightning_maxbet
Bài viết này mình sẽ hướng dẫn làm một game betting trên Lightning network 
![](https://images.viblo.asia/08428827-b519-475b-9edc-6138767e0003.png)

## Chuẩn bị :
Clone source code tại [đây](https://github.com/vinhyenvodoi98/Lightning_maxbet)

* Polar (app để tạo môi trường test Hướng dẫn cài đặt tại [đây](https://viblo.asia/p/bitcoin-polar-1-not-nhac-setup-xong-lightning-network-Az45ba7QlxY))
* Joule ( ví Lightning hướng dẫn cài đặt tại [đây](https://lightningjoule.com/))
* Reactjs
* Nodejs

### Setup môi trường : 
Mình chọn sử dụng polar để khởi tạo môi trường chỉ với một vài click

Đầu tiên chúng ta sẽ tạo một network gồm có 1 bitcoind node và 3 LND node   
![](https://images.viblo.asia/910c2515-b3b7-4a96-bdae-7978fb6465b4.png)

sau đó tạo một channel giữa các node .
![](https://images.viblo.asia/17ed6e71-b8b5-4c75-a093-b66acfdf4b54.png)

Như vậy chúng ta đã tạm setup xong môi trường để test rồi đấy .

## Xây dựng app
### Mục tiêu
Đầu tiên chúng ta vẫn phải giải bài toán trồng cây gì nuôi con gì trước đã . Ở bài viết này mình sẽ hướng dẫn làm game betting đơn giản.
Luật chơi sẽ vô cùng đơn giản thôi đó là người chơi sẽ chọn khoảng giá trị ví dụ dự đoán số ngẫu nhiên tiếp theo **lớn hơn 50** mà kết quả ra là **78** thì coi như chúng ta tắng. Tuy nhiên sẽ có sự chênh lệch vè tỉ số chúng ta đoán ví dụ cũng giống như trường hợp trên chúng ta đoán **lớn hơn 75** thì sẽ lãi được nhiều tiền hơn so với chúng ta đoán là **lớn hơn 50** 

app gồm 2 phần Backend và Frontend. Phần Backend của game sẽ là một LND node chúng ta giả định là **Alice** node trên môi trường đã setup trên Polar . Trong vai trò người chơi chúng ta có thể chọn **Bob** hoặc **Carol**  ở đây mình chọn **Bob**

### Wallet
Sau khi download **joule** chúng ta chỉ cần điền 2 giá trị **admin.macaroon** và **readonly.macaroon** 
Chọn Local node
![](https://images.viblo.asia/bac3b023-a7c7-47bd-bac5-3f565d71b4e0.png)

Điền giá trị REST Host của node chúng ta chọn ở đây mình chọn Bob
![](https://images.viblo.asia/78f38639-b6d5-4ec5-bb85-cacedd8a4c1f.png)

Kéo thả 2 file **admin.macaroon** và **readonly.macaroon**  vào
![](https://images.viblo.asia/837a077d-6a85-44cd-8778-9824ffde23f9.png)

Như vậy là xong rồi
![](https://images.viblo.asia/000d01d1-b302-4b38-b068-8c1a1dbc6c98.png)

### Backend
Phần Backend mình sử dụng Nodejs 

Backend chúng ta sẽ sử dụng Alice node . đầu tiên chúng ta tạo một file **.env** 
```
LND_URL=127.0.0.1:10001
LND_MACAROON_PATH=/home/ubuntu/.polar/networks/2/volumes/lnd/alice/data/chain/bitcoin/regtest/admin.macaroon
LND_CERT_PATH=/home/ubuntu/.polar/networks/2/volumes/lnd/alice/tls.cert
```
chúng ta sẽ điền các thông số mà Polar cung cấp về Alice Node
* LND_URL : GRPC Host
* LND_MACAROON_PATH : Admin Macaroon FIle path
* LND_CERT_PATH : TLS Cert File path

Sau đó tạo một file RPC.js để chạy các lệnh giao tiếp với LND thông qua RPC
```js
require('dotenv').config();
var fs = require('fs');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('./rpc.proto', {
  keepCase: true
});
const lnrpc = grpc.loadPackageDefinition(packageDefinition).lnrpc;

process.env.GRPC_SSL_CIPHER_SUITES = 'HIGH+ECDSA';
var cert = fs.readFileSync(process.env.LND_CERT_PATH);
var lndCert = Buffer.from(cert, 'utf8');
var sslCreds = grpc.credentials.createSsl(lndCert);

var macaroonCreds = grpc.credentials.createFromMetadataGenerator(function(args, callback) {
  var macaroon = fs.readFileSync(process.env.LND_MACAROON_PATH).toString('hex');
  var metadata = new grpc.Metadata();
  metadata.add('macaroon', macaroon);
  callback(null, metadata);
});

var creds = grpc.credentials.combineChannelCredentials(sslCreds, macaroonCreds);
var lightning = new lnrpc.Lightning(process.env.LND_URL, creds);
```
Chú ý : phải tải 1 file **./rpc.proto** (tải tại [đây](https://github.com/lightningnetwork/lnd/blob/master/lnrpc/rpc.proto)) của LND về và đặt cùng path vs file rpc.js

Sau đó bạn có thể xem các RPC api https://api.lightning.community/#lnd-grpc-api-reference
ví dụ mình viết function để send Payment

```js
var sendPayment = payment_request => {
  return new Promise((resolve, reject) => {
    var request = {
      payment_request: payment_request
    };
    lightning.sendPaymentSync(request, function(err, response) {
      resolve(response);
    });
  });
};
```
Sau đó các bạn có thể viết các api chạy các function này

Để giải quyết vấn đề tin tưởng đối với các game gambling như thế này cộng đồng Bitcoin đã đưa ra giải pháp về một kĩ thuật chọn ra ra số ngẫu nhiên đó là **Provably fair** mình cũng đã chia sẻ về nó trong bài viết [này](https://viblo.asia/p/co-che-provably-fair-cua-nhung-game-gambling-online-3P0lPYog5ox)

Mô tả luồng 
![](https://images.viblo.asia/18cc0811-8a32-40a2-8e9e-c7b07c9e6f2e.png)


### Frontend

#### Webln
Để tương tác với Joule chúng ta sử dụng thư viện **Webln** để tương tác với người dùng .

Đầu tiên là **webln.sendPayment** và **webln.makeInvoice**

* **webln.sendPayment** : hàm này để hiển thị cho người dùng màn hình popup xác nhận về việc trả phí mỗi khi bắt đầu chơi .

![](https://images.viblo.asia/df992da5-9663-4670-8e26-6f824d54f245.png)

* **webln.makeInvoice** : hàm này để hiển thị cho người dùng màn hình popup xác nhận khoản tiền người chơi sẽ nhận khi chiến thắng sau đó tạo một invoice và gửi mã thông báo cho server

![](https://images.viblo.asia/9ece1480-3fa0-4daa-9281-17a18b1077ab.png)

Mặc dù còn nhiều những phần cần chau chuốt nhưng về cơ bản đây là một hướng để phát triển Dapp trên Lightning network.

Các bạn có thể tham khảo qua repo của mình : https://github.com/vinhyenvodoi98/Lightning_maxbet
