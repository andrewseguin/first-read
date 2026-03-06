import os
import sys
from PIL import Image, ImageDraw

def process_poster(image_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    try:
        img = Image.open(image_path).convert("RGBA")
    except Exception as e:
        print(f"Error reading image: {e}")
        sys.exit(1)
        
    W, H = img.size
    cols, rows = 6, 5
    margin_x = int(W * 0.013)
    margin_y = int(H * 0.018)
    
    grid_w = W - 2 * margin_x
    grid_h = H - 2 * margin_y
    cell_w = grid_w / cols
    cell_h = grid_h / rows
    
    splits = {
        'm': 0.58,
        'w': 0.58,
        'q': 0.55,
        'i': 0.45,
        'n': 0.55,
        'r': 0.55,
        't': 0.45,
    }
    
    for i in range(26):
        r = i // cols
        c = i % cols
        letter = chr(ord('a') + i)
        
        inset_x = int(cell_w * 0.03)
        inset_y = int(cell_h * 0.03)
        x1 = int(margin_x + c * cell_w) + inset_x
        y1 = int(margin_y + r * cell_h) + inset_y
        x2 = int(margin_x + (c + 1) * cell_w) - inset_x
        y2 = int(margin_y + (r + 1) * cell_h) - inset_y
        
        cell = img.crop((x1, y1, x2, y2))
        split_ratio = splits.get(letter, 0.50)
        split_x = int(cell.width * split_ratio)
        
        letter_part = cell.crop((0, 0, split_x, cell.height))
        motion_part = cell.crop((split_x, 0, cell.width, cell.height))
        
        def process_part(part, name):
            # Floodfill from edges replacing white with transparent
            # Need to use ImageDraw.floodfill
            
            # Create a copy to work on
            filled = part.copy()
            w, h = filled.size
            
            # Points to seed the floodfill
            pts = []
            for px in range(0, w, max(1, w//4)):
                pts.extend([(px, 0), (px, h-1)])
            for py in range(0, h, max(1, h//4)):
                pts.extend([(0, py), (w-1, py)])
                
            for pt in pts:
                if pt[0] < w and pt[1] < h:
                    # Only fill if pixel is "white-ish"
                    r_p, g_p, b_p, a_p = filled.getpixel(pt)
                    if r_p > 220 and g_p > 220 and b_p > 220:
                        try:
                            ImageDraw.floodfill(filled, pt, (255, 255, 255, 0), thresh=40)
                        except Exception as e:
                            # If floodfill fails, just skip this point
                            pass

            # Now, find bounding box of non-transparent areas.
            # To use getbbox(), we need the transparent areas to have alph=0
            # getbbox() checks for non-zero pixels. It works on the whole image.
            # If we extract just the alpha channel, getbbox() will give the bounds of non-zero alpha
            alpha = filled.split()[3]
            bbox = alpha.getbbox()
            
            if bbox:
                # bbox is (left, upper, right, lower)
                # Expand by 2px safely
                l = max(0, bbox[0] - 2)
                u = max(0, bbox[1] - 2)
                r_c = min(w, bbox[2] + 2)
                b_c = min(h, bbox[3] + 2)
                cropped = filled.crop((l, u, r_c, b_c))
            else:
                cropped = filled
                print(f"Warning: {name} crop failed (completely transparent?)")
                
            path = os.path.join(output_dir, f"{name}.png")
            cropped.save(path)
            
        process_part(letter_part, f"letter-{letter}")
        process_part(motion_part, f"motion-{letter}")
        print(f"Processed: {letter}")

    print("Extraction complete! 52 high-quality transparent images saved.")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python extract_poster.py <input.jpg> <output_dir>")
        sys.exit(1)
    process_poster(sys.argv[1], sys.argv[2])
