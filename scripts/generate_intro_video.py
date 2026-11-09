import os
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio

def ease_in_out_cubic(t):
    return 4 * t * t * t if t < 0.5 else 1 - math.pow(-2 * t + 2, 3) / 2

def ease_out_cubic(t):
    return 1 - math.pow(1 - t, 3)

def smoothstep(edge0, edge1, x):
    t = max(0.0, min(1.0, (x - edge0) / (edge1 - edge0)))
    return t * t * (3.0 - 2.0 * t)

def create_reference_circle(radius, name):
    """
    Creates an anti-aliased individual circle with the exact cubic polynomial gradient
    fitted directly from the official Circlee brand reference.
    """
    size = int(radius * 2 + 16)
    cx, cy = size / 2.0, size / 2.0
    y, x = np.mgrid[0:size, 0:size]
    dist = np.sqrt((x - cx)**2 + (y - cy)**2)
    alpha = np.clip((radius - dist) + 0.5, 0.0, 1.0)
    
    # Polynomial gradient fits from Circlee reference
    fits = {
        'Top': {
            'deg': 38.0,
            'R': [-1.858e-06, -0.00330, 0.4474, 245.22],
            'G': [-7.553e-09, 1.715e-05, 0.0010, 0.15],
            'B': [3.484e-07, -0.00012, -0.0191, 254.39]
        },
        'BL': {
            'deg': 41.0,
            'R': [-4.784e-06, -0.00224, 0.7559, 211.86],
            'G': [7.732e-08, 1.798e-05, -0.0018, 0.067],
            'B': [-6.036e-07, -0.00016, 0.0062, 255.37]
        },
        'BR': {
            'deg': 36.0,
            'R': [-1.812e-06, 8.199e-05, 0.0131, 253.67],
            'G': [-5.201e-06, 0.00407, 0.1190, -5.64],
            'B': [1.511e-05, -0.00328, -0.8586, 178.83]
        }
    }
    
    cfg = fits[name]
    rad = math.radians(cfg['deg'])
    scale_factor = 211.5 / radius
    proj = ((x - cx) * math.cos(rad) + (y - cy) * math.sin(rad)) * scale_factor
    
    img = np.zeros((size, size, 4), dtype=np.uint8)
    for ch_i, ch in enumerate(['R', 'G', 'B']):
        vals = np.polyval(cfg[ch], proj)
        img[:, :, ch_i] = np.clip(vals, 0, 255).astype(np.uint8)
        
    img[:, :, 3] = (alpha * 255.0).astype(np.uint8)
    return Image.fromarray(img, mode='RGBA')

