import { promises as fs } from 'fs';
import path from 'path';

export default function replaceTokensPlugin(options) {
    const {
        tokens = {}, // mapping of token: replacement
    } = options;

    return {
        name: 'vite-plugin-replace-tokens',
        apply: 'build',
        async closeBundle() {
            const publicPath = path.resolve(process.cwd(), 'public');
            const distPath = path.resolve(process.cwd(), 'dist');

            async function replaceTokens(productDirectory) {
                const productPath = path.join(publicPath, productDirectory.name)
                const entries = await fs.readdir(productPath, { withFileTypes: true });
                for (const entry of entries) {
                    if (/\.json$/.test(entry.name) || /\.config$/.test(entry.name)) {
                        // its a json file, replace tokens
                        const absPath = path.join(productPath, entry.name);
                        const relPath = path.join('', productDirectory.name, entry.name);
                        let content = await fs.readFile(absPath, 'utf-8');
                        for (const [token, value] of Object.entries(tokens)) {
                            const re = new RegExp(`\\{${token}\\}`, 'g');
                            content = content.replace(re, value);
                        }
                        // write to dist folder
                        const outPath = path.join(distPath, relPath);
                        await fs.mkdir(path.dirname(outPath), { recursive: true });
                        await fs.writeFile(outPath, content, 'utf-8');
                    }
                }
            }

            await replaceTokens({name: ''});
            // find product folders
            const products = await fs.readdir(publicPath, { withFileTypes: true });
            products.forEach(async (product) => {
                if (product.isDirectory()) {
                    await replaceTokens(product);
                }
            });
        }
    };
}