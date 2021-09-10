var sanitizeHtml = require('sanitize-html');

module.exports = {
    HTML:function(title, list, body, control){ // template about HTML / The control parameter is create, update and delete btns 
        return `
        <!doctype html>
        <html>
        <head>
            <title>WEB - ${title}</title>
            <meta charset="utf-8">
        </head>
        <body>
            <h1><a href="/">WEB</a></h1>
            <a href="/author">author</a>
            ${list}
            ${control}
            ${body}
        </body>
        </html>
        `;
    }, list:function(topics){ // Get topics dynamically with the readdir func
        var list = '<ul>';
        var i = 0;
        while(i < topics.length){
            // list = list + `<li>${topics[i]}</li>`; // not hypertext
            list = list + `<li><a href="/?id=${topics[i].id}">${sanitizeHtml(topics[i].title)}</a></li>`;
            i = i + 1;
        }
        list = list+'</ul>';
        return list;
    }, authorSelect:function(authors, author_id){ // The 2nd arg is for a update page  to get curr author 
        var tag = ''; // It will be "<option values="1">egoing</option><option values="2">duru</option>..."
        var i = 0;
        while(i < authors.length){
            var selected = '';
            if(authors[i].id === author_id){
                selected = 'selected';
            }
            tag += `<option value="${authors[i].id}"${selected}>${sanitizeHtml(authors[i].name)}</option>`;
            i++;
        } // ${selected} : The 'selected' string is a html's attribute. It means a selected option among the options.
        return `
            <select name="author">
                ${tag}
            </select>
        `
    }, authorTable:function(authors){
        var tag = '<table>';
        var i = 0;
        while(i < authors.length){
            tag += `
                <tr>
                    <td>${sanitizeHtml(authors[i].name)}</td>
                    <td>${sanitizeHtml(authors[i].profile)}</td>
                    <td><a href="/author/update?id=${authors[i].id}">update</a></td>
                    <td>
                        <form action="/author/delete_process" method="post">
                            <input type="hidden" name="id" value="${authors[i].id}">
                            <input type="submit" value="delete">
                        </form>
                    </td>
                </tr>
                `
            i++;
        }
        tag += '</table>';
        return tag;
    }
}