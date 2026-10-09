import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
export default defineConfig({base:'./',plugins:[react(),{name:'pages-marker',closeBundle(){writeFileSync(fileURLToPath(new URL('../docs/.nojekyll',import.meta.url)),'');}}],build:{outDir:'../docs',emptyOutDir:true}});
