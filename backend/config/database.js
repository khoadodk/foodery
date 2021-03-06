// module.exports = ({ env }) => ({
//   defaultConnection: "default",
//   connections: {
//     default: {
//       connector: "mongoose",
//       settings: {
//         host: env("DATABASE_HOST", "127.0.0.1"),
//         srv: env.bool("DATABASE_SRV", false),
//         port: env.int("DATABASE_PORT", 27017),
//         database: env("DATABASE_NAME", "foodery"),
//         username: env("DATABASE_USERNAME", ""),
//         password: env("DATABASE_PASSWORD", ""),
//       },
//       options: {
//         authenticationDatabase: env("AUTHENTICATION_DATABASE", null),
//         ssl: env.bool("DATABASE_SSL", false),
//       },
//     },
//   },
// });
module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "mongoose",
      settings: {
        uri: env("DATABASE_URI"),
        ssl: { rejectUnauthorized: false },
      },
      options: {
        ssl: true,
        authenticationDatabase: "",
        useUnifiedTopology: true,
        pool: {
          min: 0,
          max: 10,
          idleTimeoutMillis: 30000,
          createTimeoutMillis: 30000,
          acquireTimeoutMillis: 30000,
        },
      },
    },
  },
});
