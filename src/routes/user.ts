import Router from 'koa-router';

const router = new Router({ prefix: 'user' });

router.get('/', ctx => {
  ctx.body = { msg: 'This is the user endpoint.' };
});

export default router;
