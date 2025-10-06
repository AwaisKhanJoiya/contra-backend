const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const passport = require("passport");
const httpStatus = require("http-status");
const routes = require("./src/routes/v1");
const config = require("./src/config/config");
const { authLimiter } = require("./src/middlewares/rateLimiter");
const { errorConverter, errorHandler } = require("./src/middlewares/error");
const { jwtStrategy } = require("./src/config/passport");
const ApiError = require("./src/utils/ApiError");
const app = express();

// if (config.env !== "test") {
//   app.use(morgan.successHandler);
//   app.use(morgan.errorHandler);
// }

// set security HTTP headers
app.use(helmet());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
// app.use(cors("*"));
// app.options("*", cors());

app.use(
  cors({
    origin: ["http://localhost:3000"], // frontend URL
    credentials: true, // allow cookies + auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// handle preflight requests
app.options("*", cors());

// app.use(express.static("uploads"));

// jwt authentication
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === "production") {
  app.use("/v1/auth", authLimiter);
}

// v1 api routes
app.use("/v1", routes);
// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
