import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Check both potential locations: public/assets/empresas and assets/empresas
    const publicDir = path.join(process.cwd(), 'public', 'assets', 'empresas');
    const rootAssetsDir = path.join(process.cwd(), 'assets', 'empresas');

    // Auto-sync any new images added directly to root assets/empresas folder to public/assets/empresas
    if (fs.existsSync(rootAssetsDir)) {
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      const rootFiles = fs.readdirSync(rootAssetsDir);
      for (const file of rootFiles) {
        if (/\.(jpe?g|png|webp|svg|gif)$/i.test(file)) {
          const srcPath = path.join(rootAssetsDir, file);
          const destPath = path.join(publicDir, file);
          if (!fs.existsSync(destPath)) {
            try {
              fs.copyFileSync(srcPath, destPath);
            } catch {
              // ignore copy error
            }
          }
        }
      }
    }

    const dirToRead = fs.existsSync(publicDir) ? publicDir : rootAssetsDir;
    if (!fs.existsSync(dirToRead)) {
      return NextResponse.json({ logos: [] });
    }

    const files = fs.readdirSync(dirToRead);
    const validExtensions = /\.(jpe?g|png|webp|svg|gif)$/i;

    const logos = files
      .filter((file) => validExtensions.test(file) && !file.startsWith('.'))
      .sort((a, b) => a.localeCompare(b))
      .map((file) => {
        const nameWithoutExt = file.replace(/\.[^/.]+$/, '');
        const formattedName = nameWithoutExt
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());

        return {
          name: formattedName,
          src: `/assets/empresas/${file}`
        };
      });

    return NextResponse.json({ logos });
  } catch (error) {
    console.error('Error reading empresas directory:', error);
    return NextResponse.json({ logos: [] }, { status: 500 });
  }
}
