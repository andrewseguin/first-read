import os
import sys
from PIL import Image, ImageDraw

def process_poster(image_path, output_dir):
    os.makedirs(output_dir, exist_ok=True)
    try:
        img = Image.open(image_path).convert("RGB")
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
    
    def find_split(cell_img):
        # Calculate vertical projection to find the best split point
        gray = cell_img.convert("L")
        w, h = gray.size
        
        col_sums = []
        for x in range(w):
            col_sum = 0
            for y in range(h):
                # Only count dark pixels as part of the illustration
                if gray.getpixel((x, y)) < 240:
                    col_sum += 1
            col_sums.append(col_sum)
            
        start_x = int(w * 0.35)
        end_x = int(w * 0.65)
        
        min_sum = float('inf')
        best_x = int(w * 0.5)
        
        for x in range(start_x, end_x):
            # Apply a small moving average to smooth it out (width 5)
            window_sum = sum(col_sums[max(start_x, x-2):min(end_x, x+3)])
            if window_sum < min_sum:
                min_sum = window_sum
                best_x = x
                
        return best_x
    
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
        split_x = find_split(cell)
        
        letter_part = cell.crop((0, 0, split_x, cell.height))
        motion_part = cell.crop((split_x, 0, cell.width, cell.height))
        
        def process_part(part, name):
            # Convert to grayscale to easily find non-white pixels
            gray = part.convert("L")
            # Anything that's bright white (e.g., > 240) becomes 0, else 255.
            # This creates a mask of the illustration.
            mask = gray.point(lambda p: 255 if p < 240 else 0)
            
            # getbbox() works nicely now, giving us the bounds of the non-zero (non-white original) pixels
            bbox = mask.getbbox()
            
            w, h = part.size
            if bbox:
                # Add a safe 2px padding
                l = max(0, bbox[0] - 2)
                u = max(0, bbox[1] - 2)
                r_c = min(w, bbox[2] + 2)
                b_c = min(h, bbox[3] + 2)
                cropped = part.crop((l, u, r_c, b_c))
            else:
                cropped = part
                print(f"Warning: {name} crop failed (completely white?)")
                
            path = os.path.join(output_dir, f"{name}.png")
            cropped.save(path)
            
        process_part(letter_part, f"letter-{letter}")
        process_part(motion_part, f"motion-{letter}")
        print(f"Processed: {letter}")

    print("Extraction complete! 52 high-quality images saved.")

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python extract_poster.py <input.jpg> <output_dir>")
        sys.exit(1)
    process_poster(sys.argv[1], sys.argv[2])
