const jwt = require('jsonwebtoken');
const { v4 } = require('uuid');

const mode = process.env.MODE || 'dev';
const tokenKey = process.env.TOKEN_KEY || 'secret';

function otoroshiMiddleware(opts) {
  return (req, res, next) => {
    if (mode === 'dev') {
      req.token = {
        "sub":"john.doe@foo.bar",
        "aud":"foo",
        "access_type":"user",
        "iss":"Otoroshi",
        "user":{
          "name":"Mathieu Ancelin",
          "email":"mathieu.ancelin@serli.com",
          "profile":{
            "given_name":"John",
            "family_name":"Doe",
            "nickname":"john.doe",
            "name":"John Doe",
            "email":"john.doe@foo.bar"
          },
          "metadata":{},
          "jti":"4ae1b513c-ac2a-4d90-82e4-3541a0d0088e",
        },
        "apikey":{
          "clientId":"g60h4vup1fn88dxt",
          "clientName":"Imelda Lowe's api-key",
          "metadata":{
            "apihub-orga": "api_536a6d6a-efaa-451a-85ab-48c4f87909c0", //"orga_1"
          },
          "tags":[]
        }
      };
      next();
    } else {
      res.set("Otoroshi-State-Resp", req.get("Otoroshi-State") || 'none');
      jwt.verify(req.get("Otoroshi-Claim") || 'none', tokenKey, { issuer: 'Otoroshi' }, (err, decoded) => {
        if (err) {
          console.log('error decoding jwt')
          res.status(500).send({ error: err.message });
        } else {
          req.token = decoded;
          next();
        }
      });
    }
  }
}

exports.otoroshiMiddleware = otoroshiMiddleware;