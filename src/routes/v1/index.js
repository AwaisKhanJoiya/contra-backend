const express = require("express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const contractRoute = require("./contract.route");
const employeeRoute = require("./employee.route");

const router = express.Router();

const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },

  {
    path: "/user",
    route: userRoute,
  },

  {
    path: "/contracts",
    route: contractRoute,
  },

  {
    path: "/employees",
    route: employeeRoute,
  },

  {
    path: "/employee-contracts",
    route: require("./employee-contract.route"),
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
module.exports = router;
