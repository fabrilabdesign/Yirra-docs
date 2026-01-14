const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

const inputDir = './yirra_docs/static/img';
const outputDir = './yirra_docs/static/img/optimized';

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to optimize images
async function optimizeImages() {
  console.log('Starting image optimization...');

  // Get all image files
  const imageFiles = [];
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDir(filePath);
      } else if (/\.(png|jpg|jpeg)$/i.test(file)) {
        imageFiles.push(filePath);
      }
    }
  }

  scanDir(inputDir);

  console.log(`Found ${imageFiles.length} images to optimize`);

  let processed = 0;
  let savedBytes = 0;

  for (const inputPath of imageFiles) {
    try {
      const relativePath = path.relative(inputDir, inputPath);
      const outputPath = path.join(outputDir, relativePath);

      // Create output directory
      const outputDirPath = path.dirname(outputPath);
      if (!fs.existsSync(outputDirPath)) {
        fs.mkdirSync(outputDirPath, { recursive: true });
      }

      // Get original file size
      const originalSize = fs.statSync(inputPath).size;

      // Optimize with imagemin
      const optimizedFiles = await imagemin([inputPath], {
        destination: outputDirPath,
        plugins: [
          imageminWebp({
            quality: 80,
            method: 6
          }),
          imageminMozjpeg({
            quality: 80
          }),
          imageminPngquant({
            quality: [0.6, 0.8]
          })
        ]
      });

      if (optimizedFiles.length > 0) {
        const optimizedSize = fs.statSync(optimizedFiles[0].destinationPath).size;
        const savings = originalSize - optimizedSize;
        savedBytes += savings;

        console.log(`✓ ${relativePath}: ${Math.round(originalSize/1024)}KB → ${Math.round(optimizedSize/1024)}KB (${Math.round((savings/originalSize)*100)}% savings)`);
      }

      processed++;

      // Show progress every 10 files
      if (processed % 10 === 0) {
        console.log(`Processed ${processed}/${imageFiles.length} images...`);
      }

    } catch (error) {
      console.error(`Error processing ${inputPath}:`, error.message);
    }
  }

  const totalSavingsMB = Math.round(savedBytes / (1024 * 1024) * 100) / 100;
  console.log(`\n🎉 Optimization complete!`);
  console.log(`Processed: ${processed} images`);
  console.log(`Total space saved: ${totalSavingsMB} MB`);
  console.log(`\nOptimized images saved to: ${outputDir}`);
  console.log(`\nNext steps:`);
  console.log(`1. Review optimized images in ${outputDir}`);
  console.log(`2. Replace original images with optimized versions`);
  console.log(`3. Update HTML to use WebP format with fallbacks`);
}

// Run optimization
optimizeImages().catch(console.error);