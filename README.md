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
