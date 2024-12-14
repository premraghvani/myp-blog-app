#To set this up#

You will need to run `npm install`
Then, you will need to configure. Lines 9 to 15 read:

```
const authPassword = "";
var T = new twit({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: ''
});
```

`authPassword` is a string with a bcrypt hash of a password you will use
`consumer_key`, `consumer_secret`, `access_token` and `access_token_secret` are all from the Twitter API, so please put your own details.

I hosted this all on Amazon AWS Lambda, with API gateway feeding into it, and data being held in an S3 bucket.

Please feel free to adapt how you see fit - again this was a heavily bodged approach.
