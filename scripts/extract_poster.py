import sys
import os
try:
    from PIL import Image
except ImportError:
    print("Please install Pillow: pip install Pillow")
    sys.exit(1)

def extract_poster(image_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    try:
        img = Image.open(image_path)
    except Exception as e:
        print(f"Error opening image: {e}")
        sys.exit(1)

    W, H = img.size

    # The poster has an equal grid of 6 columns and 5 rows.
    # We will estimate a small border of around 1.3% horizontally and 1.8% vertically.
    # Adjust these manually if the crop is slightly off.
    margin_x = int(W * 0.013)
    margin_y = int(H * 0.018)

    grid_w = W - 2 * margin_x
    grid_h = H - 2 * margin_y

    cols = 6
    rows = 5

    cell_w = grid_w / cols
    cell_h = grid_h / rows

    for i in range(26):
        r = i // cols
        c = i % cols

        letter = chr(ord('a') + i)

        # Precise cell bounding box
        cell_left = margin_x + c * cell_w
        cell_top = margin_y + r * cell_h
        cell_right = cell_left + cell_w
        cell_bottom = cell_top + cell_h

        # The image is split down the middle of the cell
        # Left ~50% is the letter/animal, right ~50% is the motion
        split_x = cell_left + (cell_w * 0.5)

        letter_img = img.crop((cell_left, cell_top, split_x, cell_bottom))
        motion_img = img.crop((split_x, cell_top, cell_right, cell_bottom))

        # Use an internal padding if desired to remove the yellow grid borders from the final cut
        # We'll just save them as is, and CSS heuristics can center/trim them later.
        
        letter_file = os.path.join(output_dir, f"letter-{letter}.png")
        motion_file = os.path.join(output_dir, f"motion-{letter}.png")
        
        letter_img.save(letter_file)
        motion_img.save(motion_file)
        print(f"[{letter}] -> {letter_file}, {motion_file}")

    print(f"\\nExtraction complete! Saved 52 images to '{output_dir}/'")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_poster.py <path_to_image> [output_directory]")
        print("Example: python extract_poster.py poster.jpg public/extracted")
        sys.exit(1)
    
    img_path = sys.argv[1]
    out_dir = sys.argv[2] if len(sys.argv) > 2 else "public/extracted"
    extract_poster(img_path, out_dir)
