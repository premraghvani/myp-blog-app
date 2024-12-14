// DECLARATIONS
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

const axios = require("axios");
const bcrypt = require("bcryptjs");
const twit = require("twit")

const authPassword = "";
var T = new twit({
  consumer_key: '',
  consumer_secret: '',
  access_token: '',
  access_token_secret: ''
});

/* PAGES
1. /
2. /update/
3. /newpost/
4. /newpost/action/   POST
*/
exports.handler = async (event) => {
    // PAGE: /
    if(event.page == "/"){
      let content = "";
      let contentRawUnpaged = []
      const itemsPerPage = 10;
      event.pageNumber = parseInt(event.pageNumber);
      if(!event.pageNumber){
        event.pageNumber = 1;
      }
      try {
        let params = {Bucket:"premraghvani",Key:"mypData.json"}
        let tmp = await s3.getObject(params).promise();
        contentRawUnpaged = JSON.parse(tmp.Body);
      } catch (e) {
        return e.stack
      }
      let contentRaw = [];
      let maxPages = Math.ceil(contentRawUnpaged.length / itemsPerPage);
      if(event.pageNumber > maxPages || event.pageNumber < 1){
        return false;
      }
      if(event.pageNumber != maxPages){
        let baseIndex = (event.pageNumber - 1) * itemsPerPage;
        for(var i = 0; i < itemsPerPage; i++){
          contentRaw.push(contentRawUnpaged[baseIndex + i])
        }
      } else {
        let baseIndex = (event.pageNumber - 1) * itemsPerPage;
        for(var i = 0; i < (contentRawUnpaged.length - ((event.pageNumber-1) * itemsPerPage)); i++){
          contentRaw.push(contentRawUnpaged[baseIndex + i])
        }
      }
      let dataLen = contentRaw.length;
      for(var i = 0; i < dataLen; i++){
        let c = contentRaw[i]
        content = content + `<a style="text-decoration: none;" href="update?id=${c.id}"><div class="card">
        <h2>${c.heading}</h2>
        <h5>${formatDate(c.post)}</h5>
        <p>${c.summary}</p>
        <p style="font-size:10px;">Click anywhere in this box to view more | ${i+1} of ${dataLen} on this page | ${(event.pageNumber-1)*itemsPerPage + i + 1} of ${contentRawUnpaged.length} overall <a style="color: #eee;">| ID: ${c.id}</a></p>
        </div></a>`
      }
      let lastPart = "";
      if(event.pageNumber == 1 && maxPages > 1){
        lastPart = `<p><a href=".?page=2">></a></p>`;
      } else if(event.pageNumber == 1 && maxPages == 1){
        lastPart = "";
      } else if (event.pageNumber == maxPages){
        lastPart = `<p><a href=".?page=${event.pageNumber - 1}"><</a></p>`;
      } else {
        lastPart = `<p><a href="/?page=${event.pageNumber - 1}"><</a> | <a href="/?page=${event.pageNumber + 1}">></a></p>`;
      }
      let body = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
<title>MYP Transparency | Prem Raghvani</title>
<meta charset="UTF-8">
<meta content="MYP Transparency: Prem Raghvani" property="og:title"/>
<meta content="Prem Raghvani MYP" property="twitter:title"/>
<meta content="Prem Raghvani MYP" property="og:site_name"/>
<meta content="This website contains content of what Prem Raghvani is doing as the MYP for Oldham, in an aim to keep information transparent" property="og:description"/>
<meta content="This website contains content of what Prem Raghvani is doing as the MYP for Oldham, in an aim to keep information transparent" name="Description"/>
<meta name="keywords" content="prem,raghvani,myp,oldham,transparency" />
<meta content="#840606" name="theme-color"/>

<style>
* {
  box-sizing: border-box;
}
body {
  font-family: Verdana;
  padding: 20px;
  background: #eeeeee;
}
.header {
  padding: 30px;
  font-size: 40px;
  text-align: center;
  background: white;
}
.leftcolumn {   
  float: left;
  width: 75%;
}
.rightcolumn {
  float: left;
  width: 25%;
  padding-left: 20px;
}
.card {
   background-color: white;
   padding: 20px;
   margin-top: 20px;
}
.row:after {
  content: "";
  display: table;
  clear: both;
}
.footer {
  padding: 20px;
  text-align: center;
  background: #ddd;
  margin-top: 20px;
}
@media screen and (max-width: 800px) {
  .leftcolumn, .rightcolumn {   
    width: 100%;
    padding: 0;
  }
}
</style>
</head>
<body>
<div class="w3-row-padding" style="background-color:#840606" id="tpInfo">
    <p style="color: #ffffff; text-align: center">Are you looking for my main website? <a href="https://premraghvani.xyz">Click here</a></p>
  </div>
  <br>
<div class="header">
  <h2>MYP Transparency</h2>
  <h6 style="font-size:12px">for Prem Raghvani, 2022/23 term</h6>
</div>

<div class="row">
  <div class="leftcolumn">
    ${content}
  </div>
  <div class="rightcolumn">
    <div class="card">
      <h3>My Social Media</h3>
      <p>Website: <a href="https://premraghvani.xyz" style="color:#840606">premraghvani.xyz</a></p>
      <p>Twitter: <a href="https://twitter.com" style="color:#840606">premraghvani</a></p>
      <p>Contact Form: <a href="https://premraghvani.xyz/contact/" style="color:#840606">premraghvani.xyz/contact</a></p>
    </div>
  </div>
</div>

<div class="footer">
  <p>Page ${event.pageNumber} of ${maxPages}</p>
  ${lastPart}
</div>

</body>
</html>
        `
        body = body.replace(/\n/g, '')
        return body;
    } 
    // PAGE: /update/
    else if(event.page=="/update/") {
      let content = {};
      try {
        let params = {Bucket:"premraghvani",Key:`mypContent/${event.id}.json`}
        let tmp = await s3.getObject(params).promise();
        content = JSON.parse(tmp.Body)
      } catch (e) {
        return e.stack
      }
      content.text.replace(/\n/g, '<br>');
      content.text.replace(/\\n/g, '<br>');
      if(!content.media){
        content.media = []
      }
      for(var i = 0; i < content.media.length; i++){
        let tmp = content.text.replace(`^${(i+1).toString()}`, `<br><img src="https://myp.premraghvani.xyz/mypContent/${content.media[i]}"><br>`);
        content.text = tmp;
      }
      let body = `
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
<title>${content.heading} | Prem Raghvani MYP</title>
<meta charset="UTF-8">
<meta content="${content.heading}" property="og:title"/>
<meta content="Prem Raghvani MYP" property="twitter:title"/>
<meta content="Prem Raghvani MYP" property="og:site_name"/>
<meta content="${content.summary}" property="og:description"/>
<meta content="${content.summary}" name="Description"/>
<meta name="keywords" content="prem,raghvani,myp,oldham,transparency" />
<meta content="#840606" name="theme-color"/>

<style>
* {
  box-sizing: border-box;
}
body {
  font-family: Verdana;
  padding: 20px;
  background: #eeeeee;
}
.header {
  padding: 30px;
  font-size: 40px;
  text-align: center;
  background: white;
}
.leftcolumn {   
  float: left;
  width: 75%;
}
.rightcolumn {
  float: left;
  width: 25%;
  padding-left: 20px;
}
.card {
   background-color: white;
   padding: 20px;
   margin-top: 20px;
}
.row:after {
  content: "";
  display: table;
  clear: both;
}
.footer {
  padding: 20px;
  text-align: center;
  background: #ddd;
  margin-top: 20px;
}
@media screen and (max-width: 800px) {
  .leftcolumn, .rightcolumn {   
    width: 100%;
    padding: 0;
  }
}
</style>
</head>
<body>
<div class="w3-row-padding" style="background-color:#840606" id="tpInfo">
    <p style="color: #ffffff; text-align: center">Are you looking for my main website? <a href="https://premraghvani.xyz">Click here</a></p>
  </div>
  <br>
<div class="header">
  <h2>MYP Transparency</h2>
  <h6 style="font-size:12px">for Prem Raghvani, 2022/23 term</h6>
</div>

<div class="row">
  <div class="leftcolumn">
    <div class="card">
      <h2>${content.heading}</h2>
      <h5>${formatDate(content.post)}</h5>
      <p>${content.text}</p>
    </div>
  </div>
  <div class="rightcolumn">
    <div class="card">
      <h3>My Social Media</h3>
      <p>Website: <a href="https://premraghvani.xyz" style="color:#840606">premraghvani.xyz</a></p>
      <p>Twitter: <a href="https://twitter.com" style="color:#840606">premraghvani</a></p>
      <p>Contact Form: <a href="https://premraghvani.xyz/contact/" style="color:#840606">premraghvani.xyz/contact</a></p>
    </div>
  </div>
</div>

<div class="footer">
  <p>Post ID: ${event.id}</p>
  <p><a href="javascript:history.back()">Go Back</a> | <a href="https://myp.premraghvani.xyz">Main Page</a></p>
</div>

</body>
</html>
        `
        body = body.replace(/\n/g, '')
        return body;
    } 
    // PAGE: /newpost/
    else if(event.page=="/newpost/"){
      return `<!DOCTYPE html>
<html>
<head>
<script src="https://www.google.com/recaptcha/api.js?render=6LdUGY8eAAAAAH5CJk7SqnEaA22F90mcXmjHp_7o"></script>
<script src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
<style>
* {
  box-sizing: border-box;
}

input[type=text], select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}
input[type=password], select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}
label {
  padding: 12px 12px 12px 0;
  display: inline-block;
}

