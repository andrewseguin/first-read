import os
import sys
from PIL import Image

def trim_whitespace(input_path, output_path, padding=8):
    try:
        img = Image.open(input_path).convert("RGB")
    except Exception as e:
        print(f"Error reading image {input_path}: {e}")
        return False
        
    # Convert to grayscale to easily find non-white pixels
    gray = img.convert("L")
    
    # Create mask: white pixels (>= 235) become 0, others (the illustration) become 255.
    # Using a slightly aggressive threshold (235) here to tighten up any remaining light-gray artifacts
    # without cutting into the actual drawing.
    mask = gray.point(lambda p: 255 if p < 235 else 0)
    
    # getbbox returns (left, upper, right, lower)
    bbox = mask.getbbox()
    
    if bbox:
        # Add the desired padding
        l = max(0, bbox[0] - padding)
        u = max(0, bbox[1] - padding)
        r = min(img.width, bbox[2] + padding)
        b = min(img.height, bbox[3] + padding)
        
        # Crop the original image
        cropped = img.crop((l, u, r, b))
        cropped.save(output_path)
        return True
    else:
        print(f"Warning: {input_path} crop failed (completely white?)")
        # If it somehow fails, just save the original to prevent data loss
        img.save(output_path)
        return False

def process_directory(directory, padding=8):
    if not os.path.isdir(directory):
        print(f"Error: Directory {directory} not found.")
        sys.exit(1)
        
    count = 0
    for filename in os.listdir(directory):
        if filename.endswith(".png"):
            filepath = os.path.join(directory, filename)
            if trim_whitespace(filepath, filepath, padding):
                count += 1
                
    print(f"Successfully trimmed whitespace on {count} images in {directory} with {padding}px padding.")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python trim_whitespace.py <directory> [padding=8]")
        sys.exit(1)
        
    target_dir = sys.argv[1]
    pad = int(sys.argv[2]) if len(sys.argv) > 2 else 8
    
    process_directory(target_dir, pad)
