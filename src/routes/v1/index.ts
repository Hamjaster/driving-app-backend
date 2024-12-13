import express from 'express';
import pupilRoutes from './pupil.route';
import adminRoutes from './admin.route';
import config from '../../config/config';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/pupil',
    route: pupilRoutes,
  },
  {
    path: '/admin',
    route: adminRoutes,
  },
  // {
  //   path: '/users',
  //   route: userRoute,
  // },
];

const devRoutes = [
  // routes available only in development mode
  // {
  //   path: '/docs',
  //   route: docsRoute,
  // },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

export default router;
