# bench-render

Render a content object. The skill exposes one operation, `render`, which takes
a `content` argument and returns whether the render succeeded.

## Usage

```js
const { success } = await render({ content: { title: 'Hello' } });
```
