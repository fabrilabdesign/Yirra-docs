# Image Analysis Script for Yirra Docs
# This script analyzes image sizes and provides optimization recommendations

Write-Host "🖼️  Yirra Docs Image Analysis" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

$imgPath = ".\static\img"

if (!(Test-Path $imgPath)) {
    Write-Host "❌ Image directory not found: $imgPath" -ForegroundColor Red
    exit 1
}

# Get all image files
$imageFiles = Get-ChildItem -Path $imgPath -Recurse -Include "*.png", "*.jpg", "*.jpeg", "*.gif", "*.webp", "*.avif" -ErrorAction SilentlyContinue

$totalFiles = $imageFiles.Count
$totalSize = ($imageFiles | Measure-Object -Property Length -Sum).Sum
$totalSizeMB = [math]::Round($totalSize / 1MB, 2)

Write-Host "📊 Current Statistics:" -ForegroundColor Yellow
Write-Host "   Total images: $totalFiles" -ForegroundColor White
Write-Host "   Total size: $totalSizeMB MB" -ForegroundColor White

# Analyze by format
$formatStats = $imageFiles | Group-Object -Property Extension | ForEach-Object {
    $size = ($_.Group | Measure-Object -Property Length -Sum).Sum
    $sizeMB = [math]::Round($size / 1MB, 2)
    [PSCustomObject]@{
        Format = $_.Name.ToUpper()
        Count = $_.Count
        SizeMB = $sizeMB
    }
}

Write-Host "`n📁 Images by Format:" -ForegroundColor Yellow
$formatStats | Sort-Object -Property SizeMB -Descending | ForEach-Object {
    Write-Host "   $($_.Format): $($_.Count) files, $($_.SizeMB) MB" -ForegroundColor White
}

# Find largest files
Write-Host "`n🏆 Largest Files (>500KB):" -ForegroundColor Yellow
$largeFiles = $imageFiles | Where-Object { $_.Length -gt 512000 } | Sort-Object -Property Length -Descending | Select-Object -First 10
$largeFiles | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 1)
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "").Replace("static\", "")
    Write-Host "   $sizeKB KB - $relativePath" -ForegroundColor White
}

# Optimization recommendations
Write-Host "`n💡 Optimization Recommendations:" -ForegroundColor Green

$pngFiles = $imageFiles | Where-Object { $_.Extension -eq ".png" }
$jpgFiles = $imageFiles | Where-Object { $_.Extension -eq ".jpg" -or $_.Extension -eq ".jpeg" }

$potentialSavings = 0

# PNG to WebP savings estimate (50% reduction)
if ($pngFiles.Count -gt 0) {
    $pngSize = ($pngFiles | Measure-Object -Property Length -Sum).Sum
    $webpSavings = $pngSize * 0.5
    $potentialSavings += $webpSavings
    $savingsMB = [math]::Round($webpSavings / 1MB, 2)
    Write-Host "   🔄 Convert $($pngFiles.Count) PNG files to WebP: ~$savingsMB MB savings" -ForegroundColor White
}

# JPG optimization estimate (20% reduction)
if ($jpgFiles.Count -gt 0) {
    $jpgSize = ($jpgFiles | Measure-Object -Property Length -Sum).Sum
    $jpgSavings = $jpgSize * 0.2
    $potentialSavings += $jpgSavings
    $savingsMB = [math]::Round($jpgSavings / 1MB, 2)
    Write-Host "   📏 Optimize $($jpgFiles.Count) JPG files: ~$savingsMB MB savings" -ForegroundColor White
}

# Large file reduction estimate
$veryLargeFiles = $imageFiles | Where-Object { $_.Length -gt 2097152 } # >2MB
if ($veryLargeFiles.Count -gt 0) {
    $largeSize = ($veryLargeFiles | Measure-Object -Property Length -Sum).Sum
    $resizeSavings = $largeSize * 0.6 # Assume 60% reduction from resizing
    $potentialSavings += $resizeSavings
    $savingsMB = [math]::Round($resizeSavings / 1MB, 2)
    Write-Host "   📐 Resize $($veryLargeFiles.Count) large files: ~$savingsMB MB savings" -ForegroundColor White
}

$totalSavingsMB = [math]::Round($potentialSavings / 1MB, 2)
$percentageSavings = [math]::Round(($potentialSavings / $totalSize) * 100, 1)

Write-Host "`n🎯 Estimated Total Savings:" -ForegroundColor Cyan
Write-Host "   $totalSavingsMB MB ($percentageSavings% of total size)" -ForegroundColor White

Write-Host "`n🔧 Implementation Steps:" -ForegroundColor Green
Write-Host "   1. Install image optimization tools: npm install -g imagemin-cli" -ForegroundColor White
Write-Host "   2. Convert PNGs: imagemin static/img/**/*.png --out-dir=static/img/optimized --plugin=webp" -ForegroundColor White
Write-Host "   3. Convert JPGs: imagemin static/img/**/*.jpg --out-dir=static/img/optimized --plugin=mozjpeg" -ForegroundColor White
Write-Host "   4. Update HTML to use <picture> tags with WebP fallbacks" -ForegroundColor White
Write-Host "   5. Add loading='lazy' to images below the fold" -ForegroundColor White

Write-Host "`n✨ Expected Performance Improvements:" -ForegroundColor Magenta
Write-Host "   • Faster initial page loads" -ForegroundColor White
Write-Host "   • Better Core Web Vitals scores" -ForegroundColor White
Write-Host "   • Improved mobile performance" -ForegroundColor White
Write-Host "   • Reduced bandwidth usage" -ForegroundColor White