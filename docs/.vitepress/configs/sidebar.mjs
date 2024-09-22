
import fs from 'fs';
import path from 'path';

// 递归生成配置对象
function generateConfig(relativePath, baseUrl = '') {
    const dirPath = path.resolve(relativePath);
    const config = [];
    const files = fs.readdirSync(dirPath);

    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            const folderConfig = {
                text: file,
                collapsed: false,
                items: generateConfig(filePath, `${baseUrl}/${file}`)
            };
            config.push(folderConfig);
        } else if (path.extname(file) === '.md') {
            const fileName = path.basename(file, '.md');
            config.push({
                text: fileName,
                link: `${baseUrl}/${file}`
            });
        }
    });

    return config;
}

// 调用函数生成配置
const config = generateConfig('./docs/src'); // 假设你的文件在 docs 目录下

export default config;

