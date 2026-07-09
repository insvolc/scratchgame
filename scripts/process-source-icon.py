from PIL import Image, ImageDraw
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE_PATH = os.path.join(ROOT, 'doc', 'source_icon.png')
PUBLIC_DIR = os.path.join(ROOT, 'public')
ANDROID_RES = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'res')
os.makedirs(PUBLIC_DIR, exist_ok=True)


def remove_watermark(img, watermark_top_ratio=0.89):
    """用上方像素填充底部水印区域，实现渐变延续"""
    width, height = img.size
    watermark_top = int(height * watermark_top_ratio)
    
    # 复制上方 strip 到下方覆盖水印
    strip_height = height - watermark_top
    strip = img.crop((0, watermark_top - strip_height, width, watermark_top))
    img.paste(strip, (0, watermark_top))
    return img


def create_rounded_mask(size, radius_ratio=0.22):
    mask = Image.new('L', (size, size), 0)
    draw = ImageDraw.Draw(mask)
    radius = int(size * radius_ratio)
    draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
    return mask


def process_icon(size, round_icon=False, crop_ratio=1.12):
    """
    处理源图：先放大 crop_ratio 倍，再居中裁剪到目标尺寸，
    从而切掉右下角水印，同时保持主体居中。
    """
    img = Image.open(SOURCE_PATH).convert('RGBA')
    
    # 计算放大后的尺寸并缩放
    scaled_size = int(size * crop_ratio)
    img = img.resize((scaled_size, scaled_size), Image.LANCZOS)
    
    # 居中裁剪
    left = (scaled_size - size) // 2
    top = (scaled_size - size) // 2
    img = img.crop((left, top, left + size, top + size))
    
    # 应用圆角蒙版（与原图圆角一致）
    mask = create_rounded_mask(size, 0.22)
    output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    output.paste(img, (0, 0), mask)
    
    if round_icon:
        circle_mask = Image.new('L', (size, size), 0)
        draw = ImageDraw.Draw(circle_mask)
        draw.ellipse([0, 0, size, size], fill=255)
        round_output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        round_output.paste(output, (0, 0), circle_mask)
        return round_output
    
    return output


# 生成主图标
master = process_icon(1024, round_icon=False)
master.save(os.path.join(PUBLIC_DIR, 'app-icon.png'))

# 生成 favicon
favicon = master.resize((32, 32), Image.LANCZOS)
favicon.save(os.path.join(PUBLIC_DIR, 'favicon.ico'), format='ICO')

# 生成 Android 图标
android_sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

for folder, s in android_sizes.items():
    folder_path = os.path.join(ANDROID_RES, folder)
    os.makedirs(folder_path, exist_ok=True)
    
    square = process_icon(s, round_icon=False)
    square.save(os.path.join(folder_path, 'ic_launcher.png'))
    
    round_img = process_icon(s, round_icon=True)
    round_img.save(os.path.join(folder_path, 'ic_launcher_round.png'))

# 生成 512x512 商店图标
store = process_icon(512, round_icon=False)
store.save(os.path.join(ANDROID_RES, 'mipmap-xxxhdpi', 'ic_launcher_foreground.png'))

print('Source icon processed and icons generated successfully!')
print(f'Public: {PUBLIC_DIR}')
print(f'Android res: {ANDROID_RES}')
