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
