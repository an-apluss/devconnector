const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const headerToken = req.header("Authorization");

  if (!headerToken) {
    return res.status(401).json({
      msg: "Authorization denied! No token is provided",
    });
  }

  const token = headerToken.split(" ")[1];

  try {
    const decodeToken = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = decodeToken.user;

    return next();
  } catch (error) {
    console.error(error.message);

    if (error.kind == "jwt expired" || error.message == "jwt expired") {
      return res.status(400).json({ msg: "JWT Expired: Login to proceed" });
    }

    return res.status(401).json({ msg: "Token is invalid" });
  }
};