input[type=submit] {
  background-color: #840606;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  float: right;
}

input[type=submit]:hover {
  background-color: #A42626;
}

.container {
  border-radius: 5px;
  background-color: #eee;
  padding: 20px;
}

.col-25 {
  float: left;
  width: 25%;
  margin-top: 6px;
}

.col-75 {
  float: left;
  width: 75%;
  margin-top: 6px;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}

/* Responsive layout - when the screen is less than 600px wide, make the two columns stack on top of each other instead of next to each other */
@media screen and (max-width: 600px) {
  .col-25, .col-75, input[type=submit] {
    width: 100%;
    margin-top: 0;
  }
}
</style>
</head>
<body>

<h2>MYP Post Form - Prem Raghvani</h2>

<div class="container">
  <form action="/newpost/action" method="post" id="ijaal">
  <div class="row">
    <div class="col-25">
      <label for="heading">Heading</label>
    </div>
    <div class="col-75">
      <input type="text" id="heading" name="heading" placeholder="Heading / Title, max 32 characters" maxlength="32" required>
    </div>
  </div>
  <div class="row">
    <div class="col-25">
      <label for="summary">Summary</label>
    </div>
    <div class="col-75">
      <input type="text" id="summary" name="summary" placeholder="A summary for what this is (max 128 characters)" maxlength="128" required>
    </div>
  </div>
  <div class="row">
    <div class="col-25">
      <label for="content">Content</label>
    </div>
    <div class="col-75">
      <textarea id="content" name="content" placeholder="The main body / content (max 8192 characters)" style="height:300px" maxlength="8192" required></textarea>
    </div>
  </div>
  <br>
  <div class="row">
    <div class="col-25">
      <label for="password">Authorisation</label>
    </div>
    <div class="col-75">
      <input type="password" id="password" name="password" placeholder="(max 32 characters)" maxlength="32" required>
    </div>
  </div>
  <div class="row">
    <div class="col-25">
      <label for="tauth">Twitter Post Auth</label>
    </div>
    <div class="col-75">
      <input type="password" id="tauth" name="tauth" placeholder="(max 32 characters - leave blank if not wanted)" maxlength="32">
    </div>
  </div>
  <div class="row">
    <input type="submit" value="Submit">
  </div>
  </form>
