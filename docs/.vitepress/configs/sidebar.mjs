
import fs from 'fs';
import path from 'path';

// 获取第一层目录
const generateMainConfig = () => {
    const rootPath = path.resolve('./docs/src')
    const dirs = fs.readdirSync(rootPath).filter(file => {
        const fullPath = path.join(rootPath, file)
        return fs.statSync(fullPath).isDirectory()
    })
    const config = {}
    dirs.forEach(dir => {
        if (dir != 'public')
            config[`/${dir}/`] = generateSubSidebar(rootPath, dir)
    })

    return config

}


// 递归生成配置对象
function generateSubSidebar(dirPath = './docs/src/', baseUrl = '') {
    const DirPath = path.resolve(path.join(dirPath, baseUrl));
    const config = [];
    const files = fs.readdirSync(DirPath);

    files.forEach(file => {
        const filePath = path.join(DirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            const folderConfig = {
                text: file,
                collapsed: false,
                items: generateSubSidebar(dirPath, path.join(baseUrl, file))
            };
            config.push(folderConfig);
        } else if (path.extname(file) === '.md') {
            const fileName = path.basename(file, '.md');
            config.push({
                text: fileName == 'index' ? 'Ra1ning' : fileName,
                link: path.join(baseUrl, file)
            });
        }
    });

    return config;
}

const config = generateMainConfig()
// console.log('config',config)

export default config;

