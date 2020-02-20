import Router from 'koa-router';
import user from './user';

const router = new Router({ prefix: '/api' });
router.use('/', user.routes(), user.allowedMethods());

export default router;
