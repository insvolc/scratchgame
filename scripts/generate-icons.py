from PIL import Image, ImageDraw, ImageFont
import os
import math
import random

# 固定随机种子，保证每次生成结果一致
random.seed(42)

# 项目根目录
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_DIR = os.path.join(ROOT, 'public')
ANDROID_RES = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'res')
os.makedirs(PUBLIC_DIR, exist_ok=True)


def create_gradient(size, color_top, color_bottom):
    """创建垂直渐变背景"""
    bg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    for y in range(size):
        ratio = y / size
        r = int(color_top[0] * (1 - ratio) + color_bottom[0] * ratio)
        g = int(color_top[1] * (1 - ratio) + color_bottom[1] * ratio)
        b = int(color_top[2] * (1 - ratio) + color_bottom[2] * ratio)
        bg_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
    return bg


def create_rounded_mask(size, radius_ratio):
    """创建圆角矩形蒙版"""
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    radius = int(size * radius_ratio)
    mask_draw.rounded_rectangle([0, 0, size, size], radius=radius, fill=255)
    return mask


def draw_star(draw, cx, cy, r, fill):
    """绘制五角星"""
    points = []
    for i in range(10):
        angle = math.pi / 2 + i * math.pi / 5
        radius = r if i % 2 == 0 else r * 0.4
        x = cx + radius * math.cos(angle)
        y = cy - radius * math.sin(angle)
        points.append((x, y))
    draw.polygon(points, fill=fill)


def draw_scratch_texture(draw, bbox, size, density=0.15):
    """在指定区域绘制银色刮刮涂层颗粒纹理"""
    x1, y1, x2, y2 = bbox
    width = x2 - x1
    height = y2 - y1
    count = int(width * height * density / (size * size) * 500)
    for _ in range(count):
        x = random.randint(x1, x2)
        y = random.randint(y1, y2)
        r = random.randint(int(size * 0.003), int(size * 0.008))
        gray = random.choice([(200, 200, 205), (180, 180, 185), (160, 160, 165), (220, 220, 225)])
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(*gray, 180))


def draw_scratch_lines(draw, size, start, end, width):
    """绘制不规则刮痕"""
    x1, y1 = start
    x2, y2 = end
    steps = int(math.dist(start, end) / (size * 0.01)) + 5
    points = []
    for i in range(steps + 1):
        t = i / steps
        x = x1 + (x2 - x1) * t + random.randint(-int(size * 0.01), int(size * 0.01))
        y = y1 + (y2 - y1) * t + random.randint(-int(size * 0.01), int(size * 0.01))
        points.append((x, y))
    for i in range(len(points) - 1):
        draw.line([points[i], points[i + 1]], fill=(255, 193, 7, 230), width=width)


