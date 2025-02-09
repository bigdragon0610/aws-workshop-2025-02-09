# Lambda を使い倒す！

## シンプルなLambda (Node.js)

まず、Node.jsの設計図を元にLambdaを作成します。

名前は`nodejs-helloworld`とします。

![](/images/2025-02-09-11-31-42.png)

作成できたら、ソースコードを以下のように書き換えます。

```js
export const handler = async (event, context) => {
    console.log(event);
    const name = event.body;
    return `Hello, ${name}!`;
};
```

書き換えたら必ず`Deploy`ボタンを押してください！

![](/images/2025-02-09-11-37-13.png)

デプロイができたら、テスト実行します。

`テスト`タブで`イベントJSON`を以下のように入力してください。

```json
{
  "body": "test"
}
```

`テスト`ボタンを押し、以下のようにレスポンスが返ってくれば成功です！

![](/images/2025-02-09-11-39-54.png)

## 関数URLを作成

Lambdaを外部公開するために、関数URLを作成します。

`設定` > `関数URL` にて、`関数URLを作成`ボタンを押してください。

![](/images/2025-02-09-11-42-27.png)

今回は制限をかけずに外部公開するため、認証タイプは`NONE`を選択します。

![](/images/2025-02-09-11-43-02.png)

ここで`保存`を押すと、関数URLが作成されます。

![](/images/2025-02-09-11-49-10.png)

では、curlコマンドを使ってテストしてみましょう。URLは自分のものに置き換えてください。

```bash
curl https://xxxxxxxxxxxxxxxxxxxx.lambda-url.ap-northeast-1.on.aws/ \
  -H "Content-Type: application/json" \
  -d 'test'
```

以下のようにレスポンスが返ってくれば成功です！

![](/images/2025-02-09-12-08-33.png)

## Node.js + Docker

Lambdaではネイティブで複数の言語をデプロイできますが、その他にDockerを使ってデプロイする方法もあります。

詳しくは[AWS公式のチュートリアル](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/nodejs-image.html)が参考になります。

### ローカルで動かす

まずは`Dockerfile`を作成します。

```Dockerfile
FROM public.ecr.aws/lambda/nodejs:22

COPY index.mjs ${LAMBDA_TASK_ROOT}

CMD [ "index.handler" ]
```

次に、Dockerfileと同じ階層に`index.mjs`を作成します。内容は最初のLambdaと同じです。

```js
export const handler = async (event, context) => {
    console.log(event);
    const name = event.body;
    return `Hello, ${name}!`;
};
```

これでソースコードが準備できたので、ビルドして実行します(後で使うのでタグをつけています)。

```bash
docker build --platform linux/amd64 -t nodejs-docker-helloworld .
docker run --platform linux/amd64 -p 9000:8080 nodejs-docker-helloworld
```

<details>
<summary>ビルドがエラーになる場合</summary>

---

AWSの認証情報をターミナルにセットした後、以下のコマンドを実行し、再度ビルドしてください。

```bash
aws ecr-public get-login-password --region us-east-1 | docker login --username AWS --password-stdin public.ecr.aws
```

---

</details>

コンテナの起動が完了したら、別のターミナルで以下のコマンドを実行してテストします。

```bash
curl "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{"body": "test"}'
```

`Hello, test!`というレスポンスが返ってきたでしょうか？

### AWS上で動かす

ローカルで作成したイメージをAWSに持っていき、Lambdaとしてデプロイします。

まずはECRにプライベートリポジトリを作成します。名前は`nodejs-docker-helloworld`とします。

![](/images/2025-02-09-14-13-28.png)

次に、ローカルで作成したイメージをECRにプッシュします。以下の`<AWSアカウント>`は自分のものに置き換えてください。

```bash
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin <AWSアカウント>.dkr.ecr.ap-northeast-1.amazonaws.com
docker tag nodejs-docker-helloworld:latest <AWSアカウント>.dkr.ecr.ap-northeast-1.amazonaws.com/nodejs-docker-helloworld:latest
docker push <AWSアカウント>.dkr.ecr.ap-northeast-1.amazonaws.com/nodejs-docker-helloworld:latest
```

ECR上でこのようになっていればOKです。

![](/images/2025-02-09-14-38-43.png)

