import os
from PIL import Image, ImageDraw, ImageFilter

def generate_icons():
    icon_src_path = r"C:\Users\Usuario\.gemini\antigravity\brain\b1d419c8-fdbc-46d2-a041-4d3630d7a82f\.user_uploaded\media_1791744977651.jpg"
    if not os.path.exists(icon_src_path):
        icon_src_path = "public/app-icon.png"

    src = Image.open(icon_src_path).convert("RGBA")
    src.save("public/app-icon.png", "PNG")

    def make_adaptive_fg(fg_size):
        bg = src.resize((fg_size, fg_size), Image.Resampling.LANCZOS).filter(
            ImageFilter.GaussianBlur(radius=max(2, fg_size // 24))
        )
        inner_s = int(fg_size * 0.74)
        inner = src.resize((inner_s, inner_s), Image.Resampling.LANCZOS)

        mask = Image.new("L", (inner_s, inner_s), 255)
        draw_m = ImageDraw.Draw(mask)
        border = max(2, int(inner_s * 0.04))
        for i in range(border):
            alpha = int(255 * (i / border))
            draw_m.rectangle([i, i, inner_s - 1 - i, inner_s - 1 - i], outline=alpha)

        ox = (fg_size - inner_s) // 2
        oy = (fg_size - inner_s) // 2
        bg.paste(inner, (ox, oy), mask=mask)
        return bg

    icon_sizes = {
        "mipmap-mdpi": 48,
        "mipmap-hdpi": 72,
        "mipmap-xhdpi": 96,
        "mipmap-xxhdpi": 144,
        "mipmap-xxxhdpi": 192,
    }

    base_dir = r"android\app\src\main\res"

    for folder, s in icon_sizes.items():
        folder_path = os.path.join(base_dir, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path, exist_ok=True)

        # 1. ic_launcher.png (Ícono cuadrado con esquinas suavizadas)
        icon = src.resize((s, s), Image.Resampling.LANCZOS)
        icon.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")

        # 2. ic_launcher_round.png (Ícono circular con ajuste seguro para que no corte el texto)
        fg_temp = make_adaptive_fg(int(s * 1.35))
        crop_m = (fg_temp.width - s) // 2
        round_base = fg_temp.crop((crop_m, crop_m, crop_m + s, crop_m + s))
        mask = Image.new("L", (s, s), 0)
        ImageDraw.Draw(mask).ellipse((0, 0, s - 1, s - 1), fill=255)
        round_icon = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        round_icon.paste(round_base, (0, 0), mask=mask)
        round_icon.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")

        # 3. ic_launcher_foreground.png (Adaptive icon 108dp con zona segura calibrada)
        fg_size = int(s * 1.5)
        fg = make_adaptive_fg(fg_size)
        fg.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")

        print(f"Generated new official app icons for {folder} ({s}x{s})")

    print("All app icons updated successfully with the new official APK icon!")

if __name__ == "__main__":
    generate_icons()
