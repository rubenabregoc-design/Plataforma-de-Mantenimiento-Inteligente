import os
from PIL import Image, ImageFilter

def generate_splashes():
    welcome_path = r"C:\Users\Usuario\.gemini\antigravity\brain\b1d419c8-fdbc-46d2-a041-4d3630d7a82f\.user_uploaded\media_1791744183209.png"
    if not os.path.exists(welcome_path):
        welcome_path = "public/splash-welcome.png"

    src = Image.open(welcome_path).convert("RGBA")
    sw, sh = src.size

    def make_portrait(w, h):
        scale = w / sw
        mid_y1, mid_y2 = int(sh * 0.25), int(sh * 0.70)
        mid_h_src = mid_y2 - mid_y1
        mid_h_dst = int(mid_h_src * scale)
        rem_h = h - mid_h_dst
        if rem_h > 40:
            top_h_dst = int(rem_h * (mid_y1 / (sh - mid_h_src)))
            bot_h_dst = rem_h - top_h_dst

            top_part = src.crop((0, 0, sw, mid_y1)).resize((w, top_h_dst), Image.Resampling.LANCZOS)
            mid_part = src.crop((0, mid_y1, sw, mid_y2)).resize((w, mid_h_dst), Image.Resampling.LANCZOS)
            bot_part = src.crop((0, mid_y2, sw, sh)).resize((w, bot_h_dst), Image.Resampling.LANCZOS)

            out = Image.new("RGBA", (w, h))
            out.paste(top_part, (0, 0))
            out.paste(mid_part, (0, top_h_dst))
            out.paste(bot_part, (0, top_h_dst + mid_h_dst))
            return out
        return src.resize((w, h), Image.Resampling.LANCZOS)

    # Guardar versión maestra 9:20 en public/splash-welcome.png para el WebView
    master_web = make_portrait(1080, 2400)
    master_web.save("public/splash-welcome.png", "PNG")
    print("Saved master 1080x2400 public/splash-welcome.png")

    densities = {
        "drawable-port-mdpi": (270, 600),
        "drawable-port-hdpi": (360, 800),
        "drawable-port-xhdpi": (540, 1200),
        "drawable-port-xxhdpi": (720, 1600),
        "drawable-port-xxxhdpi": (1080, 2400),
        "drawable": (720, 1600),
        "drawable-land-mdpi": (600, 270),
        "drawable-land-hdpi": (800, 360),
        "drawable-land-xhdpi": (1200, 540),
        "drawable-land-xxhdpi": (1600, 720),
        "drawable-land-xxxhdpi": (2400, 1080),
    }

    base_dir = r"android\app\src\main\res"

    for folder, (w, h) in densities.items():
        folder_path = os.path.join(base_dir, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path, exist_ok=True)

        is_landscape = w > h

        if not is_landscape:
            out = make_portrait(w, h)
        else:
            bg = src.resize((w, h), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(radius=18))
            mid_crop = src.crop((0, int(sh * 0.23), sw, int(sh * 0.72)))
            target_mid_h = int(h * 0.78)
            scale = target_mid_h / mid_crop.height
            target_mid_w = int(mid_crop.width * scale)
            mid_resized = mid_crop.resize((target_mid_w, target_mid_h), Image.Resampling.LANCZOS)

            out = bg.copy()
            ox = (w - target_mid_w) // 2
            oy = (h - target_mid_h) // 2
            out.paste(mid_resized, (ox, oy), mask=mid_resized)

        out_file = os.path.join(folder_path, "splash.png")
        out.save(out_file, "PNG")
        print(f"Generated welcome splash for {folder} ({w}x{h})")

    print("All welcome splash screens generated successfully!")

if __name__ == "__main__":
    generate_splashes()
