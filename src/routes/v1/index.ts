import express from 'express';
import pupilRoutes from './pupil.route.js';
import adminRoutes from './admin.route.js';
import bookingRoutes from './booking.route.js';
import instructorRoutes from './instructor.route.js';
import paymentRoutes from './payment.route.js';
import config from '../../config/config.js';

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
  {
    path: '/booking',
    route: bookingRoutes,
  },
  {
    path: '/instructor',
    route: instructorRoutes,
  },
  {
    path: '/payment',
    route: paymentRoutes,
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