</div>
<script>
$('#ijaal').submit(function(event) {
    event.preventDefault();
    grecaptcha.ready(function() {
        grecaptcha.execute('6LdUGY8eAAAAAH5CJk7SqnEaA22F90mcXmjHp_7o', {
            action: 'submit'
        }).then(function(token) {
            $('#ijaal').prepend('<input type="hidden" name="token" value="' + token + '">');
            $('#ijaal').prepend('<input type="hidden" name="action" value="validate_captcha">');
            $('#ijaal').unbind('submit').submit();
        });;
    });
});</script>
</body>
</html>
`  
    }
    
    else if(event.page=="/newpost/action/"){
      let bodySplit = event.body.split("&");
      let inputData = {};
      let validRegex = /[ -~]\\/;
      for(var i = 0; i < bodySplit.length; i++){
        let tmp = bodySplit[i].split("=");
        let fixedData = unescape(tmp[1]);
        fixedData = fixedData.replace(/\+/ig," ");
        fixedData = fixedData.replace(/\r/ig,"");
        fixedData = fixedData.replace(/\\r/ig,"");
        fixedData = fixedData.replace(/\n/ig,"<br>");
        fixedData = fixedData.replace(/\\n/ig,"<br>");
        if(validRegex.test(fixedData)){
          return {code:400,description:"Invalid Format"}
        }
        inputData[tmp[0]] = fixedData;
      }
      let siteVerify = await axios.post('https://www.google.com/recaptcha/api/siteverify',`secret=6LdUGY8eAAAAANlvk25OJz3y9HuB-ZwLNcYr6i5e&response=${inputData.token}`);
      if(siteVerify.data.success == false){
        return {code:403}
      }
      if(siteVerify.data.score < 0.7){
        return {code:403}
      }
      if(bcrypt.compareSync(inputData.password, authPassword) == false){
        return {code:403,description:"FORBIDDEN"}
      }
      let twitterPost = false;
      if(inputData.password == inputData.tauth){
        twitterPost = true;
      }
      if(!inputData.heading || !inputData.summary || !inputData.content){
        return {code: 400,description:"Insufficient Data"}
      }
      let oldSummary = []
      try {
        let params = {Bucket:"premraghvani",Key:"mypData.json"}
        let tmp = await s3.getObject(params).promise();
        oldSummary = JSON.parse(tmp.Body);
      } catch (e) {
        return e.stack
      }
      const currentDate = Date.now();
      let summaryFormat = {
        id: (parseInt(oldSummary[0].id) + 1).toString(),
        post: parseInt(currentDate / 1000),
        heading:inputData.heading,
        summary:inputData.summary
      }
      oldSummary.unshift(summaryFormat);
      try {
        let params = {Bucket:"premraghvani",Key:"mypData.json",Body:JSON.stringify(oldSummary)}
        let tmp = await s3.putObject(params).promise();
      } catch (e) {
        return e.stack
      }
      summaryFormat.text = inputData.content;
      try {
        let params = {Bucket:"premraghvani",Key:`mypContent/${summaryFormat.id}.json`,Body:JSON.stringify(summaryFormat)}
        let tmp = await s3.putObject(params).promise();
      } catch (e) {
        return e.stack
      }
      if(twitterPost){
        let tweet = `NEW: ${summaryFormat.heading}\n${summaryFormat.summary}\nhttps://myp.premraghvani.xyz/update?id=${summaryFormat.id}`;
        await T.post('statuses/update', { status: tweet }, function(err, data, response) {
          if(err){return err}
        })
      }
      return `Success <a href="https://myp.premraghvani.xyz/update?id=${summaryFormat.id}">here</a>`
    } else {
      return false;
    }
};

function formatDate(unix){
  const d = new Date(unix*1000);
  return d.toUTCString();
}