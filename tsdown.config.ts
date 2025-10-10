import fs from 'fs'
import path from 'path'
import { defineConfig } from 'tsdown'

function copyDirectory(src: string, dest: string) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true })
    }

    const items = fs.readdirSync(src)
    for (const item of items) {
        const srcPath = path.join(src, item)
        const destPath = path.join(dest, item)

        const stat = fs.statSync(srcPath)
        if (stat.isDirectory()) {
            copyDirectory(srcPath, destPath)
        } else {
            fs.copyFileSync(srcPath, destPath)
        }
    }
}

export default defineConfig({
    entry: 'src/main.ts',
    outDir: 'build',
    format: ['es'],
    sourcemap: true,
    hooks: {
        'build:done': () => {
            const cwd = process.cwd()

            // Copy views directory
            const srcViews = path.join(cwd, 'src', 'views')
            const destViews = path.join(cwd, 'build', 'views')

            if (fs.existsSync(srcViews)) {
                copyDirectory(srcViews, destViews)
                console.log('ℹ Copied views directory to build')
            }

            // prepend shebang
            const mainFile = path.join(cwd, 'build', 'main.js')
            const content = fs.readFileSync(mainFile, 'utf-8')

            if (!content.startsWith('#!/usr/bin/env node')) {
                fs.writeFileSync(mainFile, `#!/usr/bin/env node\n${content}`, 'utf-8')
                // make it executable
                fs.chmodSync(mainFile, 0o755)
            }
        },
    },
})
