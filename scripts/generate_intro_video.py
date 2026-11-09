import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio

def ease_in_out_cubic(t):
    return 4 * t * t * t if t < 0.5 else 1 - math.pow(-2 * t + 2, 3) / 2

def ease_out_quad(t):
    return 1 - (1 - t) * (1 - t)

def smoothstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)

def create_gradient_circle(radius, color_start, color_end, angle_deg=45):
    """Creates a high quality anti-aliased gradient circle with soft edge."""
    size = radius * 2 + 10
    cx, cy = size / 2.0, size / 2.0
    arr = np.zeros((size, size, 4), dtype=np.float32)
    
    rad = math.radians(angle_deg)
    dx = math.cos(rad)
    dy = math.sin(rad)
    
    y_coords, x_coords = np.mgrid[0:size, 0:size]
    dist_from_center = np.sqrt((x_coords - cx) ** 2 + (y_coords - cy) ** 2)
    
    # Smooth anti-aliased boundary
    alpha = np.clip((radius - dist_from_center) + 0.5, 0.0, 1.0)
    
    # Linear projection for gradient along angle
    proj = (x_coords - cx) * dx + (y_coords - cy) * dy
    t_grad = np.clip((proj / radius + 1.0) / 2.0, 0.0, 1.0)
    
    for c in range(3):
        arr[:, :, c] = (1.0 - t_grad) * color_start[c] + t_grad * color_end[c]
    
    arr[:, :, 3] = alpha * 255.0
    return Image.fromarray(arr.astype(np.uint8), mode='RGBA')