def create_icon(size, round_icon=False):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # 1. 背景：金色到橙色渐变
    bg = create_gradient(size, (255, 200, 50), (255, 140, 0))
    mask = create_rounded_mask(size, 0.22)
    bg = Image.composite(bg, Image.new('RGBA', (size, size), (0, 0, 0, 0)), mask)
    img.paste(bg, (0, 0), bg)

    # 2. 彩票卡片
    card_pad = int(size * 0.16)
    card_xy = [card_pad, int(size * 0.18), size - card_pad, int(size * 0.68)]
    draw.rounded_rectangle(card_xy, radius=int(size * 0.05), fill=(255, 255, 255, 245))

    # 卡片内边距
    inner_pad = int(size * 0.06)
    scratch_area = [
        card_xy[0] + inner_pad,
        card_xy[1] + inner_pad + int(size * 0.08),
        card_xy[2] - inner_pad,
        card_xy[3] - inner_pad
    ]

    # 3. 可刮涂层：银灰色底
    coating_color = (192, 192, 198, 255)
    draw.rounded_rectangle(scratch_area, radius=int(size * 0.03), fill=coating_color)

    # 4. 涂层颗粒纹理
    draw_scratch_texture(draw, scratch_area, size, density=0.22)

    # 5. 刮开区域：露出下方中奖符号（金色背景）
    # 左侧刮开区域：星星
    left_reveal = [
        scratch_area[0] + int(size * 0.03),
        scratch_area[1] + int(size * 0.08),
        scratch_area[0] + int(size * 0.28),
        scratch_area[3] - int(size * 0.08)
    ]
    draw.rounded_rectangle(left_reveal, radius=int(size * 0.02), fill=(255, 193, 7, 230))
    draw_star(draw,
              (left_reveal[0] + left_reveal[2]) // 2,
              (left_reveal[1] + left_reveal[3]) // 2,
              int(size * 0.08), fill=(255, 255, 255, 240))

    # 右侧刮开区域：¥ 金币
    right_reveal = [
        scratch_area[2] - int(size * 0.28),
        scratch_area[1] + int(size * 0.08),
        scratch_area[2] - int(size * 0.03),
        scratch_area[3] - int(size * 0.08)
    ]
    draw.rounded_rectangle(right_reveal, radius=int(size * 0.02), fill=(255, 193, 7, 230))
    coin_cx = (right_reveal[0] + right_reveal[2]) // 2
    coin_cy = (right_reveal[1] + right_reveal[3]) // 2
    coin_r = int(size * 0.07)
    draw.ellipse(
        [coin_cx - coin_r, coin_cy - coin_r, coin_cx + coin_r, coin_cy + coin_r],
        fill=(255, 215, 0, 255),
        outline=(255, 160, 0, 255),
        width=max(1, int(size * 0.012))
    )
    try:
        font = ImageFont.truetype("msyh.ttc", int(size * 0.09))
    except:
        font = ImageFont.load_default()
    draw.text((coin_cx, coin_cy), "¥", fill=(180, 100, 0, 255), font=font, anchor="mm")

    # 6. 中间刮痕：几道弯曲的刮开痕迹
    scratch_lines = [
        (scratch_area[0] + int(size * 0.10), scratch_area[1] + int(size * 0.20),
         scratch_area[2] - int(size * 0.10), scratch_area[1] + int(size * 0.20)),
        (scratch_area[0] + int(size * 0.08), scratch_area[1] + int(size * 0.35),
         scratch_area[2] - int(size * 0.08), scratch_area[1] + int(size * 0.32)),
        (scratch_area[0] + int(size * 0.12), scratch_area[1] + int(size * 0.50),
         scratch_area[2] - int(size * 0.12), scratch_area[1] + int(size * 0.48)),
    ]
    for sx1, sy1, sx2, sy2 in scratch_lines:
        draw_scratch_lines(draw, size, (sx1, sy1), (sx2, sy2), width=int(size * 0.018))

    # 7. 卡片标题：LUCKY 字样装饰
    try:
        title_font = ImageFont.truetype("msyh.ttc", int(size * 0.05))
    except:
        title_font = ImageFont.load_default()
    draw.text((size // 2, card_xy[1] + int(size * 0.06)), "LUCKY",
              fill=(255, 140, 0, 220), font=title_font, anchor="mm")

    # 8. 底部装饰：一个小刮刀/硬币图标
    scraper_x = int(size * 0.50)
    scraper_y = int(size * 0.82)
    draw.ellipse(
        [scraper_x - int(size * 0.06), scraper_y - int(size * 0.06),
         scraper_x + int(size * 0.06), scraper_y + int(size * 0.06)],
        fill=(255, 255, 255, 230)
    )
    draw.rectangle(
        [scraper_x + int(size * 0.04), scraper_y - int(size * 0.02),
         scraper_x + int(size * 0.14), scraper_y + int(size * 0.02)],
        fill=(255, 255, 255, 230)
    )

    # 9. 圆形图标裁剪
    if round_icon:
        circle_mask = Image.new('L', (size, size), 0)
        circle_draw = ImageDraw.Draw(circle_mask)
        circle_draw.ellipse([0, 0, size, size], fill=255)
        output = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        output.paste(img, (0, 0), circle_mask)
        return output

    return img


# 生成主图标
master = create_icon(1024, round_icon=False)
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

    square = create_icon(s, round_icon=False)
    square.save(os.path.join(folder_path, 'ic_launcher.png'))

    round_img = create_icon(s, round_icon=True)
    round_img.save(os.path.join(folder_path, 'ic_launcher_round.png'))

# 生成 512x512 商店图标
store = create_icon(512, round_icon=False)
store.save(os.path.join(ANDROID_RES, 'mipmap-xxxhdpi', 'ic_launcher_foreground.png'))

print('Icons regenerated successfully!')
print(f'Public: {PUBLIC_DIR}')
print(f'Android res: {ANDROID_RES}')
