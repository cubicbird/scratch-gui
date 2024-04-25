const express = require('express');
const app = express();
const port = 3001;
const bodyParser = require('body-parser');

const crypto = require('crypto');
app.use(bodyParser.json());


const fs = require('fs');
const path = require('path');

const writeBodyToLocalFile = (projectId, requestBody) => {
    console.log(`about to write requestBody to ${projectId}.json`);
    console.log(requestBody);

    // 将 req.body 写入到 request.json 文件中
    fs.writeFile(`./localdev/${projectId}.json`, JSON.stringify(requestBody, null, 2), err => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log(`Request body has been written to ./${projectId}.json`);
    });
};

app.post('/api/login', (req, res) => {
    res.json({
        usernameForDisplay: '方块鸟',
        access: 'access_token',
        refresh: 'refresh_token'
    });
});

app.get('/api/login_info', (req, res) => {

    res.json({usernameForDisplay: '方块鸟'});
    // res.status(401);
});


app.post('/api/logout', (req, res) => {
    res.json({message: 'bye'});
});

app.post('/api/scratch/project', (req, res) => {
    // 获取当前时间戳并转换为字符串
    const currentTimeMillis = String(Date.now());

    // 使用 crypto 模块计算 MD5 值
    const projectId = crypto.createHash('md5')
        .update(currentTimeMillis)
        .digest('hex');

    writeBodyToLocalFile(projectId, req.body);

    console.log(req.body);
    console.log(req.params);

    res.json({'id': projectId, 'projectId': projectId, 'content-name': projectId});
});


app.put('/api/scratch/project/:projectId', (req, res) => {
    // 获取当前时间戳并转换为字符串
    const projectId = req.params.projectId;
    res.json({projectId: projectId});
    writeBodyToLocalFile(projectId, req.body);
    console.log(req.params);
    // console.log(req.body);
});

app.get('/api/scratch/project/:projectId', (req, res) => {
    const projectId = req.params.projectId;
    const filePath = path.join('./localdev/', `${projectId}.json`);

    // 尝试读取文件
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            // 文件不存在，返回 404 错误
            if (err.code === 'ENOENT') {
                return res.status(404)
                    .send('File not found');
            }
            // 其他错误，返回 500 错误
            return res.status(500)
                .send('Internal server error');
        }
        // 文件存在，返回文件内容
        if (projectId === 'my_project') {
            res.json({
                sourceCode: JSON.parse(data),
                owner: {
                    id: 1,
                    name: '方块鸟'
                }
            });
        } else {
            res.json({
                sourceCode: JSON.parse(data),
                owner: {
                    id: 1,
                    name: '毛毛猪'
                }
            });
        }
    });
});

app.listen(port, () => {
    console.log('server is running.');
});