次に`コンテナイメージ`としてLambdaを作成します。名前は`nodejs-docker-helloworld`とし、URIはECRのページからコピーします。

![](/images/2025-02-09-14-45-29.png)

最後に、関数URLを作成してテストしてみましょう。内容は最初のLambdaと同じです。

## Lambda Web Adapter

ここまで作成してきたLambdaは、すべて`handler`がエントリーポイントとして存在することを期待していました。

[Lambda Web Adapter](https://github.com/awslabs/aws-lambda-web-adapter)を使うと、HTTPを話すどんなWebフレームワークでもLambdaとしてデプロイできます！

### Next.js

試しにNext.jsのApp RouterをLambdaにデプロイしてみます。

手順は以下の記事に従って進めてください。

[Next.js を Lambda に最速でデプロイする](https://blog.bigdragon.tech/articles/nextjs-deploy-to-lambda-fast)

### Rust + Docker

Next.jsは若干ネタ性が強いので、次にRustを使ってLambdaを作成してみます。

ソースコードは `axum-lambda-sample` ディレクトリにあります。

まずはローカルで動かしてみましょう。

```bash
docker compose up -d
docker compose exec app cargo run
```

このサンプルでは、2つのエンドポイントが用意されています。

- http://localhost:8080/
  - `Hello, World!`が返ってくる
- http://localhost:8080/{name}
  - `{name}`に入力された文字列によって、`Hello, {name}!`が返ってくる

どちらもcurlやブラウザなどでアクセスしてみてください。

![](/images/2025-02-09-15-49-55.png)
![](/images/2025-02-09-15-50-14.png)

現状`Dockerfile`に書かれた設定でRustが動いていますが、Lambdaで動かす際には`Dockerfile.aws`を使うことにします。

`Dockerfile.aws`を読むと、以下のようにLambda Web Adapterを使っていることがわかります。

```Dockerfile
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.9.0 /lambda-adapter /opt/extensions/lambda-adapter
```

このように1行追加するだけで、ECSなどで動くコンテナイメージと互換性を保ったまま、Lambdaにデプロイできるようになります！

AWSで動かす準備は以下の通りです。

- ECRにプライベートリポジトリを作成
  - 名前は`axum-lambda-sample`とします
- ローカルでイメージをビルド
  - `Dockerfile.aws`を使うため、`axum-lambda-sample`ディレクトリで以下のコマンドを実行してください
  - → `docker build -f docker/app/Dockerfile.aws --platform linux/amd64  -t axum-lambda-sample .`
- ECRにプッシュ
- Lambdaを作成
  - コンテナイメージとして作成 (名前は`axum-lambda-sample`)
  - ECRのURIを指定
  - 関数URLを作成

## リバースプロキシ

- VPCの作成
  - VPCなど
  - 名前: `lambda-dispatcher-sample`
- EC2を2つ起動
  - `lambda-dispatcher-sample-instance-1` & `lambda-dispatcher-sample-instance-2`
  - キーペアなし
  - セキュリティグループは80番ポートを開ける
  - ユーザーデータ
    ```bash
    sudo yum -y install httpd
    sudo systemctl enable httpd
    sudo systemctl start httpd
    echo "<h1>Server: $(hostname)</h1>" > /var/www/html/index.html
    chown apache.apache /var/www/html/index.html
    ```
  - パブリックIPをもたせる
- Lambdaを作成
  - 1から作成
  - 名前: `lambda-dispatcher-sample`
  - 関数URLを有効化
  - honoを使ってソースコードを作成
    ```bash
    npm create hono@latest lambda-dispatcher-sample
    ```
  - `package.json`の`scripts` > `update`のLambda関数名を`lambda-dispatcher-sample`に変更
  - `index.ts`を以下のように書き換え
    ```ts
    import { Hono } from 'hono'
    import { handle } from 'hono/aws-lambda'

    const app = new Hono()

    app.all('/:ip', async (c) => {
      const ip = c.req.param('ip')
      const newUrl = new URL(`http://${ip}`)
      const newRequest = new Request(newUrl)
      const response = await fetch(newRequest)
      return response
    })

    export const handler = handle(app)
    ```
- `関数URL/{EC2のIP}`でアクセスしてみる
