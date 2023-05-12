const express = require('express');
const router = express.Router();
const crypto = require("crypto");

const USERS = [
  { id: '1', key: '1', publicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmuEvZzwDYvt8noVJdMcqzr1D9CxEKh0qgVvwl0pwVXDB4eyrO4bzSJ9OAUTmNNpEbCJ64sfrUM3/iLg9o85ZgR5kbXkp9IwKxTpwt3wADZa7s8MJig3ZW3zyVZOJeRu4HQsaVASe/qEaSmhFwfihkMeuj2sWaAXEneZ7qDRp5qehRE9dfzsrniZ9oUp5+PKB4jW5S3z8bBCgIwLVoaO9MvFdqPag4Y9DDsfCIiSnY7E2BDGGFKvoi9nXLK2EkkXV1IMnEyT+Fmm8vEvC3510ElcG1F/F0c8yTLGh1i/powVd9rDkzCebxrEgoiCt3eZBxAhtX/UsFo9648hRWa22+QIDAQAB' }
];

const checkSignature = (req, res) => {
  const { id, signature } = req.body;
  const user = USERS.find(u => u.id === id)
  if (!user) {
    throw new Error("404");
  }
  const { publicKey } = user;
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(id);
  const isVerified = verifier.verify(
    `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`,
    signature,
    'base64'
  );
  console.log(id, signature, publicKey, isVerified)
  if (!isVerified) {
    return res
      .json({
        status: false,
      });
  }
  return res.json({
    status: true,
    id: user.id
  });
};

router.post('/auth', (req, res) => {
  const { id, key, publicKey, signature } = req.body;
  if (id && key) {
    const user = USERS.find(u => u.id === id && u.key === key);
    if (user) {
      if (publicKey) user.publicKey = publicKey;
      return res.json({ status: true, id: user.id });
    }
  }
  if (id && signature) {
    return checkSignature(req, res);
  }
  return res.json({ status: false });
});

router.patch('/user', (req, res) => {
  const user = USERS.find(u => u.id === req.body.id);
  if (user && req.body.publicKey) {
    user.publicKey = req.body.publicKey;
    return res.json({ status: true, user });
  }
  return res.json({ status: false });
});

module.exports = router;