def main():
    W, H = 720, 1280
    FPS = 30
    TOTAL_FRAMES = 120 # 4.0 seconds
    
    output_path = 'mobile/assets/videos/intro.mp4'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Load official Circlee symbol matching reference
    official_symbol = Image.open('mobile/assets/images/circlee-symbol.png').convert('RGBA')
    
    # Scale symbol to premium cinematic size
    final_sym_w = 360
    final_sym_h = int(final_sym_w * (official_symbol.height / official_symbol.width))
    symbol_scaled = official_symbol.resize((final_sym_w, final_sym_h), Image.Resampling.LANCZOS)
    
    # Center coordinates of the emblem on the 720x1280 canvas
    CENTER_X = W // 2 # 360
    CENTER_Y = 560    # Golden ratio center with room for tagline below
    
    # Exact geometric scale from 1024x1024 canvas to video canvas
    geom_scale = final_sym_w / 1024.0
    circle_radius = int(211.5 * geom_scale) # ~74 px
    
    # Generate high fidelity reference circles
    circ_top = create_reference_circle(circle_radius, 'Top')
    circ_bl = create_reference_circle(circle_radius, 'BL')
    circ_br = create_reference_circle(circle_radius, 'BR')
    
    # Resting positions relative to CENTER_X, CENTER_Y
    # Centroid on 1024x1024 is (507.8, 550.3)
    REST_TOP = (int((509.1 - 507.8) * geom_scale), int((418.9 - 550.3) * geom_scale)) # (0, -46)
    REST_BL  = (int((331.1 - 507.8) * geom_scale), int((616.0 - 550.3) * geom_scale)) # (-62, 23)
    REST_BR  = (int((683.1 - 507.8) * geom_scale), int((616.0 - 550.3) * geom_scale)) # (61, 23)
    
    # Exploded starting positions
    START_TOP = (0, -180)
    START_BL  = (-170, 140)
    START_BR  = (170, 140)
    
    # Typography setup
    font_path = 'C:/Windows/Fonts/seguisb.ttf'
    if not os.path.exists(font_path):
        font_path = 'C:/Windows/Fonts/arial.ttf'
    tagline_font = ImageFont.truetype(font_path, 21)
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
    
    print(f"Generating cinematic reference-matched intro video ({TOTAL_FRAMES} frames)...")
    
    for f in range(TOTAL_FRAMES):
        # 1. Base pure black canvas
        frame = Image.new('RGBA', (W, H), (0, 0, 0, 255))
        
        # Global timeline milestones:
        # Phase 1: Appear individually with scale/glow (frames 8 to 40)
        # Phase 2: Converge towards center with dynamic intersection (frames 42 to 68)
        # Phase 3: Neon intersection bloom & flare peak (frames 64 to 84)
        # Phase 4: Tagline reveal (frames 76 to 104)
        # Phase 5: Smooth fade out (frames 104 to 120)
        
        fade_out = 1.0 - smoothstep(104, 120, f)
        
        # --- Phase 1 & 2: Circles Movement ---
        # Top circle (appears f=8..24, moves f=42..65)
        alpha_top = smoothstep(8, 24, f)
        pos_t_prog = ease_in_out_cubic(smoothstep(42, 65, f))
        cur_top_x = CENTER_X + START_TOP[0] + (REST_TOP[0] - START_TOP[0]) * pos_t_prog
        cur_top_y = CENTER_Y + START_TOP[1] + (REST_TOP[1] - START_TOP[1]) * pos_t_prog
        scale_top = 0.65 + 0.35 * smoothstep(8, 26, f)
        
        # Bottom-Left circle (appears f=16..32, moves f=44..67)
        alpha_bl = smoothstep(16, 32, f)
        pos_bl_prog = ease_in_out_cubic(smoothstep(44, 67, f))
        cur_bl_x = CENTER_X + START_BL[0] + (REST_BL[0] - START_BL[0]) * pos_bl_prog
        cur_bl_y = CENTER_Y + START_BL[1] + (REST_BL[1] - START_BL[1]) * pos_bl_prog
        scale_bl = 0.65 + 0.35 * smoothstep(16, 34, f)
        
        # Bottom-Right circle (appears f=24..40, moves f=46..69)
        alpha_br = smoothstep(24, 40, f)
        pos_br_prog = ease_in_out_cubic(smoothstep(46, 69, f))
        cur_br_x = CENTER_X + START_BR[0] + (REST_BR[0] - START_BR[0]) * pos_br_prog
        cur_br_y = CENTER_Y + START_BR[1] + (REST_BR[1] - START_BR[1]) * pos_br_prog
        scale_br = 0.65 + 0.35 * smoothstep(24, 42, f)
        
        # Render circles during entrance and movement (f < 72)
        if f < 72:
            circles_layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
            
            def paste_circle(circ, cx, cy, alpha, scale):
                if alpha <= 0.001:
                    return
                w_s = max(1, int(circ.width * scale))
                h_s = max(1, int(circ.height * scale))
                c_scaled = circ.resize((w_s, h_s), Image.Resampling.LANCZOS)
                c_arr = np.array(c_scaled)
                c_arr[:, :, 3] = (c_arr[:, :, 3].astype(float) * alpha).astype(np.uint8)
                c_final = Image.fromarray(c_arr, mode='RGBA')
                circles_layer.paste(c_final, (int(cx - w_s / 2), int(cy - h_s / 2)), c_final)
                
            paste_circle(circ_top, cur_top_x, cur_top_y, alpha_top * fade_out, scale_top)
            paste_circle(circ_bl, cur_bl_x, cur_bl_y, alpha_bl * fade_out, scale_bl)
            paste_circle(circ_br, cur_br_x, cur_br_y, alpha_br * fade_out, scale_br)
            
            frame = Image.alpha_composite(frame, circles_layer)
            
        # --- Phase 3: Transition to pristine official emblem (f >= 58) ---
        if f >= 58:
            logo_fade = smoothstep(58, 70, f) * fade_out
            if logo_fade > 0.001:
                sym_arr = np.array(symbol_scaled)
                sym_arr[:, :, 3] = (sym_arr[:, :, 3].astype(float) * logo_fade).astype(np.uint8)
                sym_img = Image.fromarray(sym_arr, mode='RGBA')
                frame.paste(sym_img, (CENTER_X - final_sym_w // 2, CENTER_Y - final_sym_h // 2), sym_img)
                
        # --- Phase 3.5: Neon glow spreads through intersections (f=62..86) ---
        if 62 <= f <= 86:
            # Pulsing bloom curve peaking at f=72
            pulse = math.sin((f - 62) / 24.0 * math.pi)
            glow_intensity = pulse * 0.85 * fade_out
            
            # Radial bloom around intersection center
            glow_radius = int(120 + pulse * 50)
            glow_surf = Image.new('RGBA', (glow_radius * 2, glow_radius * 2), (0, 0, 0, 0))
            g_draw = ImageDraw.Draw(glow_surf)
            
            # Concentric violet-magenta gradient glow
            for r_i in range(glow_radius, 0, -5):
                ratio = r_i / glow_radius
                alpha_i = int((1.0 - ratio)**1.7 * 95 * glow_intensity)
                # Blend violet (#8B5CF6) to magenta (#D946EF)
                r_c = int(139 + (217 - 139) * (1.0 - ratio))
                g_c = int(92 + (70 - 92) * (1.0 - ratio))
                b_c = int(246 + (239 - 246) * (1.0 - ratio))
                g_draw.ellipse(
                    (glow_radius - r_i, glow_radius - r_i, glow_radius + r_i, glow_radius + r_i),
                    fill=(r_c, g_c, b_c, alpha_i)
                )
                
            frame.paste(
                glow_surf,
                (CENTER_X - glow_radius, CENTER_Y - glow_radius),
                glow_surf
            )
            
            # Anamorphic horizontal neon light streak at intersection peak
            if 66 <= f <= 78:
                streak_pulse = math.sin((f - 66) / 12.0 * math.pi)
                streak_w = int(240 * streak_pulse)
                streak_h = 4
                streak = Image.new('RGBA', (streak_w * 2, streak_h * 2), (0, 0, 0, 0))
                s_draw = ImageDraw.Draw(streak)
                s_draw.ellipse(
                    (0, 0, streak_w * 2, streak_h * 2),
                    fill=(236, 72, 153, int(140 * streak_pulse * fade_out))
                )
                streak = streak.filter(ImageFilter.GaussianBlur(radius=3))
                frame.paste(
                    streak,
                    (CENTER_X - streak_w, CENTER_Y - streak_h),
                    streak
                )
                
            # Keep crisp emblem on top of bloom
            if f >= 68:
                sym_arr = np.array(symbol_scaled)
                sym_arr[:, :, 3] = (sym_arr[:, :, 3].astype(float) * fade_out).astype(np.uint8)
                sym_crisp = Image.fromarray(sym_arr, mode='RGBA')
                frame.paste(sym_crisp, (CENTER_X - final_sym_w // 2, CENTER_Y - final_sym_h // 2), sym_crisp)
                
        # --- Phase 4: Tagline: "YOUR SPACE. YOUR PEOPLE. YOUR CIRCLE." (f >= 76) ---
        if f >= 76:
            tagline_alpha = smoothstep(76, 92, f) * fade_out
            if tagline_alpha > 0.005:
                tagline_surf = Image.new('RGBA', (W, 100), (0, 0, 0, 0))
                t_draw = ImageDraw.Draw(tagline_surf)
                
                tracking = 3
                chars = list(tagline_text)
                total_w = sum(tagline_font.getlength(ch) + tracking for ch in chars) - tracking
                start_x = (W - total_w) / 2.0
                
                cur_x = start_x
                for ch in chars:
                    ch_w = tagline_font.getlength(ch)
                    # Ambient glow
                    t_draw.text(
                        (cur_x, 30),
                        ch,
                        font=tagline_font,
                        fill=(168, 85, 247, int(tagline_alpha * 65))
                    )
                    # Crisp text fill
                    t_draw.text(
                        (cur_x, 30),
                        ch,
                        font=tagline_font,
                        fill=(245, 245, 247, int(tagline_alpha * 245))
                    )
                    cur_x += ch_w + tracking
                    
                tag_y = CENTER_Y + final_sym_h // 2 + 50
                frame.paste(tagline_surf, (0, tag_y), tagline_surf)
                
        frame_rgb = frame.convert('RGB')
        writer.append_data(np.array(frame_rgb))
        
        if (f + 1) % 30 == 0:
            print(f"Rendered {f + 1}/{TOTAL_FRAMES} frames...")
            
    writer.close()
    file_size_kb = os.path.getsize(output_path) / 1024.0
    print(f"Successfully generated {output_path} ({file_size_kb:.1f} KB)")

if __name__ == '__main__':
    main()
