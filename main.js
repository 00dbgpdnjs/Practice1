var http = require('http');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var mysql = require('mysql'); // after $ npm install --save mysql
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'gpdnjs09',
    database : 'opentutorals3'
});
db.connect(); // Connect to mysql

var app = http.createServer(function(request, response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    
    if(pathname === '/'){
        if(queryData.id === undefined){ // Show title's lists, maintext(title, desc) and controllers(create)
            db.query('SELECT * FROM topic', function (error, topics) {
                // console.log(topics); // >> It's a table as arr and has title, description, created and author_id as obj ; result of 1st arg of query()
                var title = 'Welcome';
                var description = 'Hello, Node.js';
                var list = template.list(topics);
                var html = template.HTML(title, list, 
                    `<h2>${title}</h2>${description}`,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            }); // callback func
        } else {
            db.query('SELECT * FROM topic', function(error, topics) { // ?? ok -> list
                if(error){
                    throw error; // throw: nodejs stop running and print error as concole and stop application
                }
                db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(error2, topic){ // for showing desc according to id / Instead of "SELECT * FROM topic WHERE id=${queryData.id}" for security ; 물음표 갯수 만큼 배열을 채움
                    if(error2){
                        throw error2;
                    }
                    // console.log(topic); // before joining two tables, "SELECT * FROM topic WHERE id=?" >> a row according to id
                    // console.log(topic[0].title); // before joining two tables / [0]: because topic is a arr and has one element.
                    // console.log(topic); // >> a table, "topic table + author table"
                    var title = topic[0].title;
                    var description = topic[0].description;
                    var list = template.list(topics);
                    var html = template.HTML(title, list, 
                        `<h2>${title}</h2>${description}
                        <p>by ${topic[0].name}</p>
                        `,
                        `<a href="/create">create</a>
                            <a href="/update?id=${queryData.id}">update</a>
                            <form action="/delete_process" method="post">
                                <input type="hidden" name="id" value="${queryData.id}">
                                <input type="submit" value="delete">
                            </form>`
                    );
                    response.writeHead(200);
                    response.end(html);
                })
            });
        }
    } else if(pathname === '/create'){
        db.query('SELECT * FROM topic', function (error, topics) {
            db.query(`SELECT * FROM author`, function(error2, authors){
                // console.log(authors); // >> a author table
                var title = 'Create';
                var list = template.list(topics);
                var html = template.HTML(title, list, 
                    `
                    <form action="/create_process" method="post">
                        <p><input type="text" name="title" placeholder="title"></p>
                        <p>
                            <textarea name="description" placeholder="description"></textarea>
                        </p>
                        <P>
                            ${template.authorSelect(authors)}
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                    </form>
                    `,
                    `<a href="/create">create</a>`
                );
                response.writeHead(200);
                response.end(html);
            })
            
        });
    } else if(pathname === '/create_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            // instead of fs.writeFile
            db.query(`
                INSERT INTO topic (title, description, created, author_id)
                    VALUES(?, ?, NOW(), ?)`,
                [post.title, post.description, post.author], // post.author = the name of <select name="author">
                function(error, result){
                    if(error){
                        throw error;
                    }
                    response.writeHead(302, {Location: `/?id=${result.insertId}`}); // result.insertId : Getting the id of an inserted row
                    response.end();
                }
            )
        });
    } else if(pathname === '/update'){
        db.query('SELECT * FROM topic', function(error, topics){
            if(error){
                throw error;
            }
            db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(error2, topic){
                if(error2){
                    throw error2;
                }
                db.query(`SELECT * FROM author`, function(error2, authors){
                    var list = template.list(topics);
                    var html = template.HTML(topic[0].title, list, 
                        `
                        <form action="/update_process" method="post">
                        <input type="hidden" name="id" value="${topic[0].id}">
                        <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                        <p>
                            <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                        </p>
                        <P>
                            ${template.authorSelect(authors, topic[0].author_id)}
                        </p>
                        <p>
                            <input type="submit">
                        </p>
                        </form>
                        `,
                        `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
                    );
                    response.writeHead(200);
                    response.end(html);
                });                
            });
        });
    } else if(pathname === '/update_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            db.query('UPDATE topic SET title=?, description=?, author_id=? WHERE id=?', [post.title, post.description, post.author, post.id], function(error, result){
                response.writeHead(302, {Location: `/?id=${post.id}`});
                    response.end();
            })
        });
    } else if(pathname === '/delete_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            db.query('DELETE FROM topic WHERE id = ?', [post.id], function(error, result){
                if(error){
                    throw error;
                }
                response.writeHead(302, {Location: `/`});
                response.end();
            });
        });
    } else {
        response.writeHead(404);
        response.end('Nout found');
    }

});
app.listen(3000);