def main():
    W, H = 720, 1280
    FPS = 30
    TOTAL_FRAMES = 120 # 4.0 seconds
    
    output_path = 'mobile/assets/videos/intro.mp4'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Load official Circlee symbol
    official_symbol = Image.open('mobile/assets/images/circlee-symbol-square.png')
    
    # Final desired dimensions of the symbol on screen
    final_sym_w = 340
    final_sym_h = int(final_sym_w * (official_symbol.height / official_symbol.width))
    symbol_scaled = official_symbol.resize((final_sym_w, final_sym_h), Image.Resampling.LANCZOS)
    
    # Center coordinates of the emblem on the 720x1280 canvas
    CENTER_X = W // 2 # 360
    CENTER_Y = 560    # 560 gives golden ratio placement with tagline below
    
    # Individual circle definitions (radii and colors based on Circlee brand)
    circle_radius = 88
    # Top circle: Cyan/Electric Blue -> Bright Violet Magenta
    circ_top = create_gradient_circle(circle_radius, (37, 99, 235), (217, 70, 239), angle_deg=90)
    # Bottom Left: Vivid Blue -> Deep Purple/Magenta
    circ_bl = create_gradient_circle(circle_radius, (59, 130, 246), (192, 38, 211), angle_deg=45)
    # Bottom Right: Magenta/Ruby -> Neon Coral Orange
    circ_br = create_gradient_circle(circle_radius, (225, 29, 72), (249, 115, 22), angle_deg=0)
    
    # Final relative resting positions from CENTER_X, CENTER_Y
    # Derived from equilateral triangle geometry matching the official emblem
    REST_TOP = (0, -78)
    REST_BL = (-80, 52)
    REST_BR = (80, 52)
    
    # Starting exploded positions when appearing individually
    START_TOP = (0, -220)
    START_BL = (-220, 160)
    START_BR = (220, 160)
    
    # Load Font for tagline
    font_path = 'C:/Windows/Fonts/seguisb.ttf'
    if not os.path.exists(font_path):
        font_path = 'C:/Windows/Fonts/arial.ttf'
    tagline_font = ImageFont.truetype(font_path, 22)
    tagline_text = "YOUR SPACE. YOUR PEOPLE. YOUR CIRCLE."
    
    writer = imageio.get_writer(
        output_path,
        fps=FPS,
        codec='libx264',
        pixelformat='yuv420p',
        quality=9,
        macro_block_size=None,
        ffmpeg_params=['-movflags', '+faststart']
    )
    
    print(f"Generating cinematic intro video ({TOTAL_FRAMES} frames)...")
    
    for f in range(TOTAL_FRAMES):
        # 1. Base pure black canvas
        frame = Image.new('RGBA', (W, H), (0, 0, 0, 255))
        
        # Timeline milestones
        # Phase 1: Appear individually (frames 10 to 45)
        # Phase 2: Converge and connect (frames 45 to 70)
        # Phase 3: Neon intersection flash & logo lock (frames 65 to 85)
        # Phase 4: Tagline reveal (frames 75 to 105)
        # Phase 5: Fade out (frames 105 to 120)
        
        # --- Individual circle appearance and movement ---
        # Top circle (appears f=10..26, moves f=45..68)
        alpha_top = smoothstep(10, 26, f)
        pos_t_prog = ease_in_out_cubic(smoothstep(45, 68, f))
        cur_top_x = CENTER_X + START_TOP[0] + (REST_TOP[0] - START_TOP[0]) * pos_t_prog
        cur_top_y = CENTER_Y + START_TOP[1] + (REST_TOP[1] - START_TOP[1]) * pos_t_prog
        scale_top = 0.7 + 0.3 * smoothstep(10, 30, f)
        
        # Bottom-Left circle (appears f=18..34, moves f=47..70)
        alpha_bl = smoothstep(18, 34, f)
        pos_bl_prog = ease_in_out_cubic(smoothstep(47, 70, f))
        cur_bl_x = CENTER_X + START_BL[0] + (REST_BL[0] - START_BL[0]) * pos_bl_prog
        cur_bl_y = CENTER_Y + START_BL[1] + (REST_BL[1] - START_BL[1]) * pos_bl_prog
        scale_bl = 0.7 + 0.3 * smoothstep(18, 38, f)
        
        # Bottom-Right circle (appears f=26..42, moves f=49..72)
        alpha_br = smoothstep(26, 42, f)
        pos_br_prog = ease_in_out_cubic(smoothstep(49, 72, f))
        cur_br_x = CENTER_X + START_BR[0] + (REST_BR[0] - START_BR[0]) * pos_br_prog
        cur_br_y = CENTER_Y + START_BR[1] + (REST_BR[1] - START_BR[1]) * pos_br_prog
        scale_br = 0.7 + 0.3 * smoothstep(26, 46, f)
        
        # Global fade out factor for end of video (frames 105..120)
        fade_out = 1.0 - smoothstep(105, 120, f)
        
        # Render circles if before full logo lock (f < 72)
        circles_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        
        if f < 72:
            # Helper to draw a circle with scale and alpha
            def paste_circle(circ, cx, cy, alpha, scale):
                if alpha <= 0.001:
                    return
                w_s = int(circ.width * scale)
                h_s = int(circ.height * scale)
                c_scaled = circ.resize((w_s, h_s), Image.Resampling.LANCZOS)
                c_arr = np.array(c_scaled)
                c_arr[:, :, 3] = (c_arr[:, :, 3].astype(float) * alpha).astype(np.uint8)
                c_final = Image.fromarray(c_arr, mode='RGBA')
                circles_layer.paste(c_final, (int(cx - w_s / 2), int(cy - h_s / 2)), c_final)
            
            paste_circle(circ_top, cur_top_x, cur_top_y, alpha_top * fade_out, scale_top)
            paste_circle(circ_bl, cur_bl_x, cur_bl_y, alpha_bl * fade_out, scale_bl)
            paste_circle(circ_br, cur_br_x, cur_br_y, alpha_br * fade_out, scale_br)
            
            frame = Image.alpha_composite(frame, circles_layer)
        
        # --- Transition to official emblem with neon intersection glow (f >= 58) ---
        if f >= 58:
            # Crossfade progress into the full pristine Circlee symbol
            logo_fade = smoothstep(58, 72, f) * fade_out
            if logo_fade > 0.001:
                sym_arr = np.array(symbol_scaled)
                sym_arr[:, :, 3] = (sym_arr[:, :, 3].astype(float) * logo_fade).astype(np.uint8)
                sym_img = Image.fromarray(sym_arr, mode='RGBA')
                frame.paste(sym_img, (CENTER_X - final_sym_w // 2, CENTER_Y - final_sym_h // 2), sym_img)
        
        # --- Neon energy glow pulse across intersections (f=62..82) ---
        if 62 <= f <= 82:
            glow_prog = math.sin((f - 62) / 20.0 * math.pi) # Peak at f=72
            glow_intensity = glow_prog * 0.75 * fade_out
            
            # Draw radiant radial glow around intersection center
            glow_radius = int(140 + glow_prog * 40)
            glow_surf = Image.new('RGBA', (glow_radius * 2, glow_radius * 2), (0, 0, 0, 0))
            g_draw = ImageDraw.Draw(glow_surf)
            
            # Soft concentric violet/magenta halo
            for r_i in range(glow_radius, 0, -6):
                ratio = r_i / glow_radius
                alpha_i = int((1.0 - ratio) ** 1.8 * 85 * glow_intensity)
                # Violet to magenta blend
                r_c = int(139 + (217 - 139) * (1.0 - ratio))
                g_c = int(92 + (70 - 92) * (1.0 - ratio))
                b_c = int(246 + (239 - 246) * (1.0 - ratio))
                g_draw.ellipse(
                    (glow_radius - r_i, glow_radius - r_i, glow_radius + r_i, glow_radius + r_i),
                    fill=(r_c, g_c, b_c, alpha_i)
                )
            
            # Blend glow behind/around the emblem
            frame.paste(
                glow_surf,
                (CENTER_X - glow_radius, CENTER_Y + 10 - glow_radius),
                glow_surf
            )
            # Re-paste crisp symbol on top of glow
            if f >= 68:
                sym_arr = np.array(symbol_scaled)
                sym_arr[:, :, 3] = (sym_arr[:, :, 3].astype(float) * fade_out).astype(np.uint8)
                sym_crisp = Image.fromarray(sym_arr, mode='RGBA')
                frame.paste(sym_crisp, (CENTER_X - final_sym_w // 2, CENTER_Y - final_sym_h // 2), sym_crisp)
        
        # --- Tagline Display: "YOUR SPACE. YOUR PEOPLE. YOUR CIRCLE." (f >= 74) ---
        if f >= 74:
            tagline_alpha = smoothstep(74, 90, f) * fade_out
            if tagline_alpha > 0.005:
                tagline_surf = Image.new('RGBA', (W, 100), (0, 0, 0, 0))
                t_draw = ImageDraw.Draw(tagline_surf)
                
                # Letter tracking calculation
                tracking = 3
                chars = list(tagline_text)
                total_w = sum(tagline_font.getlength(ch) + tracking for ch in chars) - tracking
                start_x = (W - total_w) / 2.0
                
                # Subtle violet ambient glow behind text
                cur_x = start_x
                for ch in chars:
                    ch_w = tagline_font.getlength(ch)
                    # Glow
                    t_draw.text(
                        (cur_x, 30),
                        ch,
                        font=tagline_font,
                        fill=(168, 85, 247, int(tagline_alpha * 60))
                    )
                    # Crisp text
                    t_draw.text(
                        (cur_x, 30),
                        ch,
                        font=tagline_font,
                        fill=(245, 245, 247, int(tagline_alpha * 240))
                    )
                    cur_x += ch_w + tracking
                
                tag_y = CENTER_Y + final_sym_h // 2 + 50
                frame.paste(tagline_surf, (0, tag_y), tagline_surf)
        
        # Write RGB frame
        frame_rgb = frame.convert('RGB')
        writer.append_data(np.array(frame_rgb))
        
        if (f + 1) % 30 == 0:
            print(f"Rendered {f + 1}/{TOTAL_FRAMES} frames...")
            
    writer.close()
    file_size_kb = os.path.getsize(output_path) / 1024.0
    print(f"Successfully generated {output_path} ({file_size_kb:.1f} KB)")

if __name__ == '__main__':
    main()
