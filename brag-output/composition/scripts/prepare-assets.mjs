import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('assets', { recursive: true });
await copyFile('node_modules/gsap/dist/gsap.min.js', 'assets/gsap.min.js');
